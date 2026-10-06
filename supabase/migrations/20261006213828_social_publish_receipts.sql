create table public.social_publish_receipts (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 account_id uuid references public.social_accounts(id) on delete set null,
 experience_id uuid references public.experiences(id) on delete set null,
 text text not null,
 status text not null default 'pending' check (status in ('pending','published','failed','uncertain')),
 post_id text,
 created_at timestamptz not null default now()
);
create index social_publish_receipts_user_created_idx on public.social_publish_receipts(user_id,created_at desc);
alter table public.social_publish_receipts enable row level security;
revoke all on public.social_publish_receipts from public,anon,authenticated;
grant select on public.social_publish_receipts to authenticated;
grant all on public.social_publish_receipts to service_role;
create policy "Creators read own social publications" on public.social_publish_receipts for select to authenticated using ((select auth.uid())=user_id);
create policy "Service manages social publications" on public.social_publish_receipts to service_role using (true) with check (true);
