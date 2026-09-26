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
    const vapidPublicKey =
      "BPIAqho6q2tQ0W0jTX2_hJkSBvhi9e1vvriPrX_BeTRkhbhR3DYonjWyd4pKjWm3GHCgnkBhLuDf2QS3Fb7kWFM";
    const vapidSubject = "mailto:hello@aqryo.com";

    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "push_not_configured" }, 503);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: vapidPrivateKey, error: vapidSecretError } =
      await admin.rpc("get_aqryo_push_secret", {
        secret_name: "VAPID_PRIVATE_KEY",
      });

    if (
      vapidSecretError ||
      typeof vapidPrivateKey !== "string" ||
      !vapidPrivateKey
    ) {
      console.error("VAPID secret alınamadı:", vapidSecretError);
      return json({ error: "push_not_configured" }, 503);
    }

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

    const { data: preferenceRow } = await admin
      .from("creator_notification_preferences")
      .select(
        "email_enabled,email_cooldown_minutes,last_email_sent_at,suppressed_email_count",
      )
      .eq("creator_id", experience.creator_id)
      .maybeSingle();

    const preferences = preferenceRow ?? {
      email_enabled: true,
      email_cooldown_minutes: 15,
      last_email_sent_at: null,
      suppressed_email_count: 0,
    };

    if (!preferenceRow) {
      await admin
        .from("creator_notification_preferences")
        .upsert({
          creator_id: experience.creator_id,
          email_enabled: true,
          push_enabled: true,
          email_cooldown_minutes: 15,
        });
    }

    let emailSent = false;
    let emailSuppressed = false;

    if (sent === 0 && preferences.email_enabled) {
      const lastSentAt = preferences.last_email_sent_at
        ? new Date(preferences.last_email_sent_at).getTime()
        : 0;
      const cooldownMs =
        Number(preferences.email_cooldown_minutes || 15) * 60_000;
      const withinCooldown =
        lastSentAt > 0 && Date.now() - lastSentAt < cooldownMs;

      if (withinCooldown) {
        emailSuppressed = true;

        await admin
          .from("creator_notification_preferences")
          .update({
            suppressed_email_count:
              Number(preferences.suppressed_email_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("creator_id", experience.creator_id);
      } else {
        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        const resendFrom = "AQRYO <bildirim@aqryo.com>";

        if (resendApiKey) {
          const {
            data: { user },
            error: userError,
          } = await admin.auth.admin.getUserById(
            experience.creator_id,
          );

          const recipient = user?.email;

          if (!userError && recipient) {
            const groupedCount =
              Number(preferences.suppressed_email_count || 0) + 1;
            const subject =
              groupedCount > 1
                ? `AQRYO’da ${groupedCount} yeni anonim mesajın var 👀`
                : mode === "question"
                  ? "AQRYO’da yeni anonim sorun var 👀"
                  : "AQRYO’da yeni anonim itirafın var 👀";

            const inboxUrl = "https://aqryo.com/creator-inbox";
            const html = `
              <div style="font-family:Arial,sans-serif;background:#f7f5fb;padding:32px 16px;color:#17101f">
                <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:24px;padding:28px">
                  <div style="font-size:28px;font-weight:900;letter-spacing:-1px">AQRYO.</div>
                  <div style="margin-top:28px;font-size:13px;font-weight:800;color:#7c3aed;text-transform:uppercase;letter-spacing:1.2px">
                    Yeni anonim mesaj
                  </div>
                  <h1 style="margin:10px 0 0;font-size:28px;line-height:1.05">
                    ${groupedCount > 1 ? `${groupedCount} yeni mesajın var.` : "Biri sana anonim bir mesaj bıraktı."}
                  </h1>
                  <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#6b6475">
                    Mesaj içeriğini e-postada göstermiyoruz. Gelen kutunu açıp istediğin cevabı görsel olarak paylaşabilirsin.
                  </p>
                  <a href="${inboxUrl}" style="display:inline-block;margin-top:24px;background:#17101f;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:800">
                    Gelen kutusunu aç →
                  </a>
                  <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#8a8292">
                    AQRYO bildirim tercihlerini hesabındaki Bildirimler ekranından değiştirebilirsin.
                  </p>
                </div>
              </div>
            `;

            const resendResponse = await fetch(
              "https://api.resend.com/emails",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${resendApiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  from: resendFrom,
                  to: [recipient],
                  subject,
                  html,
                }),
              },
            );

            if (resendResponse.ok) {
              emailSent = true;

              await admin
                .from("creator_notification_preferences")
                .update({
                  last_email_sent_at: new Date().toISOString(),
                  suppressed_email_count: 0,
                  updated_at: new Date().toISOString(),
                })
                .eq("creator_id", experience.creator_id);
            } else {
              console.error(
                "Resend e-posta gönderimi başarısız:",
                await resendResponse.text(),
              );
            }
          }
        }
      }
    }

    return json({
      delivered: sent > 0 || emailSent,
      subscriptions: subscriptions.length,
      sent,
      emailSent,
      emailSuppressed,
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
