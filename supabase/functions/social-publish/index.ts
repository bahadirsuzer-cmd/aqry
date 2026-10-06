import { admin, capabilities, cors, userFor, xToken } from "../_shared/social.ts";

Deno.serve(async req => {
  const headers = cors(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return Response.json({ error: "POST isteği gerekli." }, { status: 405, headers });
  const db = admin();
  let receiptId: string | null = null;
  let submitted = false;
  try {
    const user = await userFor(req);
    if (!user) return Response.json({ error: "Oturum gerekli." }, { status: 401, headers });
    if (!capabilities()[0].ready) return Response.json({ error: "X uygulama bağlantısı henüz hazır değil." }, { status: 503, headers });
    const body = await req.json();
    if (body.confirmed !== true || !/^[0-9a-f-]{36}$/i.test(body.requestId ?? "") || typeof body.text !== "string" || !body.text.trim() || [...body.text].length > 110) return Response.json({ error: "Gönderi onayı ve en fazla 110 karakterlik metin gerekli." }, { status: 400, headers });
    const [{ data: account }, { data: content }] = await Promise.all([
      db.from("social_accounts").select("id,status,scopes,token_expires_at").eq("id", body.accountId).eq("user_id", user.id).eq("platform", "x").eq("publish_profile_id", body.profileId).maybeSingle(),
      db.from("experiences").select("id,type").eq("id", body.experienceId).eq("creator_id", user.id).eq("status", "published").maybeSingle(),
    ]);
    if (!account || account.status !== "connected" || !account.scopes.includes("tweet.write") || !content || !["compatibility","question_confession","story"].includes(content.type)) return Response.json({ error: "Bağlı hesap veya yayındaki içerik doğrulanamadı." }, { status: 403, headers });
    const { data: previous } = await db.from("social_publish_receipts").select("status,post_id").eq("id", body.requestId).eq("user_id", user.id).maybeSingle();
    if (previous) return Response.json(previous.status === "published" ? { url: "https://x.com/i/status/" + previous.post_id } : { error: "Bu gönderi daha önce işleme alındı. Tekrar göndermeden X hesabını kontrol et." }, { status: previous.status === "published" ? 200 : 409, headers });
    const { count } = await db.from("social_publish_receipts").select("id", { count: "exact", head: true }).eq("user_id", user.id).gt("created_at", new Date(Date.now() - 60000).toISOString());
    if ((count ?? 0) >= 3) return Response.json({ error: "Bir dakika bekleyip tekrar dene." }, { status: 429, headers });
    const { data: credentials } = await db.from("social_account_credentials").select("access_token,refresh_token").eq("account_id", account.id).single();
    if (!credentials) return Response.json({ error: "Hesabını yeniden bağla." }, { status: 409, headers });
    let token = credentials.access_token;
    if (!account.token_expires_at || Date.parse(account.token_expires_at) <= Date.now() + 60000) {
      if (!credentials.refresh_token) return Response.json({ error: "Hesabını yeniden bağla." }, { status: 409, headers });
      const fresh = await xToken(new URLSearchParams({ grant_type: "refresh_token", refresh_token: credentials.refresh_token }));
      const { error: credentialError } = await db.from("social_account_credentials").update({ access_token: fresh.access_token, refresh_token: fresh.refresh_token ?? credentials.refresh_token }).eq("account_id", account.id);
      if (credentialError) throw credentialError;
      const { error: expiryError } = await db.from("social_accounts").update({ token_expires_at: new Date(Date.now() + fresh.expires_in * 1000).toISOString() }).eq("id", account.id);
      if (expiryError) throw expiryError;
      token = fresh.access_token;
    }
    const text = body.text.trim() + "\n\nhttps://www.aqryo.com/share/" + content.id + "?card=v2";
    const { error: insertError } = await db.from("social_publish_receipts").insert({ id: body.requestId, user_id: user.id, account_id: account.id, experience_id: content.id, text });
    if (insertError) return Response.json({ error: "Gönderi zaten işleniyor veya kaydedilemedi." }, { status: 409, headers });
    receiptId = body.requestId;
    submitted = true;
    const response = await fetch("https://api.x.com/2/tweets", { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify({ text }), signal: AbortSignal.timeout(15000) });
    const result = await response.json();
    if (!response.ok || !result.data?.id) {
      await db.from("social_publish_receipts").update({ status: "failed" }).eq("id", receiptId);
      return Response.json({ error: response.status === 429 ? "X yayın limitine ulaşıldı. Daha sonra tekrar dene." : "X gönderiyi kabul etmedi. Hesap izinlerini ve uygulama erişimini kontrol et." }, { status: 502, headers });
    }
    const { error: savedError } = await db.from("social_publish_receipts").update({ status: "published", post_id: result.data.id }).eq("id", receiptId);
    if (savedError) throw savedError;
    return Response.json({ url: "https://x.com/i/status/" + result.data.id }, { headers });
  } catch {
    if (receiptId) await db.from("social_publish_receipts").update({ status: submitted ? "uncertain" : "failed" }).eq("id", receiptId);
    return Response.json({ error: submitted ? "Gönderinin sonucu doğrulanamadı. Tekrar göndermeden önce X hesabını kontrol et." : "Gönderi hazırlanamadı. Hesap bağlantını kontrol et." }, { status: 502, headers });
  }
});
