alter table public.social_accounts
  add column if not exists publish_profile_id uuid references public.creator_publish_profiles(id) on delete cascade;

create index if not exists social_accounts_publish_profile_id_idx
  on public.social_accounts (publish_profile_id);

drop policy if exists "Service can insert social accounts" on public.social_accounts;
create policy "Service can insert social accounts"
on public.social_accounts for insert to service_role
with check (true);

drop policy if exists "Service can update social accounts" on public.social_accounts;
create policy "Service can update social accounts"
on public.social_accounts for update to service_role
using (true) with check (true);
