import { supabase } from "./supabase";

const PADDLE_CLIENT_TOKEN = "live_9d8567905455fd1e7dc5c28f910";
const PADDLE_PRICE_ID = "pri_01m3scg1p4er1jab3sjr25j1g7";
const PADDLE_SCRIPT_ID = "aqryo-paddle-js";

type PaddleApi = {
  Initialize: (options: { token: string }) => void;
  Checkout: {
    open: (options: {
      items: Array<{ priceId: string; quantity: number }>;
      customer?: { email: string };
      customData: Record<string, string>;
      settings?: {
        displayMode?: "overlay";
        theme?: "light" | "dark";
        locale?: string;
        successUrl?: string;
      };
    }) => void;
  };
};

declare global {
  interface Window {
    Paddle?: PaddleApi;
    __aqryoPaddleInitialized?: boolean;
  }
}

async function loadPaddle(): Promise<PaddleApi> {
  if (typeof window === "undefined") throw new Error("Paddle yalnızca tarayıcıda açılabilir.");

  if (!window.Paddle) {
    await new Promise<void>((resolve, reject) => {
      const existing = document.getElementById(PADDLE_SCRIPT_ID) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Paddle yüklenemedi.")), { once: true });
        if (window.Paddle) resolve();
        return;
      }
      const script = document.createElement("script");
      script.id = PADDLE_SCRIPT_ID;
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Paddle yüklenemedi."));
      document.head.appendChild(script);
    });
  }

  if (!window.Paddle) throw new Error("Paddle başlatılamadı.");
  if (!window.__aqryoPaddleInitialized) {
    window.Paddle.Initialize({ token: PADDLE_CLIENT_TOKEN });
    window.__aqryoPaddleInitialized = true;
  }
  return window.Paddle;
}

export async function openAqryoProCheckout() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/creator-auth?next=${next}`;
    return;
  }

  const paddle = await loadPaddle();
  paddle.Checkout.open({
    items: [{ priceId: PADDLE_PRICE_ID, quantity: 1 }],
    customer: data.user.email ? { email: data.user.email } : undefined,
    customData: {
      user_id: data.user.id,
      aqryo_plan: "pro",
    },
    settings: {
      displayMode: "overlay",
      theme: "light",
      successUrl: `${window.location.origin}/creator-account?checkout=success`,
    },
  });
}

export async function getAqryoProSubscription() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from("paddle_subscriptions")
    .select("subscription_id,status,current_period_end,canceled_at,updated_at")
    .eq("user_id", auth.user.id)
    .in("status", ["active", "trialing", "past_due", "paused"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function isAqryoPro() {
  const subscription = await getAqryoProSubscription();
  return subscription?.status === "active" || subscription?.status === "trialing";
}
