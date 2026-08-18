import { CreatorNavigation } from "@/components/CreatorNavigation";
import {
  getCurrentCreator,
  signOutCreator,
} from "@/services/auth";
import {
  getCreatorAccountExtensionSnapshot,
  requestCreatorDataExport,
  saveCreatorNotificationPreferences,
  type CreatorNotificationPreferences,
} from "@/services/creatorAccountPreferences";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute(
  "/creator-privacy",
)({
  component: CreatorPrivacyPage,
});

const NOTIFICATION_ITEMS: Array<{
  key: keyof CreatorNotificationPreferences;
  title: string;
  description: string;
}> = [
  {
    key: "giftEmail",
    title: "Yeni Gift",
    description:
      "Birisi sana Gift gönderdiğinde e-posta al.",
  },
  {
    key: "paidOfferEmail",
    title: "Offer satın alımı",
    description:
      "Ücretli ek içeriğin satın alındığında e-posta al.",
  },
  {
    key: "payoutEmail",
    title: "Ödeme ve hakediş",
    description:
      "Ödeme veya payout durumunda önemli bir değişiklik olduğunda e-posta al.",
  },
  {
    key: "moderationEmail",
    title: "Moderasyon",
    description:
      "İçeriğin incelemeye alındığında veya durumunda değişiklik olduğunda e-posta al.",
  },
  {
    key: "securityEmail",
    title: "Güvenlik",
    description:
      "Şifre ve hesap güvenliğiyle ilgili önemli e-postaları al.",
  },
];

const DEFAULT_PREFERENCES: CreatorNotificationPreferences = {
  giftEmail: true,
  paidOfferEmail: true,
  payoutEmail: true,
  moderationEmail: true,
  securityEmail: true,
};

function CreatorPrivacyPage() {
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [exporting, setExporting] =
    useState(false);

  const [preferences, setPreferences] =
    useState<CreatorNotificationPreferences>(
      DEFAULT_PREFERENCES,
    );

  const [
    dataExportRequestedAt,
    setDataExportRequestedAt,
  ] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const user =
          await getCurrentCreator();

        if (!user) {
          window.location.href =
            "/creator-auth";
          return;
        }

        const snapshot =
          await getCreatorAccountExtensionSnapshot();

        if (cancelled) {
          return;
        }

        setPreferences(
          snapshot.notifications,
        );
        setDataExportRequestedAt(
          snapshot.dataExportRequestedAt,
        );
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Gizlilik ayarları yüklenemedi.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, []);

  function togglePreference(
    key: keyof CreatorNotificationPreferences,
  ) {
    setPreferences(
      (current) => ({
        ...current,
        [key]: !current[key],
      }),
    );

    setSuccessMessage(null);
  }

  async function handleSave() {
    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await saveCreatorNotificationPreferences(
        preferences,
      );

      setSuccessMessage(
        "Tercihlerin kaydedildi.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Tercihler kaydedilemedi.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    if (exporting) {
      return;
    }

    try {
      setExporting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const requestedAt =
        await requestCreatorDataExport();

      setDataExportRequestedAt(
        requestedAt,
      );

      setSuccessMessage(
        "Veri dışa aktarma talebin oluşturuldu.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Talep oluşturulamadı.",
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfbfd] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href =
            "/creator-auth";
        }}
      />

      <div className="mx-auto max-w-[960px] px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        <header className="border-b border-border pb-6">
          <a
            href="/creator-account"
            className="text-[12px] font-black text-primary"
          >
            ← Hesabım
          </a>

          <p className="mt-5 text-[12px] font-black uppercase tracking-[0.14em] text-primary">
            Hesabım
          </p>

          <h1 className="mt-2 text-[36px] font-black tracking-[-0.055em] sm:text-[44px]">
            Gizlilik ve izinler
          </h1>

          <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-muted-foreground">
            Hangi hesap olaylarında
            bilgilendirileceğini ve hesap
            verilerinle ilgili taleplerini
            buradan yönet.
          </p>
        </header>

        {loading ? (
          <section className="mt-6 rounded-[24px] border border-border bg-white p-12 text-center">
            <p className="text-[14px] font-bold text-muted-foreground">
              Ayarların yükleniyor...
            </p>
          </section>
        ) : null}

        {!loading ? (
          <div className="mt-6 space-y-5">
            {errorMessage ? (
              <div className="rounded-[18px] border border-red-100 bg-red-50 p-4 text-[12px] font-bold text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-[18px] border border-emerald-100 bg-emerald-50 p-4 text-[12px] font-bold text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            <section className="rounded-[26px] border border-border bg-white p-5 shadow-[0_18px_50px_rgba(18,10,40,0.04)] sm:p-7">
              <p className="text-[12px] font-black uppercase tracking-[0.12em] text-primary">
                E-posta bildirimleri
              </p>

              <h2 className="mt-2 text-[22px] font-black tracking-[-0.035em]">
                Sana ne zaman yazalım?
              </h2>

              <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
                Kritik güvenlik bildirimleri,
                sistem gereği bazı durumlarda
                tercihlerinden bağımsız olarak
                gönderilebilir.
              </p>

              <div className="mt-5 divide-y divide-border">
                {NOTIFICATION_ITEMS.map(
                  (item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        togglePreference(
                          item.key,
                        )
                      }
                      className="flex w-full items-center justify-between gap-5 py-4 text-left"
                    >
                      <span className="min-w-0">
                        <span className="block text-[14px] font-black">
                          {item.title}
                        </span>

                        <span className="mt-1 block text-[12px] leading-5 text-muted-foreground">
                          {
                            item.description
                          }
                        </span>
                      </span>

                      <span
                        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                          preferences[
                            item.key
                          ]
                            ? "bg-primary"
                            : "bg-neutral-200"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                            preferences[
                              item.key
                            ]
                              ? "left-6"
                              : "left-1"
                          }`}
                        />
                      </span>
                    </button>
                  ),
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  void handleSave()
                }
                disabled={saving}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-[12px] font-black text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Kaydediliyor..."
                  : "Tercihleri kaydet"}
              </button>
            </section>

            <section className="rounded-[26px] border border-border bg-white p-5 shadow-[0_18px_50px_rgba(18,10,40,0.04)] sm:p-7">
              <p className="text-[12px] font-black uppercase tracking-[0.12em] text-primary">
                Verilerim
              </p>

              <h2 className="mt-2 text-[22px] font-black tracking-[-0.035em]">
                Verilerini dışa aktar
              </h2>

              <p className="mt-2 max-w-[650px] text-[13px] leading-6 text-muted-foreground">
                Hesap, profil ve AQRYO
                kullanım verilerinin bir
                kopyasını istemek için talep
                oluşturabilirsin. Bu buton
                doğrudan dosya indirmez;
                talebi kaydeder.
              </p>

              {dataExportRequestedAt ? (
                <div className="mt-5 rounded-[18px] bg-background p-4">
                  <p className="text-[12px] font-black">
                    Talep oluşturuldu
                  </p>

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatDate(
                      dataExportRequestedAt,
                    )}
                  </p>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() =>
                  void handleExport()
                }
                disabled={exporting}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-border bg-white px-6 text-[12px] font-black transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting
                  ? "Talep oluşturuluyor..."
                  : "Verilerimi talep et"}
              </button>
            </section>

            <section className="rounded-[26px] border border-border bg-white p-5 sm:p-7">
              <p className="text-[12px] font-black uppercase tracking-[0.12em] text-primary">
                Politika ve izinler
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <a
                  href="/privacy"
                  className="rounded-[18px] border border-border p-4 transition hover:border-primary/25"
                >
                  <p className="text-[13px] font-black">
                    Gizlilik politikası
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                    Verilerin nasıl işlendiğini
                    incele.
                  </p>
                </a>

                <a
                  href="/cookies"
                  className="rounded-[18px] border border-border p-4 transition hover:border-primary/25"
                >
                  <p className="text-[13px] font-black">
                    Çerez politikası
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                    Çerezler ve benzer
                    teknolojiler hakkında bilgi
                    al.
                  </p>
                </a>
              </div>

              <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
                Çerez onay tercihleri için
                ayrıca gerçek consent/banner
                sistemi bağlanacak. Bu sayfada
                çalışmayan sahte bir anahtar
                göstermiyoruz.
              </p>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function formatDate(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}