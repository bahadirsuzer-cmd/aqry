import { supabase } from "./supabase";

export type Platform = "x" | "instagram" | "facebook" | "linkedin";
export type PublishProfile = { id: string; name: string; created_at: string };
export type SocialAccount = { id: string; platform: Platform; account_name: string | null; account_handle: string | null; status: string; publish_profile_id: string | null };
export type ChannelStatus = { platform: Platform; name: string; ready: boolean; reason: string };

export async function socialRequest(action: "status" | "connect", profileId?: string, platform?: Platform) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("Oturumun sona erdi. Lütfen yeniden giriş yap.");
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/social-oauth${action === "status" ? "?action=status" : ""}`, {
    method: action === "status" ? "GET" : "POST",
    headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" },
    ...(action === "connect" ? { body: JSON.stringify({ profileId, platform }) } : {}),
    signal: AbortSignal.timeout(15000),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Sosyal hesap bağlantısı kontrol edilemedi.");
  return payload as { channels?: ChannelStatus[]; url?: string };
}

export async function connectSocialAccount(profileId: string, platform: Platform) {
  const { url } = await socialRequest("connect", profileId, platform);
  if (!url || new URL(url).origin !== new URL(import.meta.env.VITE_SUPABASE_URL).origin) throw new Error("Bağlantı adresi doğrulanamadı.");
  window.location.assign(url);
}

export async function publishToX(input: { profileId: string; accountId: string; experienceId: string; text: string; requestId: string; confirmed: boolean }) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("Oturumun sona erdi. Lütfen yeniden giriş yap.");
  const response = await fetch(import.meta.env.VITE_SUPABASE_URL + "/functions/v1/social-publish", {
    method: "POST", headers: { Authorization: "Bearer " + data.session.access_token, "Content-Type": "application/json" },
    body: JSON.stringify(input), signal: AbortSignal.timeout(35000),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Gönderi sonucu doğrulanamadı. Tekrar göndermeden X hesabını kontrol et.");
  return payload.url as string;
}
