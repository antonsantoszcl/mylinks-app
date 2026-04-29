-- ============================================================
-- MyLinks – Dashboards Migration
-- Run in Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- Dashboards table
create table if not exists public.dashboards (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  title      text not null,
  is_default boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.dashboards enable row level security;

create policy "Users manage own dashboards"
  on public.dashboards for all using (auth.uid() = user_id);

-- Add dashboard_id to categories
alter table public.categories
  add column if not exists dashboard_id uuid references public.dashboards(id) on delete cascade;

-- Create default dashboard for each existing user and migrate their categories
do $$
declare
  rec     record;
  dash_id uuid;
begin
  for rec in select id from public.profiles loop
    -- Check if user already has a default dashboard
    select id into dash_id
      from public.dashboards
     where user_id = rec.id and is_default = true
     limit 1;

    if dash_id is null then
      insert into public.dashboards (user_id, title, is_default, sort_order)
      values (rec.id, 'Principal', true, 0)
      returning id into dash_id;
    end if;

    -- Migrate orphan categories to default dashboard
    update public.categories
       set dashboard_id = dash_id
     where user_id = rec.id and dashboard_id is null;
  end loop;
end;
$$;

-- Update handle_new_user trigger to also create a default dashboard on signup
create or replace function public.handle_new_user()
returns trigger as $$
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

  -- Create default dashboard for the new user
  insert into public.dashboards (user_id, title, is_default, sort_order)
  values (new.id, 'Principal', true, 0);

  return new;
end;
$$ language plpgsql security definer;
