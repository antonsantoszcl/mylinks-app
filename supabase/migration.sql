-- ============================================================
-- MyLinks – Full Database Migration
-- Run in Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles ─────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                uuid references auth.users on delete cascade primary key,
  username          text unique not null,
  display_name      text not null default '',
  avatar_url        text not null default '',
  tagline           text not null default '',
  bio               text not null default '',
  contact_email     text not null default '',
  contact_phone     text not null default '',
  areas_of_interest jsonb not null default '[]'::jsonb,
  tools             jsonb not null default '[]'::jsonb,
  created_at        timestamptz default now()
);

alter table public.profiles enable row level security;

-- Public can read any profile (needed for /[username] page)
create policy "profiles_select_public"
  on public.profiles for select using (true);

create policy "profiles_insert_own"
  on public.profiles for insert with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete using (auth.uid() = id);

-- ── Categories ───────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references auth.users on delete cascade not null,
  title      text not null default '',
  icon_name  text not null default 'Folder',
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;

create policy "categories_select_own"
  on public.categories for select using (auth.uid() = user_id);

create policy "categories_insert_own"
  on public.categories for insert with check (auth.uid() = user_id);

create policy "categories_update_own"
  on public.categories for update using (auth.uid() = user_id);

create policy "categories_delete_own"
  on public.categories for delete using (auth.uid() = user_id);

-- ── Links ────────────────────────────────────────────────────────────────────
create table if not exists public.links (
  id          uuid default uuid_generate_v4() primary key,
  category_id uuid references public.categories on delete cascade not null,
  user_id     uuid references auth.users on delete cascade not null,
  title       text not null default '',
  url         text not null default '',
  icon_url    text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz default now()
);

alter table public.links enable row level security;

create policy "links_select_own"
  on public.links for select using (auth.uid() = user_id);

create policy "links_insert_own"
  on public.links for insert with check (auth.uid() = user_id);

create policy "links_update_own"
  on public.links for update using (auth.uid() = user_id);

create policy "links_delete_own"
  on public.links for delete using (auth.uid() = user_id);

-- ── Quick Access ─────────────────────────────────────────────────────────────
create table if not exists public.quick_access (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references auth.users on delete cascade not null,
  title      text not null default '',
  url        text not null default '',
  icon_url   text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

alter table public.quick_access enable row level security;

create policy "quick_access_select_own"
  on public.quick_access for select using (auth.uid() = user_id);

create policy "quick_access_insert_own"
  on public.quick_access for insert with check (auth.uid() = user_id);

create policy "quick_access_update_own"
  on public.quick_access for update using (auth.uid() = user_id);

create policy "quick_access_delete_own"
  on public.quick_access for delete using (auth.uid() = user_id);

-- ── Public Links ─────────────────────────────────────────────────────────────
create table if not exists public.public_links (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references auth.users on delete cascade not null,
  title      text not null default '',
  url        text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

alter table public.public_links enable row level security;

-- Public page can read any user's public links
create policy "public_links_select_all"
  on public.public_links for select using (true);

create policy "public_links_insert_own"
  on public.public_links for insert with check (auth.uid() = user_id);

create policy "public_links_update_own"
  on public.public_links for update using (auth.uid() = user_id);

create policy "public_links_delete_own"
  on public.public_links for delete using (auth.uid() = user_id);

-- ── Social Links ─────────────────────────────────────────────────────────────
create table if not exists public.social_links (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references auth.users on delete cascade not null,
  platform   text not null default '',
  handle     text not null default '',
  url        text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

alter table public.social_links enable row level security;

-- Public page can read any user's social links
create policy "social_links_select_all"
  on public.social_links for select using (true);

create policy "social_links_insert_own"
  on public.social_links for insert with check (auth.uid() = user_id);

create policy "social_links_update_own"
  on public.social_links for update using (auth.uid() = user_id);

create policy "social_links_delete_own"
  on public.social_links for delete using (auth.uid() = user_id);

-- ── Trigger: auto-create profile on signup ───────────────────────────────────
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

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
