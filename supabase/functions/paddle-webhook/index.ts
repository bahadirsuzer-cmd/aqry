import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const raw = await req.text();
  const signature = req.headers.get("paddle-signature") ?? "";
  const secret = Deno.env.get("PADDLE_WEBHOOK_SECRET");
  if (!secret) return json({ error: "webhook_secret_not_configured" }, 503);

  const parts = Object.fromEntries(signature.split(";").map((p) => {
    const [k, ...v] = p.trim().split("=");
    return [k, v.join("=")];
  }));
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1 || !/^\d+$/.test(ts)) return json({ error: "invalid_signature" }, 401);
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return json({ error: "stale_signature" }, 401);

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ts + ":" + raw));
  const expected = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const a = new TextEncoder().encode(expected);
  const b = new TextEncoder().encode(h1.toLowerCase());
  if (a.length !== b.length) return json({ error: "invalid_signature" }, 401);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  if (diff !== 0) return json({ error: "invalid_signature" }, 401);

  let event: any;
  try { event = JSON.parse(raw); } catch { return json({ error: "invalid_json" }, 400); }

  const eventType = String(event?.event_type ?? "");
  const data = event?.data ?? {};
  const allowed = new Set([
    "transaction.canceled",
    "adjustment.created",
    "adjustment.updated",
    "transaction.completed",
    "transaction.payment_failed",
    "subscription.activated",
    "subscription.canceled",
    "subscription.past_due",
    "subscription.paused",
    "subscription.resumed",
    "subscription.updated",
  ]);
  if (!allowed.has(eventType)) return json({ ok: true, ignored: true });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "supabase_not_configured" }, 503);
  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // Bind pack access to server-created orders; duplicates and refunds are handled atomically.
  const { data: packResult, error: packError } = await admin.rpc("process_visual_pack_event", { p_event: event });
  if (packError) { console.error("Pack event processing failed", packError.code); return json({ error: "pack_event_processing_failed" }, 500); }
  if (packResult?.handled) return json({ ok: true });

  const subscriptionId = String(data?.id ?? data?.subscription_id ?? "");
  if (!subscriptionId && eventType.startsWith("subscription.")) return json({ error: "missing_subscription_id" }, 400);

  if (eventType.startsWith("subscription.")) {
    const customData = data?.custom_data ?? {};
    const userId = typeof customData?.user_id === "string" ? customData.user_id : null;
    const item = Array.isArray(data?.items) ? data.items[0] : null;
    const row = {
      subscription_id: subscriptionId,
      customer_id: data?.customer_id ?? null,
      user_id: userId,
      status: data?.status ?? eventType.split(".")[1],
      price_id: item?.price?.id ?? item?.price_id ?? null,
      product_id: item?.price?.product_id ?? item?.product_id ?? null,
      current_period_end: data?.current_billing_period?.ends_at ?? null,
      canceled_at: data?.canceled_at ?? null,
      event_type: eventType,
      event_occurred_at: event?.occurred_at ?? null,
      raw: event,
      updated_at: new Date().toISOString(),
    };
    const { error } = await admin.from("paddle_subscriptions").upsert(row, { onConflict: "subscription_id" });
    if (error) return json({ error: "db_error" }, 500);
  } else if (eventType === "transaction.completed" && data?.subscription_id) {
    const { error } = await admin.from("paddle_subscriptions").update({
      status: "active",
      event_type: eventType,
      event_occurred_at: event?.occurred_at ?? null,
      raw: event,
      updated_at: new Date().toISOString(),
    }).eq("subscription_id", data.subscription_id);
    if (error) return json({ error: "db_error" }, 500);
  } else if (eventType === "transaction.payment_failed" && data?.subscription_id) {
    const { error } = await admin.from("paddle_subscriptions").update({
      status: "past_due",
      event_type: eventType,
      event_occurred_at: event?.occurred_at ?? null,
      raw: event,
      updated_at: new Date().toISOString(),
    }).eq("subscription_id", data.subscription_id);
    if (error) return json({ error: "db_error" }, 500);
  }

  return json({ ok: true });
});
