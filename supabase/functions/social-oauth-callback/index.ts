import { admin, callbackUrl, hash, xToken } from "../_shared/social.ts";

function finish(status: string) {
  return new Response(null, { status: 302, headers: { Location: `https://aqryo.com/creator-publish?social=${status}`, "Cache-Control": "no-store", "Set-Cookie": "__Host-aqryo-social=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0" } });
}
Deno.serve(async req => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  const cookie = req.headers.get("Cookie")?.split(";").map(value => value.trim()).find(value => value.startsWith("__Host-aqryo-social="))?.split("=")[1];
  if (!state || cookie !== state) return finish("invalid");
  const db = admin();
  try {
    // DELETE RETURNING atomically consumes the state: no callback replay or double token exchange.
    const { data: request, error } = await db.from("social_oauth_requests").delete().eq("state_hash", await hash(state)).gt("expires_at", new Date().toISOString()).select("user_id,publish_profile_id,verifier").maybeSingle();
    if (error || !request) return finish("expired");
    if (url.searchParams.has("error")) return finish("canceled");
    const code = url.searchParams.get("code");
    if (!code) return finish("invalid");
    const { data: profile } = await db.from("creator_publish_profiles").select("id").eq("id", request.publish_profile_id).eq("creator_id", request.user_id).maybeSingle();
    if (!profile) return finish("invalid");
    const token = await xToken(new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: callbackUrl(), code_verifier: request.verifier }));
    if (!token.scope?.split(" ").includes("tweet.write")) return finish("permissions");
    const response = await fetch("https://api.x.com/2/users/me", { headers: { Authorization: `Bearer ${token.access_token}` }, signal: AbortSignal.timeout(15000) });
    const identity = await response.json();
    if (!response.ok || !identity.data?.id) return finish("error");
    const { data: account, error: accountError } = await db.from("social_accounts").upsert({ user_id: request.user_id, platform: "x", platform_account_id: identity.data.id, account_name: identity.data.name, account_handle: `@${identity.data.username}`, publish_profile_id: profile.id, status: "pending", access_token_encrypted: null, refresh_token_encrypted: null, scopes: token.scope.split(" "), token_expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(), connected_at: new Date().toISOString() }, { onConflict: "user_id,platform,platform_account_id" }).select("id").single();
    if (accountError || !account) return finish("error");
    // Tokens are service-only, never readable through the client-facing social_accounts table.
    const { error: credentialError } = await db.from("social_account_credentials").upsert({ account_id: account.id, access_token: token.access_token, refresh_token: token.refresh_token ?? null });
    if (credentialError) return finish("error");
    const { error: connectedError } = await db.from("social_accounts").update({ status: "connected" }).eq("id", account.id);
    return finish(connectedError ? "error" : "connected");
  } catch { return finish("error"); }
});
