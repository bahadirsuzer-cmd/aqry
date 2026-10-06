create table public.social_oauth_requests (
 state_hash text primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 publish_profile_id uuid not null references public.creator_publish_profiles(id) on delete cascade,
 verifier text not null,
 expires_at timestamptz not null
);
create index social_oauth_requests_expiry_idx on public.social_oauth_requests(expires_at);
alter table public.social_oauth_requests enable row level security;
revoke all on public.social_oauth_requests from public, anon, authenticated;
grant all on public.social_oauth_requests to service_role;
create policy "Service manages social OAuth requests" on public.social_oauth_requests to service_role using (true) with check (true);
create table public.social_account_credentials (
 account_id uuid primary key references public.social_accounts(id) on delete cascade,
 access_token text not null,
 refresh_token text
);
alter table public.social_account_credentials enable row level security;
revoke all on public.social_account_credentials from public, anon, authenticated;
grant all on public.social_account_credentials to service_role;
create policy "Service manages social credentials" on public.social_account_credentials to service_role using (true) with check (true);
comment on table public.social_account_credentials is 'Server-only OAuth credentials. Never grant browser roles access.';
comment on table public.social_oauth_requests is 'Server-only short-lived PKCE requests. State is hashed, callback consumes it once.';
