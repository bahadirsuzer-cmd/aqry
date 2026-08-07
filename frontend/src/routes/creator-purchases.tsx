import { CreatorNavigation } from "@/components/CreatorNavigation";
import {
  getCurrentCreator,
  signOutCreator,
} from "@/services/auth";
import { getParticipantKey } from "@/services/completions";
import { supabase } from "@/services/supabase";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute(
  "/creator-purchases",
)({
  component: CreatorPurchasesPage,
});

type Purchase = {
  id: string;
  experience_id: string;
  experience_title: string | null;
  offer_title: string | null;
  offer_description: string | null;
  amount_minor: number;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
};

function CreatorPurchasesPage() {
  const [loading, setLoading] =
    useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [purchases, setPurchases] =
    useState<Purchase[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadPurchases() {
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

        /*
         * AQRYO checkout is guest-first.
         * Existing purchases are currently identified by participant_key.
         *
         * When an authenticated account opens this page, we claim the
         * current browser's participant_key for that account. This makes
         * previous purchases from this browser visible without forcing
         * login before checkout.
         */
        const participantKey =
          getParticipantKey();

        const {
          error: claimError,
        } = await supabase.rpc(
          "claim_my_participant_key",
          {
            p_participant_key:
              participantKey,
          },
        );

        if (claimError) {
          throw new Error(
            claimError.message,
          );
        }

        const {
          data,
          error,
        } = await supabase.rpc(
          "get_my_offer_purchases",
        );

        if (error) {
          throw new Error(
            error.message,
          );
        }

        if (!cancelled) {
          setPurchases(
            (data ?? []) as Purchase[],
          );
        }
      } catch (error) {
        console.error(
          "Satın almalar yüklenemedi:",
          error,
        );

        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Satın almalar yüklenemedi.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPurchases();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalPaidMinor = useMemo(
    () =>
      purchases.reduce(
        (total, purchase) =>
          purchase.status === "paid"
            ? total +
              normalizeMinorAmount(
                purchase.amount_minor,
              )
            : total,
        0,
      ),
    [purchases],
  );

  const paidCount = useMemo(
    () =>
      purchases.filter(
        (purchase) =>
          purchase.status === "paid",
      ).length,
    [purchases],
  );

  return (
    <main className="min-h-screen bg-[#fbfbfd] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href =
            "/creator-auth";
        }}
      />

      <div className="mx-auto max-w-[1180px] px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
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
              Satın aldıklarım
            </h1>

            <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-muted-foreground">
              Satın aldığın Offer'ları,
              ücretlerini ve ödeme
              durumlarını burada görebilirsin.
            </p>
          </div>

          {!loading &&
          !errorMessage ? (
            <div className="flex gap-3">
              <SummaryPill
                label="Satın alma"
                value={`${paidCount}`}
              />
              <SummaryPill
                label="Toplam"
                value={formatMoney(
                  totalPaidMinor,
                  purchases[0]?.currency ??
                    "TRY",
                )}
              />
            </div>
          ) : null}
        </div>

        {loading ? (
          <section className="mt-6 rounded-[24px] border border-border bg-white p-12 text-center">
            <p className="text-[14px] font-bold text-muted-foreground">
              Satın almaların yükleniyor...
            </p>
          </section>
        ) : null}

        {errorMessage ? (
          <section className="mt-6 rounded-[24px] border border-red-100 bg-red-50 p-5">
            <p className="text-[13px] font-bold text-red-700">
              {errorMessage}
            </p>
          </section>
        ) : null}

        {!loading &&
        !errorMessage &&
        purchases.length === 0 ? (
          <section className="mt-6 rounded-[26px] border border-border bg-white p-10 text-center shadow-[0_18px_50px_rgba(18,10,40,0.04)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-primary/[0.06] text-primary">
              <BagIcon />
            </div>

            <h2 className="mt-5 text-[19px] font-black">
              Henüz satın alma yok
            </h2>

            <p className="mx-auto mt-2 max-w-[470px] text-[13px] leading-6 text-muted-foreground">
              Bu tarayıcıda satın aldığın
              Offer'lar hesabına bağlandığında
              burada görünecek.
            </p>
          </section>
        ) : null}

        {!loading &&
        !errorMessage &&
        purchases.length > 0 ? (
          <section className="mt-6 overflow-hidden rounded-[26px] border border-border bg-white shadow-[0_18px_50px_rgba(18,10,40,0.04)]">
            {purchases.map(
              (purchase, index) => (
                <article
                  key={purchase.id}
                  className={`grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_130px_150px] sm:items-center sm:p-6 ${
                    index > 0
                      ? "border-t border-border"
                      : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        status={
                          purchase.status
                        }
                      />

                      <span className="text-[11px] font-bold text-muted-foreground">
                        {formatDate(
                          purchase.paid_at ??
                            purchase.created_at,
                        )}
                      </span>
                    </div>

                    <h2 className="mt-3 truncate text-[16px] font-black tracking-[-0.02em]">
                      {purchase.offer_title ||
                        "Premium içerik"}
                    </h2>

                    <p className="mt-1 truncate text-[13px] font-semibold text-foreground/80">
                      {purchase.experience_title ||
                        "AQRYO Experience"}
                    </p>

                    {purchase.offer_description ? (
                      <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-muted-foreground">
                        {
                          purchase.offer_description
                        }
                      </p>
                    ) : null}
                  </div>

                  <div className="sm:text-right">
                    <p className="text-[11px] font-bold text-muted-foreground">
                      Ödenen
                    </p>

                    <p className="mt-1 text-[18px] font-black">
                      {formatMoney(
                        normalizeMinorAmount(
                          purchase.amount_minor,
                        ),
                        purchase.currency,
                      )}
                    </p>
                  </div>

                  <a
                    href={`/experience/${purchase.experience_id}`}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-[12px] font-black text-white transition hover:opacity-85"
                  >
                    İçeriği aç
                  </a>
                </article>
              ),
            )}
          </section>
        ) : null}

        <section className="mt-5 rounded-[22px] border border-primary/10 bg-primary/[0.035] p-5">
          <p className="text-[13px] font-black">
            Giriş yapmadan ödeme yapabilirsin
          </p>

          <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
            AQRYO ödeme öncesi üyeliği
            zorunlu tutmaz. Bu sayfa mevcut
            tarayıcıdaki satın almaları
            hesabına bağlar. Başka cihazlarda
            yapılan anonim satın almaları
            hesaba aktarma akışını ayrıca
            ekleyeceğiz.
          </p>
        </section>
      </div>
    </main>
  );
}

function SummaryPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[120px] rounded-[18px] border border-border bg-white px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-[18px] font-black">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toLowerCase();

  if (normalized === "paid") {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
        Satın alındı
      </span>
    );
  }

  if (
    normalized === "refunded" ||
    normalized ===
      "partially_refunded"
  ) {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">
        İade
      </span>
    );
  }

  if (normalized === "disputed") {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-700">
        İncelemede
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-black text-neutral-600">
      {status}
    </span>
  );
}

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function normalizeMinorAmount(
  value: unknown,
) {
  const numeric =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(numeric)
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
    ).format(amountMinor / 100);
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
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}