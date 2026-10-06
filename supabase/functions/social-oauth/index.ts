import { admin, callbackUrl, capabilities, cors, hash, random, scopes, userFor } from "../_shared/social.ts";

Deno.serve(async req => {
  const headers = cors(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  const url = new URL(req.url);
  const db = admin();
  try {
    // Top-level navigation sets a first-party cookie before redirecting to X.
    // This binds the callback to the browser that started the flow, including on Safari.
    const start = url.searchParams.get("authorize");
    if (req.method === "GET" && start) {
      const { data, error } = await db.from("social_oauth_requests").select("verifier,expires_at").eq("state_hash", await hash(start)).single();
      if (error || !data || Date.parse(data.expires_at) <= Date.now()) return new Response("Bağlantı süresi doldu. AQRYO üzerinden tekrar dene.", { status: 400, headers });
      if (!capabilities()[0].ready) return new Response("X uygulama bağlantısı hazır değil.", { status: 503, headers });
      const params = new URLSearchParams({ client_id: Deno.env.get("X_CLIENT_ID")!, response_type: "code", redirect_uri: callbackUrl(), scope: scopes, state: start, code_challenge: await hash(data.verifier), code_challenge_method: "S256" });
      return new Response(null, { status: 302, headers: { "Location": `https://x.com/i/oauth2/authorize?${params}`, "Cache-Control": "no-store", "Set-Cookie": `__Host-aqryo-social=${start}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600` } });
    }
    // Read-only readiness flags contain no credentials or account information.
    if (req.method === "GET" && url.searchParams.get("action") === "status") return Response.json({ channels: capabilities() }, { headers });
    const user = await userFor(req);
    if (!user) return Response.json({ error: "Oturum gerekli." }, { status: 401, headers });
    if (req.method !== "POST") return Response.json({ error: "POST isteği gerekli." }, { status: 405, headers });
    const body = await req.json();
    if (body.platform !== "x" || !capabilities()[0].ready) return Response.json({ error: capabilities().find(item => item.platform === body.platform)?.reason || "Desteklenmeyen kanal." }, { status: 503, headers });
    const { data: profile } = await db.from("creator_publish_profiles").select("id").eq("id", body.profileId).eq("creator_id", user.id).maybeSingle();
    if (!profile) return Response.json({ error: "Yayın profili bulunamadı." }, { status: 404, headers });
    await db.from("social_oauth_requests").delete().lt("expires_at", new Date().toISOString());
    const state = random();
    const { error } = await db.from("social_oauth_requests").insert({ state_hash: await hash(state), user_id: user.id, publish_profile_id: profile.id, verifier: random(), expires_at: new Date(Date.now() + 600000).toISOString() });
    if (error) throw error;
    return Response.json({ url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/social-oauth?authorize=${encodeURIComponent(state)}` }, { headers });
  } catch { return Response.json({ error: "Bağlantı başlatılamadı. Lütfen tekrar dene." }, { status: 500, headers }); }
});
