import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const allowedOrigins = new Set(["https://aqryo.com", "https://www.aqryo.com", "http://localhost:5173"]);

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
  if (req.method === "GET") return json({
    checkout_configured: configured,
    packs: (packs ?? []).map((pack) => ({ ...pack, checkout_available: configured && pack.sale_enabled })),
  });

  // Authenticate every purchase independently; never accept a user ID from the browser.
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "unauthorized" }, 401);
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth.user || auth.user.is_anonymous) return json({ error: "unauthorized" }, 401);
  let body: { pack_id?: string };
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const pack = packs?.find((entry) => entry.id === body.pack_id);
  if (!pack) return json({ error: "unknown_pack" }, 400);

  const { data: owned, error: ownedError } = await admin.from("visual_pack_orders").select("id")
    .eq("user_id", auth.user.id).eq("pack_id", pack.id).eq("status", "completed").limit(1);
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

  try {
    // Non-catalog one-time prices avoid reusing the monthly Pro subscription price.
    const response = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json", "Paddle-Version": "1" },
      body: JSON.stringify({
        collection_mode: "automatic", currency_code: pack.currency,
        custom_data: { aqryo_order_id: claim.order_id, aqryo_pack: pack.id },
        items: [{ quantity: 1, price: {
          description: `AQRYO ${pack.name}: 30 visuals, permanent access`,
          name: "One-time purchase", billing_cycle: null, trial_period: null,
          tax_mode: "internal", unit_price: { amount: String(pack.amount_minor), currency_code: pack.currency },
          product: { name: `AQRYO ${pack.name}`, description: "10 Single + 10 Couple + 10 Scene puzzle visuals. Permanent access in AQRYO.",
            tax_category: Deno.env.get("PADDLE_PACK_TAX_CATEGORY") ?? "digital-goods" },
        } }],
        checkout: { url: "https://www.aqryo.com/puzzle-builder" },
      }),
      signal: AbortSignal.timeout(20000),
    });
    const result = await response.json();
    if (!response.ok || !result.data?.id) {
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
