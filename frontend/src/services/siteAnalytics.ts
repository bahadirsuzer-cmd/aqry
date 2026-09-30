import { supabase } from "@/services/supabase";

const ENDPOINT = "https://hburwzezggdgxuissjej.supabase.co/functions/v1/track-page-view";

function getOrCreate(storage: Storage, key: string) {
  let value = storage.getItem(key);
  if (!value) { value = crypto.randomUUID(); storage.setItem(key, value); }
  return value;
}

export async function trackPageView(path: string) {
  if (typeof window === "undefined") return;
  if (navigator.doNotTrack === "1") return;
  try {
    const visitorId = getOrCreate(localStorage, "aqryo_visitor_id");
    const sessionId = getOrCreate(sessionStorage, "aqryo_session_id");
    const width = window.innerWidth;
    const deviceType = width < 768 ? "mobile" : width < 1100 ? "tablet" : "desktop";
    const { data } = await supabase.auth.getSession();
    void fetch(ENDPOINT, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
      },
      body: JSON.stringify({
        visitor_id: visitorId, session_id: sessionId, path,
        referrer: document.referrer || null, locale: navigator.language, device_type: deviceType,
      }),
    });
  } catch {
    // Analytics must never interfere with the product.
  }
}
