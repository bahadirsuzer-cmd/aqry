-- All fixture writes and payment events are rolled back; no real charge or entitlement is created.
begin;
update public.visual_pack_catalog set sale_enabled=true where id='bundle';
do $$
declare u uuid; claim jsonb; oid uuid; event jsonb; result jsonb;
begin
 select id into u from auth.users a where not exists(select 1 from public.visual_pack_orders o where o.user_id=a.id) limit 1;
 if u is null then raise exception 'No clean fixture user available'; end if;
 claim := public.reserve_visual_pack_order(u,'bundle');
 assert (claim->>'amount_minor')::integer=199, 'New buyer must pay 199';
 oid := (claim->>'order_id')::uuid;
 assert (public.reserve_visual_pack_order(u,'bundle')->>'claimed')::boolean=false, 'Double click must reuse order';
 update public.visual_pack_orders set transaction_id='aqryo_bundle_test_rollback' where id=oid;
 event := jsonb_build_object('event_id','aqryo_bundle_test_complete','event_type','transaction.completed','occurred_at',now(),
   'data',jsonb_build_object('id','aqryo_bundle_test_rollback','status','completed','currency_code','USD','subscription_id',null,
   'custom_data',jsonb_build_object('aqryo_order_id',oid,'aqryo_pack','bundle'),
   'items',jsonb_build_array(jsonb_build_object('quantity',1,'price',jsonb_build_object('unit_price',jsonb_build_object('amount','199','currency_code','USD'),'billing_cycle',null)))));
 result := public.process_visual_pack_event(event);
 assert (select status='completed' from public.visual_pack_orders where id=oid), 'Completed webhook must unlock bundle';
 assert (public.reserve_visual_pack_order(u,'anime')->>'already_owned')::boolean, 'Bundle must own anime';
 assert (public.reserve_visual_pack_order(u,'magic')->>'already_owned')::boolean, 'Bundle must own magic';
 assert (public.reserve_visual_pack_order(u,'arena')->>'already_owned')::boolean, 'Bundle must own arena';
 assert (public.process_visual_pack_event(event)->>'duplicate')::boolean, 'Repeated webhook must be idempotent';
 result := public.process_visual_pack_event(jsonb_build_object('event_id','aqryo_bundle_test_refund','event_type','adjustment.updated','occurred_at',now(),
  'data',jsonb_build_object('transaction_id','aqryo_bundle_test_rollback','status','approved','action','refund','type','full')));
 assert (select status='refunded' from public.visual_pack_orders where id=oid), 'Full refund must revoke bundle';
 event := jsonb_set(event,'{event_id}','"aqryo_bundle_test_late_complete"');
 result := public.process_visual_pack_event(event);
 assert (select status='refunded' from public.visual_pack_orders where id=oid), 'Late completion cannot undo refund';
 insert into public.visual_pack_orders(user_id,pack_id,amount_minor,currency,status) values(u,'anime',99,'USD','completed');
 claim := public.reserve_visual_pack_order(u,'bundle');
 assert (claim->>'amount_minor')::integer=100, 'Owned single must receive 99 credit';
 update public.visual_pack_orders set status='canceled' where id=(claim->>'order_id')::uuid;
 insert into public.visual_pack_orders(user_id,pack_id,amount_minor,currency,status) values(u,'magic',99,'USD','completed');
 begin
  perform public.reserve_visual_pack_order(u,'bundle');
  raise exception 'Two-pack owner must use remaining single';
 exception when raise_exception then
  if sqlerrm<>'buy_remaining_single_pack' then raise; end if;
 end;
 assert (public.reserve_visual_pack_order(u,'anime')->>'already_owned')::boolean, 'Refund must preserve separately owned singles';
end $$;
rollback;
