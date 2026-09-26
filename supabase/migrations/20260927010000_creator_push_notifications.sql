create table if not exists public.creator_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.creator_push_subscriptions enable row level security;

drop policy if exists "Creators can read own push subscriptions" on public.creator_push_subscriptions;
create policy "Creators can read own push subscriptions"
on public.creator_push_subscriptions
for select
to authenticated
using (creator_id = auth.uid());

drop policy if exists "Creators can create own push subscriptions" on public.creator_push_subscriptions;
create policy "Creators can create own push subscriptions"
on public.creator_push_subscriptions
for insert
to authenticated
with check (creator_id = auth.uid());

drop policy if exists "Creators can update own push subscriptions" on public.creator_push_subscriptions;
create policy "Creators can update own push subscriptions"
on public.creator_push_subscriptions
for update
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

drop policy if exists "Creators can delete own push subscriptions" on public.creator_push_subscriptions;
create policy "Creators can delete own push subscriptions"
on public.creator_push_subscriptions
for delete
to authenticated
using (creator_id = auth.uid());

create table if not exists public.push_notification_deliveries (
  event_id text primary key,
  creator_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.push_notification_deliveries enable row level security;
