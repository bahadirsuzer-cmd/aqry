import { supabase } from "@/services/supabase";

const VAPID_PUBLIC_KEY =
  (import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY as string | undefined) ??
  "BPIAqho6q2tQ0W0jTX2_hJkSBvhi9e1vvriPrX_BeTRkhbhR3DYonjWyd4pKjWm3GHCgnkBhLuDf2QS3Fb7kWFM";

export type PushSupport = {
  supported: boolean;
  iOS: boolean;
  standalone: boolean;
  permission: NotificationPermission | "unsupported";
  configured: boolean;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

export function getPushSupport(): PushSupport {
  const userAgent =
    typeof navigator === "undefined" ? "" : navigator.userAgent;

  const iOS = /iPad|iPhone|iPod/.test(userAgent);
  const standalone =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone));

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  return {
    supported,
    iOS,
    standalone,
    permission:
      supported ? Notification.permission : "unsupported",
    configured: Boolean(VAPID_PUBLIC_KEY),
  };
}

async function getRegistration() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Bu tarayıcı bildirimleri desteklemiyor.");
  }

  return navigator.serviceWorker.register("/aqryo-sw.js", {
    scope: "/",
  });
}

export async function getExistingPushSubscription() {
  if (!getPushSupport().supported) return null;
  const registration = await getRegistration();
  return registration.pushManager.getSubscription();
}

export async function enableCreatorPushNotifications(creatorId: string) {
  const support = getPushSupport();

  if (!support.supported) {
    throw new Error("Bu tarayıcı web bildirimlerini desteklemiyor.");
  }

  if (support.iOS && !support.standalone) {
    throw new Error(
      "iPhone’da bildirim almak için AQRYO’yu önce Safari’den Ana Ekrana Ekle.",
    );
  }

  if (!VAPID_PUBLIC_KEY) {
    throw new Error("Push bildirim anahtarı henüz yapılandırılmamış.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "Bildirim izni kapalı. Tarayıcı ayarlarından AQRYO bildirimlerini aç."
        : "Bildirim izni verilmedi.",
    );
  }

  const registration = await getRegistration();
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;

  if (!p256dh || !auth) {
    throw new Error("Push abonelik anahtarları alınamadı.");
  }

  const { error } = await supabase
    .from("creator_push_subscriptions")
    .upsert(
      {
        creator_id: creatorId,
        endpoint: subscription.endpoint,
        p256dh,
        auth,
        user_agent: navigator.userAgent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );

  if (error) {
    throw new Error(`Bildirim aboneliği kaydedilemedi: ${error.message}`);
  }

  return subscription;
}

export async function disableCreatorPushNotifications() {
  const subscription = await getExistingPushSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;

  const { error } = await supabase
    .from("creator_push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    throw new Error(`Bildirim aboneliği kaldırılamadı: ${error.message}`);
  }

  await subscription.unsubscribe();
}
