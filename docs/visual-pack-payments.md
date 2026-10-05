# One-time visual pack purchases

Anime, Magic Academy and Fighting Arena each cost USD 0.99, including tax. Each purchase unlocks the pack's 10 Single, 10 Couple and 10 Scene templates permanently. Prices and user identity come from the server, not checkout input. The existing Pro subscription is separate and its webhook handling is preserved.

## Current release state

The three packs have `sale_enabled = false`. Existing signed-in creators retain launch access. Checkout returns `checkout_not_ready` until the live Paddle API key is configured and launch is enabled. No real charge has been made by these implementation tests.

The original 90 assets were copied to the private `visual-packs` Storage bucket and verified against SHA-256 hashes. The builder gets signed URLs through `visual-pack-assets`; static originals are removed from the current website. Assets already downloaded or cached before this change cannot be recalled. Signed URLs expire after five minutes.

## Paddle configuration before activating sales

1. Store a live server-side `PADDLE_API_KEY` in the project's Edge Function secrets. At minimum it needs `transaction.write` for non-catalog, non-recurring transactions. Never put it in a `VITE_*` variable or source control.
2. Keep the existing `PADDLE_WEBHOOK_SECRET`. The existing webhook URL is `https://hburwzezggdgxuissjej.supabase.co/functions/v1/paddle-webhook`.
3. In Paddle, verify this destination receives `transaction.completed`, `transaction.payment_failed`, `transaction.canceled`, `adjustment.created` and `adjustment.updated`, while preserving its current subscription events.
4. Enable the appropriate `digital-goods` tax category in Paddle. `PADDLE_PACK_TAX_CATEGORY` may override it only if the replacement accurately describes the product.
5. Ensure `https://www.aqryo.com/puzzle-builder` is an approved checkout URL. Checkout uses the existing live client-side token but never the monthly Pro price.
6. With these settings in place, verify a draft transaction shows USD 0.99 inclusive of tax, quantity one and no billing cycle. Verify a completed test payment opens the intended pack after webhook confirmation, survives signing in again, and does not open other packs. Verify a full approved refund revokes access. Account-specific Paddle permissions and notification subscriptions remain unverified until the server key is provided.
7. Only after verification, enable sales with `update public.visual_pack_catalog set sale_enabled = true;`. This changes launch access into an ownership check. If the API key later expires, paid access remains restricted and existing purchases continue to work.

## Payment processing

- `reserve_visual_pack_order` serializes checkout creation for each user and pack, reuses pending/failed checkout transactions and prevents another purchase of an owned pack.
- `process_visual_pack_event` grants access only for a verified completed transaction bound to a server-created order. It checks the pack binding, quantity, currency, unit price and absence of a subscription/billing cycle.
- Duplicate events are ignored atomically. Late failed events cannot undo a completed payment. Approved full refunds and chargebacks take precedence over completed events.
- Clients can only read their own orders. They cannot insert orders, edit payment state or invoke privileged payment functions. Payment event payloads are only accessible to the service role.
- A browser checkout event or success URL triggers polling; neither grants access.

## Validation performed

- Production client/SSR build passed.
- Webhook harness: missing/bad signatures rejected, pack events routed atomically, subscription activation/completion/failure preserved, database errors returned as retryable failures.
- Database transactions: duplicate events, checkout reservation, duplicate purchases, delayed failure, full refund and delayed completion after refund.
- RLS: cross-user order reads blocked and customer payment-state writes rejected.
- Disposable account API checks: invalid origin/unknown pack rejected; no-purchase access denied when sales are enabled; all 30 templates opened after a simulated purchase; repeat checkout returned already-owned; full refund denied future URLs.
- All 90 signed asset downloads matched the source hashes and allowed image CORS. Public bucket access was denied.
- Disposable account and synthetic orders/events were deleted. Temporary transfer/test handlers were removed from the deployed function.
- The repository-wide TypeScript check has existing failures outside this change; a pre-existing undefined `UNDETERMINED_SHORT` in the touched puzzle route was fixed. Real Paddle checkout cannot be exercised without the server key.

Run the webhook regression harness from the repository root:

```sh
node supabase/tests/paddle-webhook.cjs
```
