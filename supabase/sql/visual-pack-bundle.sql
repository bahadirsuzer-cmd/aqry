-- Additive bundle catalog entry; existing single-pack prices and orders stay intact.
begin;
alter table public.visual_pack_catalog drop constraint visual_pack_catalog_id_check;
alter table public.visual_pack_catalog add constraint visual_pack_catalog_id_check check (id in ('anime','magic','arena','bundle'));
insert into public.visual_pack_catalog(id,name,amount_minor,currency,sale_enabled,sort_order)
values ('bundle','Anime + Magic Academy + Fighting Arena',199,'USD',false,4)
on conflict(id) do nothing;

create or replace function public.reserve_visual_pack_order(p_user_id uuid,p_pack_id text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare r public.visual_pack_orders; c public.visual_pack_catalog; owned_count integer; amount integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':visual-packs',0));
 select * into c from public.visual_pack_catalog where id=p_pack_id and sale_enabled;
 if not found then raise exception 'pack_not_for_sale'; end if;
 if exists(select 1 from public.visual_pack_orders where user_id=p_user_id and status='completed' and pack_id in (p_pack_id,'bundle')) then
  return jsonb_build_object('already_owned',true);
 end if;
 amount := c.amount_minor;
 if p_pack_id='bundle' then
  select count(distinct pack_id) into owned_count from public.visual_pack_orders
   where user_id=p_user_id and status='completed' and pack_id in ('anime','magic','arena');
  if owned_count=3 then return jsonb_build_object('already_owned',true); end if;
  if owned_count=2 then raise exception 'buy_remaining_single_pack'; end if;
  amount := c.amount_minor - owned_count * 99;
 end if;
 select * into r from public.visual_pack_orders where user_id=p_user_id and pack_id=p_pack_id
  and status in ('pending','failed') order by created_at desc limit 1;
 if found and r.transaction_id is not null then
  if r.amount_minor <> amount then raise exception 'existing_checkout_price_changed'; end if;
  return jsonb_build_object('claimed',false,'order_id',r.id,'transaction_id',r.transaction_id,'amount_minor',r.amount_minor);
 elsif found and r.updated_at>now()-interval '2 minutes' then
  return jsonb_build_object('claimed',false,'order_id',r.id,'amount_minor',r.amount_minor);
 end if;
 if exists(select 1 from public.visual_pack_orders where user_id=p_user_id and status='pending'
  and updated_at>now()-interval '2 minutes' and pack_id<>p_pack_id and (p_pack_id='bundle' or pack_id='bundle')) then
  raise exception 'another_checkout_preparing';
 end if;
 insert into public.visual_pack_orders(user_id,pack_id,amount_minor,currency)
  values(p_user_id,p_pack_id,amount,c.currency) returning * into r;
 return jsonb_build_object('claimed',true,'order_id',r.id,'amount_minor',r.amount_minor);
end $$;
revoke all on function public.reserve_visual_pack_order(uuid,text) from public,anon,authenticated;
grant execute on function public.reserve_visual_pack_order(uuid,text) to service_role;
commit;
