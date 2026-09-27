import { CreatorNavigation } from "@/components/CreatorNavigation";
import { getCurrentCreator, signOutCreator } from "@/services/auth";
import {
  disableCreatorPushNotifications,
  enableCreatorPushNotifications,
  getExistingPushSubscription,
  getPushSupport,
} from "@/services/pushNotifications";
import {
  getUnreadAnonymousCount,
  loadAnonymousInbox,
  type AnonymousInboxItem,
} from "@/services/anonymousInbox";
import {
  getCreatorNotificationPreferences,
  updateCreatorNotificationPreferences,
} from "@/services/notificationPreferences";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAqryoLocale } from "@/lib/i18n";

export const Route = createFileRoute("/creator-notifications")({
  component: CreatorNotificationsPage,
});

const NOTIFICATION_COPY = {
  tr: {
    eyebrow:"Bildirimler", title:"Yeni mesajı kaçırma.", intro:"Yeni anonim soru veya itiraf geldiğinde AQRYO sana cihaz bildirimi göndersin. Gelen kutunu sürekli kontrol etmen gerekmesin.",
    pushTitle:"Push bildirimleri", registered:"Bu cihaz yeni anonim mesajlar için kayıtlı.", notRegistered:"Bu cihaz henüz push bildirimlerine kayıtlı değil.", on:"AÇIK", off:"KAPALI",
    unsupported:"Bu tarayıcı web push bildirimlerini desteklemiyor.", iosTitle:"iPhone’da bir adım gerekiyor", iosText:"Safari’de Paylaş → Ana Ekrana Ekle. Sonra AQRYO’yu ana ekrandaki ikonundan açıp bu sayfadan “Bildirimleri aç”a bas.",
    notConfigured:"Push anahtarı production ortamına henüz eklenmemiş.", processing:"İşleniyor...", disablePush:"Bu cihazda bildirimleri kapat", enablePush:"Bildirimleri aç",
    privacy:"Bildirim içeriğinde anonim mesajın kendisi gösterilmez. Bildirime dokununca gelen kutun açılır.", inbox:"Gelen kutusu", unread:"okunmamış anonim mesaj", openInbox:"Gelen kutusunu aç →",
    emailTitle:"E-posta yedeği", emailText:"Push bildirimi bu cihazda çalışmıyorsa AQRYO hesabındaki e-posta adresine haber verir. Kısa sürede gelen birden fazla mesaj tek tek e-posta yağmuruna dönüşmez.",
    disableEmail:"E-posta bildirimlerini kapat", enableEmail:"E-posta bildirimlerini aç", emailFoot:"İlk yeni mesajda e-posta gider. Sonraki 15 dakika içindeki mesajlar gruplanır; yeni bir tetikleyici geldiğinde toplu sayı ile haber verilir.",
    how:"Nasıl çalışıyor?", s1t:"Takipçi yazar", s1x:"Anonim soru veya itiraf gönderilir.", s2t:"AQRYO haber verir", s2x:"Önce push dener; push yoksa e-posta yedeği devreye girer.", s3t:"Creator cevaplar", s3x:"Bildirime dokunur, cevabı görsel olarak paylaşır.",
    loadFail:"Bildirimler yüklenemedi.", enabledMsg:"Bildirimler açık. Yeni anonim soru ve itiraflar bu cihaza ulaşacak.", enableFail:"Bildirimler açılamadı.", disabledMsg:"Bu cihazda push bildirimleri kapatıldı.", disableFail:"Bildirimler kapatılamadı.",
    emailOn:"E-posta yedeği açık. Push ulaşmazsa AQRYO e-posta ile haber verecek.", emailOff:"E-posta bildirimleri kapalı.", emailFail:"E-posta ayarları güncellenemedi."
  },
  en: {
    eyebrow:"Notifications", title:"Never miss a new message.", intro:"Let AQRYO notify you when a new anonymous question or confession arrives, so you do not have to keep checking your inbox.",
    pushTitle:"Push notifications", registered:"This device is registered for new anonymous messages.", notRegistered:"This device is not registered for push notifications yet.", on:"ON", off:"OFF",
    unsupported:"This browser does not support web push notifications.", iosTitle:"One extra step on iPhone", iosText:"In Safari tap Share → Add to Home Screen. Then open AQRYO from the home-screen icon and tap “Enable notifications” here.",
    notConfigured:"The push key has not been added to production yet.", processing:"Working...", disablePush:"Disable notifications on this device", enablePush:"Enable notifications",
    privacy:"The anonymous message itself is never shown in the notification. Tapping it opens your inbox.", inbox:"Inbox", unread:"unread anonymous messages", openInbox:"Open inbox →",
    emailTitle:"Email backup", emailText:"If push is unavailable on this device, AQRYO can notify the email address on your account. Multiple messages arriving close together are grouped to avoid email spam.",
    disableEmail:"Disable email notifications", enableEmail:"Enable email notifications", emailFoot:"The first new message sends an email. Messages arriving during the next 15 minutes are grouped and reported together on the next trigger.",
    how:"How it works", s1t:"A follower writes", s1x:"An anonymous question or confession is submitted.", s2t:"AQRYO notifies you", s2x:"AQRYO tries push first; if push is unavailable, email backup takes over.", s3t:"Creator replies", s3x:"Open the notification and share the reply as an image.",
    loadFail:"Notifications could not be loaded.", enabledMsg:"Notifications are on. New anonymous questions and confessions will reach this device.", enableFail:"Notifications could not be enabled.", disabledMsg:"Push notifications are disabled on this device.", disableFail:"Notifications could not be disabled.",
    emailOn:"Email backup is on. If push does not reach you, AQRYO will notify you by email.", emailOff:"Email notifications are off.", emailFail:"Email settings could not be updated."
  }
} as const;

function CreatorNotificationsPage() {
  const { locale } = useAqryoLocale();
  const copy = locale === "tr" ? NOTIFICATION_COPY.tr : NOTIFICATION_COPY.en;
  const [loading, setLoading] = useState(true);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [items, setItems] = useState<AnonymousInboxItem[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [support, setSupport] = useState(getPushSupport());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const creator = await getCurrentCreator();
        if (!creator) {
          window.location.href = "/creator-auth";
          return;
        }

        const [subscription, inbox, preferences] = await Promise.all([
          getExistingPushSubscription().catch(() => null),
          loadAnonymousInbox(creator.id),
          getCreatorNotificationPreferences(creator.id),
        ]);

        if (cancelled) return;

        setCreatorId(creator.id);
        setEnabled(Boolean(subscription));
        setEmailEnabled(preferences.emailEnabled);
        setItems(inbox);
        setSupport(getPushSupport());
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : copy.loadFail,
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    if (!creatorId || busy) return;

    try {
      setBusy(true);
      setError(null);
      setMessage(null);

      await enableCreatorPushNotifications(creatorId);
      await updateCreatorNotificationPreferences(
        creatorId,
        { pushEnabled: true },
      );
      setEnabled(true);
      setSupport(getPushSupport());
      setMessage(copy.enabledMsg);
    } catch (enableError) {
      setSupport(getPushSupport());
      setError(
        enableError instanceof Error
          ? enableError.message
          : copy.enableFail,
      );
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    if (busy) return;

    try {
      setBusy(true);
      setError(null);
      setMessage(null);

      await disableCreatorPushNotifications();
      if (creatorId) {
        await updateCreatorNotificationPreferences(
          creatorId,
          { pushEnabled: false },
        );
      }
      setEnabled(false);
      setMessage(copy.disabledMsg);
    } catch (disableError) {
      setError(
        disableError instanceof Error
          ? disableError.message
          : copy.disableFail,
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleEmail() {
    if (!creatorId || busy) return;

    try {
      setBusy(true);
      setError(null);
      setMessage(null);

      const next = !emailEnabled;
      await updateCreatorNotificationPreferences(
        creatorId,
        { emailEnabled: next },
      );
      setEmailEnabled(next);
      setMessage(
        next
          ? copy.emailOn
          : copy.emailOff,
      );
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : copy.emailFail,
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f5fb]">
        <CreatorNavigation
          onSignOut={async () => {
            await signOutCreator();
            window.location.href = "/creator-auth";
          }}
        />
        <div className="mx-auto max-w-[980px] px-4 py-10 sm:px-6">
          <div className="h-[360px] animate-pulse rounded-[30px] bg-white" />
        </div>
      </main>
    );
  }

  const unreadCount = getUnreadAnonymousCount(items);

  return (
    <main className="min-h-screen bg-[#f7f5fb] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href = "/creator-auth";
        }}
      />

      <section className="mx-auto max-w-[980px] px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <p className="text-[12px] font-black uppercase tracking-[0.18em] text-primary">
          {copy.eyebrow}
        </p>
        <h1 className="mt-2 text-[40px] font-black tracking-[-0.06em] sm:text-[56px]">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-[680px] text-[17px] font-semibold leading-8 text-muted-foreground">
          {copy.intro}
        </p>

        <div className="mt-7 grid gap-5 md:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[30px] border border-border bg-white p-6 shadow-[0_18px_55px_rgba(33,21,53,0.06)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
<p className="text-[13px] font-black">{copy.pushTitle}</p>
                <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
                  {enabled
                    ? copy.registered
                    : copy.notRegistered}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
                  enabled
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
{enabled ? copy.on : copy.off}
              </span>
            </div>

            {!support.supported ? (
              <div className="mt-5 rounded-[20px] bg-amber-50 p-4 text-[13px] font-bold leading-6 text-amber-800">
{copy.unsupported}
              </div>
            ) : null}

            {support.iOS && !support.standalone ? (
              <div className="mt-5 rounded-[20px] border border-violet-200 bg-violet-50 p-4">
                <p className="text-[13px] font-black text-violet-950">
{copy.iosTitle}
                </p>
                <p className="mt-2 text-[13px] leading-6 text-violet-900/75">
{copy.iosText}
                </p>
              </div>
            ) : null}

            {!support.configured ? (
              <div className="mt-5 rounded-[20px] bg-amber-50 p-4 text-[13px] font-bold leading-6 text-amber-800">
{copy.notConfigured}
              </div>
            ) : null}

            {message ? (
              <p className="mt-5 rounded-[18px] bg-emerald-50 px-4 py-3 text-[13px] font-bold leading-6 text-emerald-700">
                {message}
              </p>
            ) : null}

            {error ? (
              <p className="mt-5 rounded-[18px] bg-red-50 px-4 py-3 text-[13px] font-bold leading-6 text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              disabled={busy || !support.supported}
              onClick={() => void (enabled ? disable() : enable())}
              className={`mt-6 h-12 w-full rounded-full px-5 text-[14px] font-black text-white disabled:opacity-40 ${
                enabled ? "bg-zinc-800" : "bg-violet-700"
              }`}
            >
              {busy
                ? copy.processing
                : enabled
                  ? copy.disablePush
                  : copy.enablePush}
            </button>

            <p className="mt-3 text-center text-[11px] font-semibold leading-5 text-muted-foreground">
{copy.privacy}
            </p>
          </section>

          <section className="rounded-[30px] border border-border bg-[#17101f] p-6 text-white sm:p-8">
            <p className="text-[12px] font-black uppercase tracking-[0.16em] text-white/55">
{copy.inbox}
            </p>
            <p className="mt-4 text-[54px] font-black leading-none tracking-[-0.07em]">
              {unreadCount}
            </p>
            <p className="mt-3 text-[14px] font-semibold leading-6 text-white/65">
{copy.unread}
            </p>

            <Link
              to="/creator-inbox"
              className="mt-7 flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-[14px] font-black text-[#17101f]"
            >
{copy.openInbox}
            </Link>
          </section>
        </div>

        <section className="mt-5 rounded-[28px] border border-border bg-white p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
<p className="text-[13px] font-black">{copy.emailTitle}</p>
              <p className="mt-2 max-w-[620px] text-[13px] leading-6 text-muted-foreground">
{copy.emailText}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black ${
                emailEnabled
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
{emailEnabled ? copy.on : copy.off}
            </span>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => void toggleEmail()}
            className="mt-5 h-11 w-full rounded-full border border-border bg-white px-5 text-[13px] font-black disabled:opacity-40 sm:w-auto"
          >
            {emailEnabled
              ? copy.disableEmail
              : copy.enableEmail}
          </button>

          <p className="mt-3 text-[11px] font-semibold leading-5 text-muted-foreground">
{copy.emailFoot}
          </p>
        </section>

        <section className="mt-5 rounded-[28px] border border-border bg-white p-6 sm:p-8">
<p className="text-[13px] font-black">{copy.how}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoCard number="1" title={copy.s1t} text={copy.s1x} />
            <InfoCard number="2" title={copy.s2t} text={copy.s2x} />
            <InfoCard number="3" title={copy.s3t} text={copy.s3x} />
          </div>
        </section>
      </section>
    </main>
  );
}

function InfoCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[20px] bg-background p-4">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-[12px] font-black text-violet-700">
        {number}
      </span>
      <p className="mt-4 text-[13px] font-black">{title}</p>
      <p className="mt-2 text-[12px] leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}
