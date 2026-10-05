-- One-time visual packs. Launch stays disabled until Paddle checkout is verified.
create table public.visual_pack_catalog (
 id text primary key check (id in ('anime','magic','arena')),
 name text not null,
 amount_minor integer not null check (amount_minor > 0),
 currency text not null check (currency = 'USD'),
 sale_enabled boolean not null default false,
 sort_order integer not null
);
insert into public.visual_pack_catalog (id,name,amount_minor,currency,sort_order) values
 ('anime','Anime',99,'USD',1),('magic','Magic Academy',99,'USD',2),('arena','Fighting Arena',99,'USD',3);
alter table public.visual_pack_catalog enable row level security;
revoke all on public.visual_pack_catalog from anon, authenticated;
grant select on public.visual_pack_catalog to anon, authenticated;
grant all on public.visual_pack_catalog to service_role;
create policy visual_pack_catalog_read on public.visual_pack_catalog for select to anon, authenticated using (true);

create table public.visual_pack_orders (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 pack_id text not null references public.visual_pack_catalog(id),
 amount_minor integer not null check (amount_minor > 0),
 currency text not null check (currency = 'USD'),
 status text not null default 'pending' check (status in ('pending','completed','failed','canceled','refunded')),
 transaction_id text unique,
 event_occurred_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index visual_pack_orders_user_pack_idx on public.visual_pack_orders(user_id,pack_id,status);
alter table public.visual_pack_orders enable row level security;
revoke all on public.visual_pack_orders from anon, authenticated;
grant select on public.visual_pack_orders to authenticated;
grant all on public.visual_pack_orders to service_role;
create policy visual_pack_orders_owner_read on public.visual_pack_orders for select to authenticated using ((select auth.uid()) = user_id);

create table public.visual_pack_payment_events (
 event_id text primary key,
 order_id uuid not null references public.visual_pack_orders(id) on delete cascade,
 event_type text not null,
 occurred_at timestamptz not null,
 payload jsonb not null,
 created_at timestamptz not null default now()
);
create index visual_pack_payment_events_order_idx on public.visual_pack_payment_events(order_id);
alter table public.visual_pack_payment_events enable row level security;
revoke all on public.visual_pack_payment_events from anon, authenticated;
grant all on public.visual_pack_payment_events to service_role;

create function public.reserve_visual_pack_order(p_user_id uuid,p_pack_id text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare r public.visual_pack_orders; c public.visual_pack_catalog;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_pack_id,0));
 select * into c from public.visual_pack_catalog where id=p_pack_id and sale_enabled;
 if not found then raise exception 'pack_not_for_sale'; end if;
 if exists(select 1 from public.visual_pack_orders where user_id=p_user_id and pack_id=p_pack_id and status='completed') then
  return jsonb_build_object('already_owned',true);
 end if;
 select * into r from public.visual_pack_orders where user_id=p_user_id and pack_id=p_pack_id
  and status in ('pending','failed') order by created_at desc limit 1;
 if found and r.transaction_id is not null then
  return jsonb_build_object('claimed',false,'order_id',r.id,'transaction_id',r.transaction_id);
 elsif found and r.updated_at>now()-interval '2 minutes' then
  return jsonb_build_object('claimed',false,'order_id',r.id);
 end if;
 insert into public.visual_pack_orders(user_id,pack_id,amount_minor,currency)
  values(p_user_id,p_pack_id,c.amount_minor,c.currency) returning * into r;
 return jsonb_build_object('claimed',true,'order_id',r.id);
end $$;
revoke all on function public.reserve_visual_pack_order(uuid,text) from public,anon,authenticated;
grant execute on function public.reserve_visual_pack_order(uuid,text) to service_role;

create function public.process_visual_pack_event(p_event jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 d jsonb := p_event->'data';
 et text := p_event->>'event_type';
 eid text := p_event->>'event_id';
 txn text;
 r public.visual_pack_orders;
 at_time timestamptz;
 item jsonb;
 next_status text;
begin
 if et not in ('transaction.completed','transaction.payment_failed','transaction.canceled','adjustment.created','adjustment.updated') then
  return jsonb_build_object('handled',false);
 end if;
 txn := case when et like 'adjustment.%' then d->>'transaction_id' else d->>'id' end;
 select * into r from public.visual_pack_orders where transaction_id=txn for update;
 if not found then
  -- Known AQRYO pack transactions must be retried if order binding is temporarily unavailable.
  if coalesce(d->'custom_data'->>'aqryo_order_id','') <> '' then raise exception 'pack_order_not_bound'; end if;
  return jsonb_build_object('handled',false);
 end if;
 if eid is null or p_event->>'occurred_at' is null then raise exception 'missing_event_identity'; end if;
 at_time := (p_event->>'occurred_at')::timestamptz;
 if et='transaction.completed' then
  item := d->'items'->0;
  if d->>'status' is distinct from 'completed' or d->>'currency_code' is distinct from r.currency
   or d->>'subscription_id' is not null or jsonb_array_length(d->'items')<>1
   or item->>'quantity' is distinct from '1'
   or item->'price'->'unit_price'->>'amount' is distinct from r.amount_minor::text
   or item->'price'->'unit_price'->>'currency_code' is distinct from r.currency
   or coalesce(item->'price'->'billing_cycle','null'::jsonb)<>'null'::jsonb
   or d->'custom_data'->>'aqryo_order_id' is distinct from r.id::text
   or d->'custom_data'->>'aqryo_pack' is distinct from r.pack_id then
   raise exception 'invalid_pack_transaction';
  end if;
  next_status := 'completed';
 elsif et like 'adjustment.%' then
  if d->>'status'='approved' and ((d->>'action'='refund' and d->>'type'='full') or d->>'action'='chargeback') then
   next_status := 'refunded';
  end if;
 elsif et='transaction.payment_failed' then next_status := 'failed';
 elsif et='transaction.canceled' then next_status := 'canceled';
 end if;
 insert into public.visual_pack_payment_events(event_id,order_id,event_type,occurred_at,payload)
  values(eid,r.id,et,at_time,p_event) on conflict(event_id) do nothing;
 if not found then return jsonb_build_object('handled',true,'duplicate',true); end if;
 -- Refunds always prevail. Failed/late events never undo a completed payment.
 if next_status='refunded' or (next_status='completed' and r.status<>'refunded')
  or (next_status in ('failed','canceled') and r.status not in ('completed','refunded')
      and (r.event_occurred_at is null or at_time>r.event_occurred_at)) then
  update public.visual_pack_orders set status=next_status,
   event_occurred_at=greatest(at_time,coalesce(r.event_occurred_at,at_time)),updated_at=now() where id=r.id;
 end if;
 return jsonb_build_object('handled',true,'order_id',r.id);
end $$;
revoke all on function public.process_visual_pack_event(jsonb) from public,anon,authenticated;
grant execute on function public.process_visual_pack_event(jsonb) to service_role;
