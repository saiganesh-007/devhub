create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorite_developers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  github_username text not null,
  developer_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  unique(user_id, github_username)
);

create table if not exists public.favorite_repositories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  github_repo_id bigint not null,
  owner text not null,
  repo_name text not null,
  full_name text not null,
  description text,
  stars integer not null default 0,
  language text,
  created_at timestamptz not null default now(),
  unique(user_id, github_repo_id)
);

create table if not exists public.recent_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check(entity_type in ('developer', 'repository')),
  entity_identifier text not null,
  metadata jsonb not null default '{}',
  viewed_at timestamptz not null default now()
);

create index if not exists favorite_developers_user_idx on public.favorite_developers(user_id, created_at desc);
create index if not exists favorite_repositories_user_idx on public.favorite_repositories(user_id, created_at desc);
create index if not exists recent_views_user_idx on public.recent_views(user_id, viewed_at desc);

alter table public.profiles enable row level security;
alter table public.favorite_developers enable row level security;
alter table public.favorite_repositories enable row level security;
alter table public.recent_views enable row level security;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.favorite_developers to authenticated;
grant select, insert, update, delete on public.favorite_repositories to authenticated;
grant select, insert, update, delete on public.recent_views to authenticated;

create policy "profiles own rows" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy "developer favourites own rows" on public.favorite_developers
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "repository favourites own rows" on public.favorite_repositories
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "recent views own rows" on public.recent_views
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, display_name, avatar_url)
  values(new.id, new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
