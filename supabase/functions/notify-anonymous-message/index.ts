import { createClient } from "npm:@supabase/supabase-js@2.111.0";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { experienceId, notificationNonce } = await request.json();

    if (
      typeof experienceId !== "string" ||
      typeof notificationNonce !== "string" ||
      !experienceId ||
      !notificationNonce
    ) {
      return json({ error: "invalid_payload" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject =
      Deno.env.get("VAPID_SUBJECT") || "mailto:hello@aqryo.com";

    if (
      !supabaseUrl ||
      !serviceRoleKey ||
      !vapidPublicKey ||
      !vapidPrivateKey
    ) {
      return json({ error: "push_not_configured" }, 503);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: event, error: eventError } = await admin
      .from("experience_events")
      .select("id,experience_id,metadata,created_at")
      .eq("experience_id", experienceId)
      .eq("event_type", "share")
      .eq("metadata->>kind", "anonymous_message")
      .eq("metadata->>notification_nonce", notificationNonce)
      .maybeSingle();

    if (eventError || !event) {
      return json({ error: "message_event_not_found" }, 404);
    }

    const { data: delivery } = await admin
      .from("push_notification_deliveries")
      .select("event_id")
      .eq("event_id", event.id)
      .maybeSingle();

    if (delivery) {
      return json({ delivered: true, duplicate: true });
    }

    const { data: experience, error: experienceError } = await admin
      .from("experiences")
      .select("creator_id,type,status")
      .eq("id", experienceId)
      .maybeSingle();

    if (
      experienceError ||
      !experience ||
      experience.type !== "question_confession" ||
      experience.status !== "published"
    ) {
      return json({ error: "experience_not_found" }, 404);
    }

    const metadata =
      event.metadata && typeof event.metadata === "object"
        ? event.metadata as Record<string, unknown>
        : {};

    const mode =
      metadata.mode === "confession" ? "confession" : "question";

    const { data: subscriptions, error: subscriptionsError } = await admin
      .from("creator_push_subscriptions")
      .select("endpoint,p256dh,auth")
      .eq("creator_id", experience.creator_id);

    if (subscriptionsError) {
      throw subscriptionsError;
    }

    if (!subscriptions?.length) {
      return json({ delivered: false, subscriptions: 0 });
    }

    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey,
    );

    const payload = JSON.stringify({
      title:
        mode === "question"
          ? "AQRYO · Yeni soru geldi"
          : "AQRYO · Yeni itiraf geldi",
      body:
        mode === "question"
          ? "Anonim gelen kutunda yeni bir soru var."
          : "Anonim gelen kutunda yeni bir itiraf var.",
      icon: "/aqryo-q.png",
      badge: "/aqryo-q.png",
      tag: `aqryo-anonymous-${event.id}`,
      url: "/creator-inbox",
    });

    let sent = 0;

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload,
        );
        sent += 1;
      } catch (error) {
        const statusCode =
          typeof error === "object" &&
          error &&
          "statusCode" in error
            ? Number((error as { statusCode?: unknown }).statusCode)
            : 0;

        if (statusCode === 404 || statusCode === 410) {
          await admin
            .from("creator_push_subscriptions")
            .delete()
            .eq("endpoint", subscription.endpoint);
          continue;
        }

        console.error("Push gönderilemedi:", error);
      }
    }

    if (sent > 0) {
      await admin
        .from("push_notification_deliveries")
        .insert({
          event_id: event.id,
          creator_id: experience.creator_id,
        });
    }

    return json({
      delivered: sent > 0,
      subscriptions: subscriptions.length,
      sent,
    });
  } catch (error) {
    console.error(error);
    return json({ error: "internal_error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
