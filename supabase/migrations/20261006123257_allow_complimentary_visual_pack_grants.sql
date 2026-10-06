alter table public.visual_pack_orders drop constraint visual_pack_orders_amount_minor_check;
alter table public.visual_pack_orders add constraint visual_pack_orders_amount_minor_check check (
  amount_minor > 0 or (
    amount_minor = 0 and coalesce(transaction_id, '') = 'admin_grant:' || user_id::text || ':' || pack_id
  )
);
comment on constraint visual_pack_orders_amount_minor_check on public.visual_pack_orders is 'Paid orders require positive amounts. Complimentary administrative grants use amount 0 and an explicit admin_grant:<user_id>:<pack_id> identifier, never a Paddle transaction.';
