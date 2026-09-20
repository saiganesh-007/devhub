create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

create table if not exists public.collection_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  entity_type text not null check(entity_type in ('developer', 'repository')),
  entity_identifier text not null check(char_length(entity_identifier) between 1 and 180),
  created_at timestamptz not null default now(),
  unique(collection_id, entity_type, entity_identifier)
);

create table if not exists public.research_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check(entity_type in ('developer', 'repository')),
  entity_identifier text not null check(char_length(entity_identifier) between 1 and 180),
  note text not null check(char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, entity_type, entity_identifier)
);

create table if not exists public.history_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check(event_type in ('search', 'view', 'comparison')),
  entity_type text check(entity_type in ('developer', 'repository')),
  entity_identifier text not null check(char_length(entity_identifier) between 1 and 180),
  secondary_identifier text check(char_length(secondary_identifier) between 1 and 180),
  label text check(char_length(label) <= 180),
  metadata jsonb not null default '{}',
  occurred_at timestamptz not null default now()
);

create index if not exists collections_user_idx on public.collections(user_id, updated_at desc);
create index if not exists collection_items_user_idx on public.collection_items(user_id, collection_id, created_at desc);
create index if not exists research_notes_user_idx on public.research_notes(user_id, updated_at desc);
create index if not exists history_events_user_idx on public.history_events(user_id, occurred_at desc);
create unique index if not exists history_events_dedupe_idx on public.history_events(user_id, event_type, coalesce(entity_type, ''), lower(entity_identifier), lower(coalesce(secondary_identifier, '')));

alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.research_notes enable row level security;
alter table public.history_events enable row level security;

revoke all on public.collections, public.collection_items, public.research_notes, public.history_events from anon, authenticated;
grant select, insert, update, delete on public.collections, public.collection_items, public.research_notes to authenticated;
grant select, insert, update, delete on public.history_events to authenticated;

create policy "collections own rows" on public.collections for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "collection items own rows" on public.collection_items for all to authenticated
  using ((select auth.uid()) = user_id and exists (select 1 from public.collections c where c.id = collection_id and c.user_id = (select auth.uid())))
  with check ((select auth.uid()) = user_id and exists (select 1 from public.collections c where c.id = collection_id and c.user_id = (select auth.uid())));
create policy "research notes own rows" on public.research_notes for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "history events own rows" on public.history_events for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
