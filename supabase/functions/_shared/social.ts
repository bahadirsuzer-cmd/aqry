import { createClient } from "https://esm.sh/@supabase/supabase-js@2.111.0";

export const origins = ["https://aqryo.com", "https://www.aqryo.com"];
export const callbackUrl = () => `${Deno.env.get("SUPABASE_URL")}/functions/v1/social-oauth-callback`;
export const scopes = "tweet.read tweet.write users.read offline.access";
export function cors(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  return { "Access-Control-Allow-Origin": origins.includes(origin) ? origin : origins[0], "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Vary": "Origin", "Cache-Control": "no-store" };
}
export function admin() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
}
export async function userFor(req: Request) {
  const token = req.headers.get("Authorization")?.replace(/^Bearer /i, "");
  if (!token) return null;
  const { data, error } = await admin().auth.getUser(token);
  return error ? null : data.user;
}
export const random = () => b64(crypto.getRandomValues(new Uint8Array(48)));
export function b64(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
export async function hash(value: string) { return b64(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))); }
export function capabilities() {
  const ready = !!(Deno.env.get("X_CLIENT_ID") && Deno.env.get("X_CLIENT_SECRET"));
  return [
    { platform: "x", name: "X", ready, reason: ready ? "" : "X uygulama bağlantısı yapılandırılmayı bekliyor." },
    ...["instagram", "facebook", "linkedin"].map(platform => ({ platform, name: { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn" }[platform], ready: false, reason: "Bu kanalın doğrudan yayın bağlantısı henüz hazır değil." })),
  ];
}
export async function xToken(body: URLSearchParams) {
  const clientId = Deno.env.get("X_CLIENT_ID");
  const secret = Deno.env.get("X_CLIENT_SECRET");
  if (!clientId || !secret) throw new Error("X uygulama bağlantısı yapılandırılmayı bekliyor.");
  const response = await fetch("https://api.x.com/2/oauth2/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${btoa(`${encodeURIComponent(clientId)}:${encodeURIComponent(secret)}`)}` }, body, signal: AbortSignal.timeout(15000) });
  const payload = await response.json();
  if (!response.ok || !payload.access_token) throw new Error("X yetkilendirmesi tamamlanamadı. Hesabını yeniden bağla.");
  return payload;
}
