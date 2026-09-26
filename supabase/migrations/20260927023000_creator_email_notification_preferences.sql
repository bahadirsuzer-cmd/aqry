create table if not exists public.creator_notification_preferences (
  creator_id uuid primary key references auth.users(id) on delete cascade,
  email_enabled boolean not null default true,
  push_enabled boolean not null default true,
  email_cooldown_minutes integer not null default 15 check (email_cooldown_minutes between 1 and 1440),
  last_email_sent_at timestamptz,
  suppressed_email_count integer not null default 0 check (suppressed_email_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.creator_notification_preferences enable row level security;

drop policy if exists "Creators can read own notification preferences" on public.creator_notification_preferences;
create policy "Creators can read own notification preferences"
on public.creator_notification_preferences
for select to authenticated
using (creator_id = (select auth.uid()));

drop policy if exists "Creators can create own notification preferences" on public.creator_notification_preferences;
create policy "Creators can create own notification preferences"
on public.creator_notification_preferences
for insert to authenticated
with check (creator_id = (select auth.uid()));

drop policy if exists "Creators can update own notification preferences" on public.creator_notification_preferences;
create policy "Creators can update own notification preferences"
on public.creator_notification_preferences
for update to authenticated
using (creator_id = (select auth.uid()))
with check (creator_id = (select auth.uid()));

create index if not exists creator_notification_preferences_last_email_idx
  on public.creator_notification_preferences(last_email_sent_at);
