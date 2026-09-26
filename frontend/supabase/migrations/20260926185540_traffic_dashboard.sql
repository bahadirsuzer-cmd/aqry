-- AQRYO traffic dashboard. Apply to the AQRYO Supabase project before deploying the UI.
create schema if not exists aqryo_traffic_private;
revoke all on schema aqryo_traffic_private from public, anon, authenticated;

create table if not exists aqryo_traffic_private.traffic_owner (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users(id) on delete cascade
);
alter table aqryo_traffic_private.traffic_owner enable row level security;
revoke all on aqryo_traffic_private.traffic_owner from public, anon, authenticated;

create table if not exists public.site_page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visitor_id uuid not null,
  session_id uuid not null,
  path text not null check (length(path) between 1 and 160),
  referrer_host text,
  source text,
  device text not null check (device in ('mobile', 'desktop'))
);
create index if not exists site_page_views_created_at_idx on public.site_page_views (created_at desc);
alter table public.site_page_views enable row level security;
revoke all on public.site_page_views from public, anon, authenticated;

create or replace function public.is_traffic_owner()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from aqryo_traffic_private.traffic_owner where user_id = (select auth.uid()));
$$;
revoke all on function public.is_traffic_owner() from public;
grant execute on function public.is_traffic_owner() to anon, authenticated;

create or replace function public.track_site_page_view(
  p_visitor_id uuid, p_session_id uuid, p_path text,
  p_referrer_host text default null, p_source text default null, p_device text default 'desktop'
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_visitor_id is null or p_session_id is null or p_path is null or
     length(p_path) not between 1 and 160 or left(p_path, 1) <> '/' or
     p_device not in ('mobile', 'desktop') then return; end if;
  if (select public.is_traffic_owner()) then return; end if;
  insert into public.site_page_views (visitor_id, session_id, path, referrer_host, source, device)
  values (p_visitor_id, p_session_id, p_path, left(p_referrer_host, 120), left(p_source, 60), p_device);
end;
$$;
revoke all on function public.track_site_page_view(uuid, uuid, text, text, text, text) from public;
grant execute on function public.track_site_page_view(uuid, uuid, text, text, text, text) to anon, authenticated;

create or replace function public.get_traffic_dashboard(p_days integer default 30)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if not (select public.is_traffic_owner()) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_days is null or p_days not in (7, 30, 90) then
    raise exception 'Invalid period' using errcode = '22023';
  end if;

  with recent as (
    select * from public.site_page_views
    where created_at >= (((now() at time zone 'Europe/Istanbul')::date - (p_days - 1))::timestamp at time zone 'Europe/Istanbul')
  ), days as (
    select ((now() at time zone 'Europe/Istanbul')::date - n)::date as day
    from generate_series(0, p_days - 1) n
  )
  select jsonb_build_object(
    'views', (select count(*) from recent),
    'visitors', (select count(distinct visitor_id) from recent),
    'sessions', (select count(distinct session_id) from recent),
    'daily', (select coalesce(jsonb_agg(jsonb_build_object('day', d.day, 'views', coalesce(v.views, 0), 'visitors', coalesce(v.visitors, 0)) order by d.day), '[]'::jsonb)
      from days d left join lateral (select count(*) views, count(distinct visitor_id) visitors from recent r where (r.created_at at time zone 'Europe/Istanbul')::date = d.day) v on true),
    'pages', (select coalesce(jsonb_agg(jsonb_build_object('path', path, 'views', views)), '[]'::jsonb)
      from (select path, count(*) views from recent group by path order by views desc limit 10) p),
    'sources', (select coalesce(jsonb_agg(jsonb_build_object('source', source_name, 'views', views)), '[]'::jsonb)
      from (select coalesce(nullif(source, ''), nullif(referrer_host, ''), 'Doğrudan') source_name, count(*) views from recent group by 1 order by views desc limit 10) s),
    'devices', (select coalesce(jsonb_agg(jsonb_build_object('device', device, 'views', views)), '[]'::jsonb)
      from (select device, count(*) views from recent group by device order by views desc) d)
  ) into result;
  return result;
end;
$$;
revoke all on function public.get_traffic_dashboard(integer) from public, anon;
grant execute on function public.get_traffic_dashboard(integer) to authenticated;
