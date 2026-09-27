-- AQRYO production hardening: prevent anonymous state changes and moderation abuse.

drop policy if exists "Public can update experiences" on public.experiences;
create policy "Creators can update own experiences"
on public.experiences
for update
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

create or replace function public.submit_experience_feedback(
  p_experience_id uuid,
  p_participant_key text,
  p_verdict text,
  p_reason text default null::text
)
returns table(total_count bigint, negative_count bigint, paused boolean)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_total bigint;
  v_negative bigint;
begin
  if p_participant_key is null
     or length(trim(p_participant_key)) < 16
     or length(trim(p_participant_key)) > 100 then
    raise exception 'invalid participant key';
  end if;

  if p_verdict not in ('appropriate', 'inappropriate') then
    raise exception 'invalid verdict';
  end if;

  if p_verdict = 'appropriate' then
    p_reason := null;
  elsif p_reason is not null and p_reason not in (
    'harassment', 'sexual', 'fraud', 'hate', 'violence', 'other'
  ) then
    raise exception 'invalid reason';
  end if;

  if not exists (
    select 1
    from public.experiences
    where id = p_experience_id
      and status = 'published'
  ) then
    raise exception 'experience not available';
  end if;

  insert into public.experience_feedback (
    experience_id,
    participant_key,
    verdict,
    reason
  )
  values (
    p_experience_id,
    trim(p_participant_key),
    p_verdict,
    p_reason
  )
  on conflict (experience_id, participant_key)
  do update set
    verdict = case
      when public.experience_feedback.verdict = 'inappropriate'
        then 'inappropriate'
      else excluded.verdict
    end,
    reason = case
      when public.experience_feedback.verdict = 'inappropriate'
        then public.experience_feedback.reason
      else excluded.reason
    end,
    updated_at = now();

  select
    count(*)::bigint,
    count(*) filter (where verdict = 'inappropriate')::bigint
  into v_total, v_negative
  from public.experience_feedback
  where experience_id = p_experience_id;

  -- Public feedback never changes publication state directly.
  -- Moderation actions remain admin-only.
  return query
  select v_total, v_negative, false;
end;
$function$;

create or replace function public.track_experience_event(
  p_experience_id uuid,
  p_event_type text,
  p_participant_id text,
  p_session_id text default null::text,
  p_order_id uuid default null::uuid,
  p_source text default null::text,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_event_id uuid;
  v_creator_id uuid;
begin
  if p_experience_id is null then
    raise exception 'Experience required';
  end if;

  if p_participant_id is null
     or char_length(trim(p_participant_id)) < 8
     or char_length(trim(p_participant_id)) > 100 then
    raise exception 'Participant required';
  end if;

  if p_session_id is not null and char_length(p_session_id) > 100 then
    raise exception 'Invalid session';
  end if;

  if p_source is not null and char_length(p_source) > 100 then
    raise exception 'Invalid source';
  end if;

  if octet_length(coalesce(p_metadata, '{}'::jsonb)::text) > 8192 then
    raise exception 'Metadata too large';
  end if;

  if p_event_type not in (
    'view',
    'start',
    'result_viewed',
    'offer_viewed',
    'offer_checkout_started',
    'offer_purchased',
    'gift_selected',
    'gift_checkout_started',
    'gift_purchased',
    'experience_shared'
  ) then
    raise exception 'Invalid event type';
  end if;

  select creator_id
  into v_creator_id
  from public.experiences
  where id = p_experience_id
    and status = 'published';

  if not found then
    raise exception 'Experience not available';
  end if;

  if p_event_type in ('offer_purchased', 'gift_purchased')
     and p_order_id is null then
    raise exception 'Order required for purchase event';
  end if;

  if p_order_id is not null then
    if not exists (
      select 1
      from public.orders o
      where o.id = p_order_id
        and o.experience_id = p_experience_id
        and o.participant_key = trim(p_participant_id)
    ) then
      raise exception 'Invalid order for event';
    end if;
  end if;

  insert into public.experience_events (
    experience_id,
    event_type,
    participant_id,
    creator_id,
    session_id,
    order_id,
    source,
    metadata
  )
  values (
    p_experience_id,
    p_event_type,
    trim(p_participant_id),
    v_creator_id,
    nullif(trim(coalesce(p_session_id, '')), ''),
    p_order_id,
    nullif(trim(coalesce(p_source, '')), ''),
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id
  into v_event_id;

  return v_event_id;
end;
$function$;
