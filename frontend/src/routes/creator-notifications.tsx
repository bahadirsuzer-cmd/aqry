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

export const Route = createFileRoute("/creator-notifications")({
  component: CreatorNotificationsPage,
});

function CreatorNotificationsPage() {
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
              : "Bildirimler yüklenemedi.",
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
      setMessage("Bildirimler açık. Yeni anonim soru ve itiraflar cihazına gelecek.");
    } catch (enableError) {
      setSupport(getPushSupport());
      setError(
        enableError instanceof Error
          ? enableError.message
          : "Bildirimler açılamadı.",
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
      setMessage("Bu cihaz için push bildirimleri kapatıldı.");
    } catch (disableError) {
      setError(
        disableError instanceof Error
          ? disableError.message
          : "Bildirimler kapatılamadı.",
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
          ? "E-posta yedeği açık. Push ulaşmazsa AQRYO sana e-posta ile haber verecek."
          : "E-posta bildirimleri kapatıldı.",
      );
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "E-posta ayarı güncellenemedi.",
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
          Bildirimler
        </p>
        <h1 className="mt-2 text-[40px] font-black tracking-[-0.06em] sm:text-[56px]">
          Yeni mesajı kaçırma.
        </h1>
        <p className="mt-4 max-w-[680px] text-[17px] font-semibold leading-8 text-muted-foreground">
          Yeni anonim soru veya itiraf geldiğinde AQRYO sana cihaz bildirimi göndersin.
          Creator’ın gelen kutusunu sürekli kontrol etmesi gerekmemeli.
        </p>

        <div className="mt-7 grid gap-5 md:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[30px] border border-border bg-white p-6 shadow-[0_18px_55px_rgba(33,21,53,0.06)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-black">Push bildirimleri</p>
                <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
                  {enabled
                    ? "Bu cihaz yeni anonim mesajlar için kayıtlı."
                    : "Bu cihaz henüz push bildirimlerine kayıtlı değil."}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
                  enabled
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {enabled ? "AÇIK" : "KAPALI"}
              </span>
            </div>

            {!support.supported ? (
              <div className="mt-5 rounded-[20px] bg-amber-50 p-4 text-[13px] font-bold leading-6 text-amber-800">
                Bu tarayıcı web push bildirimlerini desteklemiyor.
              </div>
            ) : null}

            {support.iOS && !support.standalone ? (
              <div className="mt-5 rounded-[20px] border border-violet-200 bg-violet-50 p-4">
                <p className="text-[13px] font-black text-violet-950">
                  iPhone’da bir adım gerekiyor
                </p>
                <p className="mt-2 text-[13px] leading-6 text-violet-900/75">
                  Safari’de Paylaş → Ana Ekrana Ekle. Sonra AQRYO’yu ana ekrandaki
                  ikonundan açıp bu sayfadan “Bildirimleri aç”a bas.
                </p>
              </div>
            ) : null}

            {!support.configured ? (
              <div className="mt-5 rounded-[20px] bg-amber-50 p-4 text-[13px] font-bold leading-6 text-amber-800">
                Push anahtarı production ortamına henüz eklenmemiş.
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
                ? "İşleniyor..."
                : enabled
                  ? "Bu cihazda bildirimleri kapat"
                  : "Bildirimleri aç"}
            </button>

            <p className="mt-3 text-center text-[11px] font-semibold leading-5 text-muted-foreground">
              Bildirim içeriğinde anonim mesajın kendisi gösterilmez. Bildirime
              dokununca gelen kutun açılır.
            </p>
          </section>

          <section className="rounded-[30px] border border-border bg-[#17101f] p-6 text-white sm:p-8">
            <p className="text-[12px] font-black uppercase tracking-[0.16em] text-white/55">
              Gelen kutusu
            </p>
            <p className="mt-4 text-[54px] font-black leading-none tracking-[-0.07em]">
              {unreadCount}
            </p>
            <p className="mt-3 text-[14px] font-semibold leading-6 text-white/65">
              okunmamış anonim mesaj
            </p>

            <Link
              to="/creator-inbox"
              className="mt-7 flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-[14px] font-black text-[#17101f]"
            >
              Gelen kutusunu aç →
            </Link>
          </section>
        </div>

        <section className="mt-5 rounded-[28px] border border-border bg-white p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] font-black">E-posta yedeği</p>
              <p className="mt-2 max-w-[620px] text-[13px] leading-6 text-muted-foreground">
                Push bildirimi bu cihazda çalışmıyorsa AQRYO hesabındaki e-posta adresine haber verir.
                Kısa sürede gelen birden fazla mesaj tek tek e-posta yağmuruna dönüşmez.
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black ${
                emailEnabled
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {emailEnabled ? "AÇIK" : "KAPALI"}
            </span>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => void toggleEmail()}
            className="mt-5 h-11 w-full rounded-full border border-border bg-white px-5 text-[13px] font-black disabled:opacity-40 sm:w-auto"
          >
            {emailEnabled
              ? "E-posta bildirimlerini kapat"
              : "E-posta bildirimlerini aç"}
          </button>

          <p className="mt-3 text-[11px] font-semibold leading-5 text-muted-foreground">
            İlk yeni mesajda e-posta gider. Sonraki 15 dakika içindeki mesajlar gruplanır;
            yeni bir tetikleyici geldiğinde toplu sayı ile haber verilir.
          </p>
        </section>

        <section className="mt-5 rounded-[28px] border border-border bg-white p-6 sm:p-8">
          <p className="text-[13px] font-black">Nasıl çalışıyor?</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoCard number="1" title="Takipçi yazar" text="Anonim soru veya itiraf gönderilir." />
            <InfoCard number="2" title="AQRYO haber verir" text="Önce push dener; push yoksa e-posta yedeği devreye girer." />
            <InfoCard number="3" title="Creator cevaplar" text="Bildirime dokunur, cevabı görsel olarak paylaşır." />
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
