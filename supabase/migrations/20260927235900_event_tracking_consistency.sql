-- AQRYO production hardening: align public event tracking with table constraints.

drop policy if exists "Anyone can record published experience events" on public.experience_events;

create policy "Anyone can record published experience events"
on public.experience_events
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.experiences e
    where e.id = experience_events.experience_id
      and e.status = 'published'
  )
  and char_length(trim(participant_id)) between 8 and 100
  and (session_id is null or char_length(session_id) <= 100)
  and (source is null or char_length(source) <= 100)
  and octet_length(coalesce(metadata, '{}'::jsonb)::text) <= 8192
  and (
    event_type not in ('gift_purchased', 'offer_purchased')
    or (
      order_id is not null
      and exists (
        select 1
        from public.orders o
        where o.id = experience_events.order_id
          and o.experience_id = experience_events.experience_id
          and o.participant_key = experience_events.participant_id
      )
    )
  )
);

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
    'checkout_started',
    'gift_selected',
    'share',
    'gift_purchased',
    'offer_purchased'
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
  returning id into v_event_id;

  return v_event_id;
end;
$function$;
