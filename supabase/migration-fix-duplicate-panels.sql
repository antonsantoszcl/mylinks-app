-- ============================================================
-- MyLinks – Fix: Duplicate "Principal" / "Contatos" panels
-- Run in Supabase Dashboard > SQL Editor > New Query > Run
-- Safe to run more than once (idempotent).
-- ============================================================

-- STEP 1: For any user with more than one default ("Principal") dashboard,
-- keep the one with the most linked categories (oldest as tie-breaker),
-- move any categories from the duplicates onto the keeper, then remove
-- the duplicate rows.
do $fix_default$
declare
  rec       record;
  keeper_id uuid;
begin
  for rec in
    select user_id
      from public.dashboards
     where is_default = true
     group by user_id
    having count(*) > 1
  loop
    select d.id into keeper_id
      from public.dashboards d
     where d.user_id = rec.user_id and d.is_default = true
     order by (select count(*) from public.categories c where c.dashboard_id = d.id) desc,
              d.created_at asc
     limit 1;

    update public.categories
       set dashboard_id = keeper_id
     where user_id = rec.user_id
       and dashboard_id in (
         select id from public.dashboards
          where user_id = rec.user_id and is_default = true and id <> keeper_id
       );

    delete from public.dashboards
     where user_id = rec.user_id and is_default = true and id <> keeper_id;
  end loop;
end;
$fix_default$;

-- STEP 2: For any user with more than one "Contatos" panel, keep the oldest
-- and remove the rest (contacts data is keyed by user_id, not dashboard_id,
-- so this is safe).
do $fix_contacts$
declare
  rec       record;
  keeper_id uuid;
begin
  for rec in
    select user_id
      from public.dashboards
     where is_contacts = true
     group by user_id
    having count(*) > 1
  loop
    select id into keeper_id
      from public.dashboards
     where user_id = rec.user_id and is_contacts = true
     order by created_at asc
     limit 1;

    delete from public.dashboards
     where user_id = rec.user_id and is_contacts = true and id <> keeper_id;
  end loop;
end;
$fix_contacts$;

-- STEP 3: Prevent this from ever happening again — enforce it at the
-- database level so no client-side race condition can create duplicates.
create unique index if not exists dashboards_one_default_per_user
  on public.dashboards (user_id) where is_default = true;

create unique index if not exists dashboards_one_contacts_per_user
  on public.dashboards (user_id) where is_contacts = true;

-- STEP 4: Make the signup trigger idempotent too (belt-and-suspenders).
create or replace function public.handle_new_user()
returns trigger as $handle_new_user$
declare
  base_username  text;
  final_username text;
  suffix         int := 0;
begin
  base_username := lower(
    regexp_replace(
      coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
      '[^a-z0-9_]', '_', 'g'
    )
  );

  final_username := base_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  -- Create default dashboard for the new user (idempotent: relies on the
  -- unique partial index created in STEP 3 above).
  insert into public.dashboards (user_id, title, is_default, sort_order)
  values (new.id, 'Principal', true, 0)
  on conflict do nothing;

  return new;
end;
$handle_new_user$ language plpgsql security definer;
