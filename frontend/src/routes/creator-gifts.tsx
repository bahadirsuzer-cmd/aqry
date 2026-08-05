import { CreatorNavigation } from "@/components/CreatorNavigation";
import {
  getCurrentCreator,
  signOutCreator,
} from "@/services/auth";
import { supabase } from "@/services/supabase";
import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

export const Route = createFileRoute(
  "/creator-gifts",
)({
  component: CreatorGiftsPage,
});

type GiftFollowupStatus =
  | "new"
  | "contacted"
  | "skipped";

type GiftMetadata = {
  kind?: string;
  giftKey?: string;
  giftTitle?: string;
  messageKey?: string;
  message?: string;
  contactType?: string;
  contactValue?: string;
  responseGuaranteed?: boolean;
  creatorFollowupStatus?: GiftFollowupStatus;
  creatorFollowupUpdatedAt?: string;
};

type GiftOrder = {
  id: string;
  experience_id: string;
  experience_title: string | null;
  amount_minor: number;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  metadata: GiftMetadata | null;
};

type ExperienceSummary = {
  id: string;
  title: string;
};

type GiftFollowupRecord = {
  order_id: string;
  status: GiftFollowupStatus;
};

const GIFT_EMOJI: Record<
  string,
  string
> = {
  rose: "🌹",
  coffee: "☕",
  heart: "💜",
  crown: "👑",
  rocket: "🚀",
};

const CONTACT_LABELS: Record<
  string,
  string
> = {
  instagram: "Instagram",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  email: "E-posta",
};

function CreatorGiftsPage() {
  const [loading, setLoading] =
    useState(true);
  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  );
  const [orders, setOrders] =
    useState<GiftOrder[]>([]);
  const [
    experiences,
    setExperiences,
  ] = useState<
    ExperienceSummary[]
  >([]);
  const [
    selectedExperienceId,
    setSelectedExperienceId,
  ] = useState("all");
  const [
    savingFollowupOrderId,
    setSavingFollowupOrderId,
  ] = useState<string | null>(null);
  const [
    creatorId,
    setCreatorId,
  ] = useState("");
  const [
    followups,
    setFollowups,
  ] = useState<
    Record<string, GiftFollowupStatus>
  >({});

  useEffect(() => {
    let cancelled = false;

    async function loadGifts() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const creator =
          await getCurrentCreator();

        if (!creator) {
          window.location.href =
            "/creator-auth";
          return;
        }

        if (!cancelled) {
          setCreatorId(creator.id);
        }

        const {
          data: experienceData,
          error: experienceError,
        } = await supabase
          .from("experiences")
          .select("id, title")
          .eq(
            "creator_id",
            creator.id,
          )
          .order("published_at", {
            ascending: false,
          });

        if (experienceError) {
          throw new Error(
            experienceError.message,
          );
        }

        const creatorExperiences =
          (experienceData ??
            []) as ExperienceSummary[];

        if (cancelled) {
          return;
        }

        setExperiences(
          creatorExperiences,
        );

        const experienceIds =
          creatorExperiences.map(
            (experience) =>
              experience.id,
          );

        if (
          experienceIds.length ===
          0
        ) {
          setOrders([]);
          setFollowups({});
          return;
        }

        const {
          data: orderData,
          error: orderError,
        } = await supabase
          .from("orders")
          .select(
            `
              id,
              experience_id,
              experience_title,
              amount_minor,
              currency,
              status,
              paid_at,
              created_at,
              metadata
            `,
          )
          .in(
            "experience_id",
            experienceIds,
          )
          .order("created_at", {
            ascending: false,
          });

        if (orderError) {
          throw new Error(
            orderError.message,
          );
        }

        if (cancelled) {
          return;
        }

        const giftOrders = (
          (orderData ??
            []) as GiftOrder[]
        ).filter(
          (order) =>
            order.metadata?.kind ===
            "gift",
        );

        setOrders(giftOrders);

        const giftOrderIds =
          giftOrders.map(
            (gift) => gift.id,
          );

        if (giftOrderIds.length === 0) {
          setFollowups({});
        } else {
          const {
            data: followupData,
            error: followupError,
          } = await supabase
            .from("creator_gift_followups")
            .select("order_id, status")
            .eq(
              "creator_id",
              creator.id,
            )
            .in(
              "order_id",
              giftOrderIds,
            );

          if (followupError) {
            throw new Error(
              followupError.message,
            );
          }

          const nextFollowups:
            Record<
              string,
              GiftFollowupStatus
            > = {};

          for (
            const item of
              (followupData ??
                []) as GiftFollowupRecord[]
          ) {
            nextFollowups[
              item.order_id
            ] = item.status;
          }

          if (!cancelled) {
            setFollowups(
              nextFollowups,
            );
          }
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Hediyeler yüklenemedi.";

        console.error(
          "Creator hediyeleri yüklenemedi:",
          error,
        );

        if (!cancelled) {
          setErrorMessage(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadGifts();

    return () => {
      cancelled = true;
    };
  }, []);

  async function updateGiftFollowupStatus(
    gift: GiftOrder,
    status: GiftFollowupStatus,
  ) {
    if (
      savingFollowupOrderId ===
        gift.id ||
      !creatorId
    ) {
      return;
    }

    try {
      setSavingFollowupOrderId(
        gift.id,
      );

      const {
        error: upsertError,
      } = await supabase
        .from(
          "creator_gift_followups",
        )
        .upsert(
          {
            order_id: gift.id,
            creator_id: creatorId,
            status,
            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict: "order_id",
          },
        );

      if (upsertError) {
        throw new Error(
          upsertError.message,
        );
      }

      setFollowups(
        (current) => ({
          ...current,
          [gift.id]: status,
        }),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Takip durumu kaydedilemedi.";

      console.error(
        "Gift takip durumu kaydedilemedi:",
        error,
      );

      window.alert(message);
    } finally {
      setSavingFollowupOrderId(
        null,
      );
    }
  }

  const paidGifts = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "paid",
      ),
    [orders],
  );

  const paidTotalMinor =
    useMemo(
      () =>
        paidGifts.reduce(
          (total, order) =>
            total +
            normalizeMinorAmount(
              order.amount_minor,
            ),
          0,
        ),
      [paidGifts],
    );

  const uniqueSupporters =
    useMemo(
      () =>
        new Set(
          paidGifts.map(
            (order) =>
              getSupporterIdentity(
                order,
              ),
          ),
        ).size,
      [paidGifts],
    );

  const filteredGifts =
    useMemo(() => {
      if (
        selectedExperienceId ===
        "all"
      ) {
        return paidGifts;
      }

      return paidGifts.filter(
        (gift) =>
          gift.experience_id ===
          selectedExperienceId,
      );
    }, [
      paidGifts,
      selectedExperienceId,
    ]);

  const topGift =
    useMemo(() => {
      return [...paidGifts].sort(
        (a, b) =>
          normalizeMinorAmount(
            b.amount_minor,
          ) -
          normalizeMinorAmount(
            a.amount_minor,
          ),
      )[0];
    }, [paidGifts]);

  return (
    <main className="min-h-screen bg-[#f8f8fa] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href =
            "/creator-auth";
        }}
      />

      <div className="mx-auto max-w-[1320px] px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-violet-600">
              Creator
            </p>

            <h1 className="mt-1 text-[30px] font-black tracking-[-0.055em] sm:text-[36px]">
              Hediyeler
            </h1>

            <p className="mt-2 max-w-[640px] text-[11px] leading-5 text-muted-foreground">
              Experience’larından gelen
              hediyeleri, hazır mesajları
              ve bırakılmış iletişim
              bilgilerini burada görürsün.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/creator-earnings"
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-4 text-[9px] font-black"
            >
              Kazançlara git
            </Link>

            <Link
              to="/creator-experiences"
              className="inline-flex h-10 items-center justify-center rounded-full bg-black px-4 text-[9px] font-black text-white"
            >
              Experience’lar
            </Link>
          </div>
        </header>

        {loading ? (
          <section className="mt-5 rounded-[24px] border border-border bg-white p-12 text-center">
            <p className="text-xs font-bold text-muted-foreground">
              Hediyeler yükleniyor...
            </p>
          </section>
        ) : null}

        {errorMessage ? (
          <section className="mt-5 rounded-[22px] border border-red-100 bg-red-50 p-5">
            <p className="text-[10px] font-bold text-red-700">
              {errorMessage}
            </p>
          </section>
        ) : null}

        {!loading &&
        !errorMessage ? (
          <>
            <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Toplam hediye"
                value={`${paidGifts.length}`}
                helper="Ödemesi tamamlanan"
              />

              <StatCard
                label="Hediye geliri"
                value={formatMoney(
                  paidTotalMinor,
                  paidGifts[0]
                    ?.currency ??
                    "TRY",
                )}
                helper="Brüt hediye tutarı"
              />

              <StatCard
                label="Destekçiler"
                value={`${uniqueSupporters}`}
                helper="Görünen kimliklere göre"
              />

              <StatCard
                label="En büyük hediye"
                value={
                  topGift
                    ? `${getGiftEmoji(
                        topGift,
                      )} ${formatMoney(
                        normalizeMinorAmount(
                          topGift.amount_minor,
                        ),
                        topGift.currency,
                      )}`
                    : "—"
                }
                helper={
                  topGift?.metadata
                    ?.giftTitle ??
                  "Henüz yok"
                }
              />
            </section>

            <section className="mt-5 rounded-[24px] border border-border bg-white">
              <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[13px] font-black">
                    Gelen hediyeler
                  </h2>

                  <p className="mt-1 text-[9px] text-muted-foreground">
                    En yeni ödeme üstte.
                  </p>
                </div>

                <select
                  value={
                    selectedExperienceId
                  }
                  onChange={(event) =>
                    setSelectedExperienceId(
                      event.target
                        .value,
                    )
                  }
                  className="h-10 rounded-full border border-border bg-background px-4 text-[9px] font-bold outline-none"
                >
                  <option value="all">
                    Tüm Experience’lar
                  </option>

                  {experiences.map(
                    (experience) => (
                      <option
                        key={
                          experience.id
                        }
                        value={
                          experience.id
                        }
                      >
                        {experience.title}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {filteredGifts.length ===
              0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-[30px]">
                    🎁
                  </div>

                  <h3 className="mt-4 text-[17px] font-black">
                    Henüz hediye yok.
                  </h3>

                  <p className="mx-auto mt-2 max-w-[420px] text-[10px] leading-5 text-muted-foreground">
                    Bir katılımcı
                    Experience sonucundan
                    hediye gönderdiğinde
                    burada görünecek.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredGifts.map(
                    (gift) => (
                      <GiftRow
                        key={gift.id}
                        gift={gift}
                        followupStatus={
                          followups[
                            gift.id
                          ] ?? "new"
                        }
                        saving={
                          savingFollowupOrderId ===
                          gift.id
                        }
                        onFollowupStatusChange={
                          (status) =>
                            void updateGiftFollowupStatus(
                              gift,
                              status,
                            )
                        }
                      />
                    ),
                  )}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

function GiftRow({
  gift,
  followupStatus,
  saving,
  onFollowupStatusChange,
}: {
  gift: GiftOrder;
  followupStatus: GiftFollowupStatus;
  saving: boolean;
  onFollowupStatusChange: (
    status: GiftFollowupStatus,
  ) => void;
}) {
  const metadata =
    gift.metadata ?? {};

  const contactType =
    metadata.contactType ??
    "none";

  const contactValue =
    metadata.contactValue?.trim() ??
    "";

  const contactHref =
    getContactHref(
      contactType,
      contactValue,
    );

  const supporterLabel =
    getSupporterLabel(gift);

  const contactActionLabel =
    getContactActionLabel(
      contactType,
    );

  return (
    <article className="grid gap-4 p-4 transition hover:bg-[#fbfbfd] sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-start">
      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-violet-50 text-[30px]">
        {getGiftEmoji(gift)}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="text-[12px] font-black">
            {metadata.giftTitle ??
              "Hediye"}
          </h3>

          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-emerald-700">
            Ödendi
          </span>
        </div>

        <p className="mt-1 truncate text-[9px] font-bold text-muted-foreground">
          {gift.experience_title ??
            "Experience"}
        </p>

        {metadata.message ? (
          <div className="mt-3 inline-flex rounded-[14px] bg-background px-3 py-2">
            <p className="text-[9px] font-bold">
              “{metadata.message}”
            </p>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[8px] font-bold text-muted-foreground">
            {supporterLabel}
          </span>

          {contactType !==
            "none" &&
          contactValue ? (
            <span className="inline-flex h-8 items-center rounded-full border border-border bg-white px-3 text-[8px] font-bold text-muted-foreground">
              {CONTACT_LABELS[
                contactType
              ] ??
                "İletişim"}
              : {contactValue}
            </span>
          ) : (
            <span className="inline-flex h-8 items-center rounded-full border border-border bg-white px-3 text-[8px] font-bold text-muted-foreground">
              Anonim
            </span>
          )}

          {contactHref ? (
            <a
              href={contactHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center rounded-full bg-black px-3 text-[8px] font-black text-white transition hover:bg-violet-600"
            >
              {contactActionLabel} →
            </a>
          ) : null}
        </div>

        <div className="mt-4 border-t border-border/70 pt-3">
          <p className="text-[7px] font-black uppercase tracking-[0.1em] text-muted-foreground">
            Takip durumu
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <FollowupButton
              label="Yeni"
              active={
                followupStatus ===
                "new"
              }
              disabled={saving}
              onClick={() =>
                onFollowupStatusChange(
                  "new",
                )
              }
            />

            <FollowupButton
              label="İletişime geçtim"
              active={
                followupStatus ===
                "contacted"
              }
              disabled={saving}
              onClick={() =>
                onFollowupStatusChange(
                  "contacted",
                )
              }
            />

            <FollowupButton
              label="Pas geçtim"
              active={
                followupStatus ===
                "skipped"
              }
              disabled={saving}
              onClick={() =>
                onFollowupStatusChange(
                  "skipped",
                )
              }
            />

            {saving ? (
              <span className="inline-flex h-8 items-center px-2 text-[8px] font-bold text-muted-foreground">
                Kaydediliyor...
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="sm:text-right">
        <p className="text-[16px] font-black tracking-[-0.03em]">
          {formatMoney(
            normalizeMinorAmount(
              gift.amount_minor,
            ),
            gift.currency,
          )}
        </p>

        <p className="mt-1 text-[8px] font-bold text-muted-foreground">
          {formatDate(
            gift.paid_at ??
              gift.created_at,
          )}
        </p>

        <p className="mt-1 text-[7px] text-muted-foreground/70">
          #{gift.id.slice(0, 8)}
        </p>
      </div>
    </article>
  );
}

function FollowupButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 items-center rounded-full border px-3 text-[8px] font-black transition disabled:cursor-wait disabled:opacity-60 ${
        active
          ? "border-violet-600 bg-violet-600 text-white"
          : "border-border bg-white text-muted-foreground hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
      }`}
    >
      {label}
    </button>
  );
}


function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[22px] border border-border bg-white p-5">
      <p className="text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-3 text-[24px] font-black tracking-[-0.05em]">
        {value}
      </p>

      <p className="mt-1 text-[8px] font-bold text-muted-foreground">
        {helper}
      </p>
    </div>
  );
}

function getGiftEmoji(
  gift: GiftOrder,
) {
  const key =
    gift.metadata?.giftKey ??
    "";

  return (
    GIFT_EMOJI[key] ?? "🎁"
  );
}

function getSupporterLabel(
  gift: GiftOrder,
) {
  const contactType =
    gift.metadata?.contactType ??
    "none";

  const contactValue =
    gift.metadata?.contactValue?.trim() ??
    "";

  if (
    contactType === "none" ||
    !contactValue
  ) {
    return "Anonim destekçi";
  }

  return (
    CONTACT_LABELS[
      contactType
    ] ?? "Destekçi"
  );
}

function getSupporterIdentity(
  gift: GiftOrder,
) {
  const contactType =
    gift.metadata?.contactType ??
    "none";

  const contactValue =
    gift.metadata?.contactValue?.trim() ??
    "";

  if (
    contactType !== "none" &&
    contactValue
  ) {
    return `${contactType}:${contactValue.toLowerCase()}`;
  }

  return `anon:${gift.id}`;
}

function getContactActionLabel(
  type: string,
) {
  if (type === "whatsapp") {
    return "WhatsApp’tan yanıtla";
  }

  if (type === "instagram") {
    return "Instagram’da aç";
  }

  if (type === "telegram") {
    return "Telegram’dan yaz";
  }

  if (type === "email") {
    return "E-posta gönder";
  }

  return "İletişime geç";
}

function getContactHref(
  type: string,
  value: string,
) {
  if (!value) {
    return null;
  }

  if (type === "email") {
    return `mailto:${value}`;
  }

  if (type === "instagram") {
    const username =
      value
        .replace(/^@/, "")
        .replace(
          /[^a-zA-Z0-9._]/g,
          "",
        );

    return username
      ? `https://instagram.com/${username}`
      : null;
  }

  if (type === "telegram") {
    const username =
      value
        .replace(/^@/, "")
        .replace(
          /[^a-zA-Z0-9_]/g,
          "",
        );

    return username
      ? `https://t.me/${username}`
      : null;
  }

  if (type === "whatsapp") {
    const phone =
      value.replace(/\D/g, "");

    return phone
      ? `https://wa.me/${phone}`
      : null;
  }

  return null;
}

function normalizeMinorAmount(
  value: unknown,
) {
  const numeric =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(
    numeric,
  )
    ? Math.max(
        0,
        Math.round(numeric),
      )
    : 0;
}

function formatMoney(
  amountMinor: number,
  currency: string,
) {
  try {
    return new Intl.NumberFormat(
      "tr-TR",
      {
        style: "currency",
        currency:
          currency || "TRY",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
    ).format(
      amountMinor / 100,
    );
  } catch {
    return `${(
      amountMinor / 100
    ).toFixed(2)} ${
      currency || "TRY"
    }`;
  }
}

function formatDate(
  value: string,
) {
  const date =
    new Date(value);

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
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}