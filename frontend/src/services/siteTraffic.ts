import { supabase } from "@/services/supabase";

const VISITOR_KEY = "aqryo-traffic-visitor-v1";
const SESSION_KEY = "aqryo-traffic-session-v1";

function storedId(storage: Storage, key: string): string {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  storage.setItem(key, id);
  return id;
}

export async function trackSitePage(path: string): Promise<void> {
  if (typeof window === "undefined" || navigator.webdriver || navigator.doNotTrack === "1") return;
  if (/^\/(admin|traffic|creator-auth|creator-reset-password|creator-preview)(\/|$)/.test(path)) return;

  try {
    const visitorId = storedId(localStorage, VISITOR_KEY);
    const sessionId = storedId(sessionStorage, SESSION_KEY);
    const referrer = document.referrer ? new URL(document.referrer) : null;
    const referrerHost = referrer?.hostname !== window.location.hostname ? referrer?.hostname : null;
    const source = new URLSearchParams(window.location.search).get("utm_source");

    await supabase.rpc("track_site_page_view", {
      p_visitor_id: visitorId,
      p_session_id: sessionId,
      p_path: path.slice(0, 160),
      p_referrer_host: referrerHost?.slice(0, 120) ?? null,
      p_source: source?.slice(0, 60) ?? null,
      p_device: window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
    });
  } catch {
    // Traffic measurement must not interrupt the site.
  }
}

export interface TrafficDashboard {
  views: number;
  visitors: number;
  sessions: number;
  daily: Array<{ day: string; views: number; visitors: number }>;
  pages: Array<{ path: string; views: number }>;
  sources: Array<{ source: string; views: number }>;
  devices: Array<{ device: string; views: number }>;
}

export async function isTrafficOwner(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_traffic_owner");
  return !error && data === true;
}

export async function getTrafficDashboard(days: number): Promise<TrafficDashboard> {
  const { data, error } = await supabase.rpc("get_traffic_dashboard", { p_days: days });
  if (error) throw new Error(`Trafik verileri alınamadı: ${error.message}`);
  return data as TrafficDashboard;
}
