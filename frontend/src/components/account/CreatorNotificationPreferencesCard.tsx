import {
  useEffect,
  useState,
} from "react";
import {
  saveCreatorNotificationPreferences,
  type CreatorNotificationPreferences,
} from "@/services/creatorAccountPreferences";

interface CreatorNotificationPreferencesCardProps {
  initialPreferences: CreatorNotificationPreferences;
}

const ITEMS: Array<{
  key: keyof CreatorNotificationPreferences;
  title: string;
  description: string;
}> = [
  {
    key: "giftEmail",
    title: "Yeni Gift",
    description:
      "Yeni bir Gift aldığında e-posta gönder.",
  },
  {
    key: "paidOfferEmail",
    title: "Ücretli Offer",
    description:
      "Ücretli ek içerik satın alındığında e-posta gönder.",
  },
  {
    key: "payoutEmail",
    title: "Payout",
    description:
      "Payout durumu değiştiğinde e-posta gönder.",
  },
  {
    key: "moderationEmail",
    title: "Moderasyon",
    description:
      "Experience inceleme veya yaptırım durumlarında e-posta gönder.",
  },
  {
    key: "securityEmail",
    title: "Güvenlik",
    description:
      "Şifre ve hesap güvenliği olaylarında e-posta gönder.",
  },
];

export function CreatorNotificationPreferencesCard({
  initialPreferences,
}: CreatorNotificationPreferencesCardProps) {
  const [preferences, setPreferences] =
    useState(initialPreferences);
  const [saving, setSaving] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  useEffect(() => {
    setPreferences(
      initialPreferences,
    );
  }, [initialPreferences]);

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
        "Bildirim tercihleri kaydedildi.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Bildirim tercihleri kaydedilemedi.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[22px] border border-border bg-white p-5 sm:p-6">
      <p className="text-[8px] font-black uppercase tracking-[0.09em] text-primary">
        Bildirimler
      </p>

      <h2 className="mt-2 text-[20px] font-black tracking-[-0.035em]">
        E-posta tercihleri
      </h2>

      <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
        Hangi hesap olaylarında e-posta almak istediğini seç.
      </p>

      <div className="mt-5 divide-y divide-border">
        {ITEMS.map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer items-center justify-between gap-5 py-4"
          >
            <span>
              <span className="block text-[11px] font-black">
                {item.title}
              </span>

              <span className="mt-1 block text-[9px] leading-4 text-muted-foreground">
                {item.description}
              </span>
            </span>

            <input
              type="checkbox"
              checked={
                preferences[item.key]
              }
              onChange={(event) =>
                setPreferences(
                  (current) => ({
                    ...current,
                    [item.key]:
                      event.target
                        .checked,
                  }),
                )
              }
              className="h-4 w-4 accent-primary"
            />
          </label>
        ))}
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-[14px] bg-red-50 px-4 py-3 text-[10px] font-bold text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-4 rounded-[14px] bg-emerald-50 px-4 py-3 text-[10px] font-bold text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      <button
        type="button"
        disabled={saving}
        onClick={handleSave}
        className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-[10px] font-black text-white disabled:opacity-50"
      >
        {saving
          ? "Kaydediliyor..."
          : "Tercihleri kaydet"}
      </button>
    </section>
  );
}