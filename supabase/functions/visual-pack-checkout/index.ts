import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const allowedOrigins = new Set(["https://aqryo.com", "https://www.aqryo.com", "http://localhost:5173"]);
const paddlePrices: Record<string, string> = {
  anime: "pri_01m4836qgmhwf660152jre819f",
  magic: "pri_01m483gaf7f1k8x49tmzcgkggp",
  arena: "pri_01m483nvtkjcdzvwf8cd6y36kc",
};

const makeBundlePrice = (amount: number) => ({
    description: "AQRYO visual pack bundle — one-time access",
    name: "3 packs · 90 visuals",
    unit_price: { amount: String(amount), currency_code: "USD" },
    tax_mode: "internal", billing_cycle: null, trial_period: null,
    product: { name: "AQRYO — Anime + Magic Academy + Fighting Arena", tax_category: "standard", description: "Permanent access to all three visual packs within AQRYO: 90 digital templates. Existing owned packs are credited." },
});

let bundleCheck: { expires: number; pending: Promise<boolean> } | null = null;
async function bundleAvailable(apiKey: string): Promise<boolean> {
  if (bundleCheck && bundleCheck.expires > Date.now()) return bundleCheck.pending;
  const pending = (async () => {
    try {
      const checks = await Promise.all([199, 100].map(async (amount) => {
        const response = await fetch("https://api.paddle.com/transactions/preview", {
          method: "POST", headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json", "Paddle-Version": "1" },
          body: JSON.stringify({ currency_code: "USD", items: [{ quantity: 1, price: makeBundlePrice(amount) }] }),
          signal: AbortSignal.timeout(10000),
        });
        const result = await response.json();
        const price = result.data?.items?.[0]?.price;
        if (!response.ok) console.error("Bundle price preview rejected", response.status, result.error?.code ?? "unknown");
        return response.ok && result.data?.items?.length === 1 && price?.unit_price?.amount === String(amount) &&
          price?.unit_price?.currency_code === "USD" && price?.tax_mode === "internal" && price?.billing_cycle === null && price?.trial_period === null;
      }));
      return checks.every(Boolean);
    } catch { return false; }
  })();
  bundleCheck = { expires: Date.now() + 300000, pending };
  return pending;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  const headers: Record<string, string> = {
    "content-type": "application/json", "cache-control": "no-store", "vary": "Origin",
    "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
    "access-control-allow-methods": "GET, POST, OPTIONS",
  };
  if (allowedOrigins.has(origin)) headers["access-control-allow-origin"] = origin;
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  if (origin && !allowedOrigins.has(origin)) return json({ error: "origin_not_allowed" }, 403);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (!["GET", "POST"].includes(req.method)) return json({ error: "method_not_allowed" }, 405);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const apiKey = Deno.env.get("PADDLE_API_KEY");
  const configured = Boolean(apiKey && Deno.env.get("PADDLE_WEBHOOK_SECRET"));
  const { data: packs, error: catalogError } = await admin.from("visual_pack_catalog")
    .select("id,name,amount_minor,currency,sale_enabled").order("sort_order");
  if (catalogError) return json({ error: "catalog_unavailable" }, 503);
  if (req.method === "GET") {
    const bundleReady = configured && packs?.some((pack) => pack.id === "bundle" && pack.sale_enabled)
      ? await bundleAvailable(apiKey!) : false;
    return json({ checkout_configured: configured,
      packs: (packs ?? []).map((pack) => ({ ...pack, checkout_available: configured && pack.sale_enabled && (pack.id !== "bundle" || bundleReady) })),
    });
  }

  // Authenticate every purchase independently; never accept a user ID from the browser.
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "unauthorized" }, 401);
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth.user || auth.user.is_anonymous) return json({ error: "unauthorized" }, 401);
  let body: { pack_id?: string };
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const pack = packs?.find((entry) => entry.id === body.pack_id);
  if (!pack) return json({ error: "unknown_pack" }, 400);
  const priceId = paddlePrices[pack.id];
  if (!priceId && pack.id !== "bundle") return json({ error: "checkout_not_ready" }, 503);

  const { data: owned, error: ownedError } = await admin.from("visual_pack_orders").select("id")
    .eq("user_id", auth.user.id).in("pack_id", [pack.id, "bundle"]).eq("status", "completed").limit(1);
  if (ownedError) return json({ error: "access_check_failed" }, 503);
  if (owned?.length) return json({ already_owned: true, pack_id: pack.id });
  if (!configured || !pack.sale_enabled) return json({ error: "checkout_not_ready" }, 503);

  // A short lock window prevents double clicks from creating parallel purchases.
  const { data: claim, error: claimError } = await admin.rpc("reserve_visual_pack_order", {
    p_user_id: auth.user.id, p_pack_id: pack.id,
  });
  if (claimError) return json({ error: "order_unavailable" }, 503);
  if (claim.already_owned) return json({ already_owned: true, pack_id: pack.id });
  if (claim.transaction_id) return json({ order_id: claim.order_id, transaction_id: claim.transaction_id });
  if (!claim.claimed) return json({ error: "checkout_preparing" }, 409);

  const amount = Number(claim.amount_minor ?? pack.amount_minor);
  if (pack.id === "bundle" && ![100, 199].includes(amount)) return json({ error: "invalid_bundle_price" }, 503);
  const bundlePrice = makeBundlePrice(amount);

  try {
    // Use the reviewed one-time catalog prices, never the archived Pro subscription.
    const response = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json", "Paddle-Version": "1" },
      body: JSON.stringify({
        collection_mode: "automatic", currency_code: pack.currency,
        custom_data: { aqryo_order_id: claim.order_id, aqryo_pack: pack.id },
        items: [pack.id === "bundle" ? { quantity: 1, price: bundlePrice } : { quantity: 1, price_id: priceId }],
        checkout: { url: "https://www.aqryo.com/puzzle-builder" },
      }),
      signal: AbortSignal.timeout(20000),
    });
    const result = await response.json();
    const item = result.data?.items?.[0];
    const validPrice = result.data?.items?.length === 1 && item?.quantity === 1 &&
      (pack.id === "bundle" ? item.price?.type === "custom" && item.price?.name === bundlePrice.name : item.price?.id === priceId) && item.price?.unit_price?.amount === String(amount) &&
      item.price?.unit_price?.currency_code === pack.currency && item.price?.tax_mode === "internal" &&
      item.price?.billing_cycle === null && item.price?.trial_period === null &&
      result.data?.currency_code === pack.currency && !result.data?.subscription_id;
    if (!response.ok || !result.data?.id || !validPrice) {
      console.error("Paddle pack checkout rejected", response.status, result.error?.code ?? "unknown");
      await admin.from("visual_pack_orders").update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", claim.order_id).eq("status", "pending");
      return json({ error: "payment_provider_unavailable" }, 502);
    }
    const { error: saveError } = await admin.from("visual_pack_orders").update({
      transaction_id: result.data.id, updated_at: new Date().toISOString(),
    }).eq("id", claim.order_id).eq("status", "pending");
    if (saveError) return json({ error: "order_save_failed" }, 503);
    return json({ order_id: claim.order_id, transaction_id: result.data.id });
  } catch (error) {
    console.error("Pack checkout request failed", error instanceof Error ? error.name : "unknown");
    // Keep uncertain requests pending: a retry must not immediately create a second charge.
    return json({ error: "payment_provider_unavailable" }, 503);
  }
});
