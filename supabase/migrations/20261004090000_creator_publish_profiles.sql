create table if not exists public.creator_publish_profiles (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creator_publish_profiles_creator_id_idx
  on public.creator_publish_profiles (creator_id, created_at desc);

alter table public.creator_publish_profiles enable row level security;

drop policy if exists "Creators can read own publish profiles" on public.creator_publish_profiles;
create policy "Creators can read own publish profiles"
on public.creator_publish_profiles for select to authenticated
using (creator_id = auth.uid());

drop policy if exists "Creators can create own publish profiles" on public.creator_publish_profiles;
create policy "Creators can create own publish profiles"
on public.creator_publish_profiles for insert to authenticated
with check (creator_id = auth.uid());

drop policy if exists "Creators can update own publish profiles" on public.creator_publish_profiles;
create policy "Creators can update own publish profiles"
on public.creator_publish_profiles for update to authenticated
using (creator_id = auth.uid()) with check (creator_id = auth.uid());

drop policy if exists "Creators can delete own publish profiles" on public.creator_publish_profiles;
create policy "Creators can delete own publish profiles"
on public.creator_publish_profiles for delete to authenticated
using (creator_id = auth.uid());
