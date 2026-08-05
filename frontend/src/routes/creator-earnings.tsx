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
  "/creator-earnings",
)({
  component: CreatorEarningsPage,
});

type OrderMetadata = {
  kind?: "gift" | "offer" | string;
  giftKey?: string;
  giftTitle?: string;
};

type CreatorOrder = {
  id: string;
  experience_id: string;
  experience_title: string | null;
  offer_title: string | null;
  amount_minor: number;
  currency: string;
  status: string;
  created_at: string;
  paid_at: string | null;
  metadata: OrderMetadata | null;
};

type CreatorExperience = {
  id: string;
  title: string;
};

type RevenueRow = {
  experienceId: string;
  title: string;
  giftAmountMinor: number;
  offerAmountMinor: number;
  totalAmountMinor: number;
  giftCount: number;
  offerCount: number;
};

function CreatorEarningsPage() {
  const [loading, setLoading] =
    useState(true);
  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  );
  const [orders, setOrders] =
    useState<CreatorOrder[]>([]);
  const [
    experiences,
    setExperiences,
  ] = useState<
    CreatorExperience[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
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

        const {
          data: experienceData,
          error: experienceError,
        } = await supabase
          .from("experiences")
          .select("id, title")
          .eq(
            "creator_id",
            creator.id,
          );

        if (experienceError) {
          throw new Error(
            experienceError.message,
          );
        }

        const creatorExperiences =
          (experienceData ??
            []) as CreatorExperience[];

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
              offer_title,
              amount_minor,
              currency,
              status,
              created_at,
              paid_at,
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

        if (!cancelled) {
          setOrders(
            (orderData ??
              []) as CreatorOrder[],
          );
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Kazanç bilgileri yüklenemedi.";

        console.error(
          "Creator kazançları yüklenemedi:",
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

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const paidOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "paid",
      ),
    [orders],
  );

  const pendingOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status ===
            "pending" ||
          order.status ===
            "payment_started",
      ),
    [orders],
  );

  const giftOrders = useMemo(
    () =>
      paidOrders.filter(
        (order) =>
          order.metadata?.kind ===
          "gift",
      ),
    [paidOrders],
  );

  const offerOrders = useMemo(
    () =>
      paidOrders.filter(
        (order) =>
          order.metadata?.kind !==
          "gift",
      ),
    [paidOrders],
  );

  const grossAmountMinor =
    sumOrders(paidOrders);

  const giftAmountMinor =
    sumOrders(giftOrders);

  const offerAmountMinor =
    sumOrders(offerOrders);

  const pendingAmountMinor =
    sumOrders(pendingOrders);

  const primaryCurrency =
    paidOrders[0]?.currency ??
    pendingOrders[0]?.currency ??
    "TRY";

  const revenueRows =
    useMemo<RevenueRow[]>(() => {
      const titleById =
        new Map(
          experiences.map(
            (experience) => [
              experience.id,
              experience.title,
            ],
          ),
        );

      const rows =
        new Map<
          string,
          RevenueRow
        >();

      for (const order of paidOrders) {
        const id =
          order.experience_id;

        const existing =
          rows.get(id) ?? {
            experienceId: id,
            title:
              order.experience_title ||
              titleById.get(id) ||
              "İsimsiz Experience",
            giftAmountMinor: 0,
            offerAmountMinor: 0,
            totalAmountMinor: 0,
            giftCount: 0,
            offerCount: 0,
          };

        const amount =
          normalizeMinorAmount(
            order.amount_minor,
          );

        if (
          order.metadata?.kind ===
          "gift"
        ) {
          existing.giftAmountMinor +=
            amount;
          existing.giftCount += 1;
        } else {
          existing.offerAmountMinor +=
            amount;
          existing.offerCount += 1;
        }

        existing.totalAmountMinor +=
          amount;

        rows.set(id, existing);
      }

      return Array.from(
        rows.values(),
      ).sort(
        (a, b) =>
          b.totalAmountMinor -
          a.totalAmountMinor,
      );
    }, [
      experiences,
      paidOrders,
    ]);

  const recentPaidOrders =
    useMemo(
      () =>
        [...paidOrders]
          .sort(
            (a, b) =>
              getTimestamp(b) -
              getTimestamp(a),
          )
          .slice(0, 20),
      [paidOrders],
    );

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
              Kazançlar
            </h1>

            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
              Gift ve Offer gelirlerini
              tek yerde gör.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/creator-gifts"
              className="inline-flex h-10 items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-4 text-[9px] font-black text-violet-700"
            >
              🎁 Hediyeler
            </Link>

            <Link
              to="/creator-payments"
              className="inline-flex h-10 items-center justify-center rounded-full bg-black px-4 text-[9px] font-black text-white"
            >
              Ödemeler
            </Link>
          </div>
        </header>

        {loading ? (
          <section className="mt-5 rounded-[24px] border border-border bg-white p-12 text-center">
            <p className="text-xs font-bold text-muted-foreground">
              Kazançlar yükleniyor...
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
          <div className="mt-5 space-y-5">
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Toplam gelir"
                value={formatMoney(
                  grossAmountMinor,
                  primaryCurrency,
                )}
                hint={`${paidOrders.length} başarılı ödeme`}
              />

              <MetricCard
                label="Gift geliri"
                value={formatMoney(
                  giftAmountMinor,
                  primaryCurrency,
                )}
                hint={`${giftOrders.length} hediye`}
                accent="gift"
              />

              <MetricCard
                label="Offer geliri"
                value={formatMoney(
                  offerAmountMinor,
                  primaryCurrency,
                )}
                hint={`${offerOrders.length} satış`}
              />

              <MetricCard
                label="Ödeme bekliyor"
                value={formatMoney(
                  pendingAmountMinor,
                  primaryCurrency,
                )}
                hint={`${pendingOrders.length} işlem`}
              />
            </section>

            <section className="rounded-[24px] border border-border bg-white">
              <div className="border-b border-border p-4">
                <h2 className="text-[13px] font-black">
                  Experience bazında
                </h2>

                <p className="mt-1 text-[9px] text-muted-foreground">
                  Hangi içerik Gift,
                  hangisi Offer geliri
                  üretiyor hemen gör.
                </p>
              </div>

              {revenueRows.length ===
              0 ? (
                <EmptyState />
              ) : (
                <div className="divide-y divide-border">
                  {revenueRows.map(
                    (row) => (
                      <article
                        key={
                          row.experienceId
                        }
                        className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_110px_110px_120px] sm:items-center"
                      >
                        <div className="min-w-0">
                          <h3 className="truncate text-[11px] font-black">
                            {row.title}
                          </h3>

                          <p className="mt-1 text-[8px] text-muted-foreground">
                            {row.giftCount} Gift
                            ·{" "}
                            {row.offerCount}{" "}
                            Offer
                          </p>
                        </div>

                        <MoneyColumn
                          label="Gift"
                          value={formatMoney(
                            row.giftAmountMinor,
                            primaryCurrency,
                          )}
                        />

                        <MoneyColumn
                          label="Offer"
                          value={formatMoney(
                            row.offerAmountMinor,
                            primaryCurrency,
                          )}
                        />

                        <MoneyColumn
                          label="Toplam"
                          value={formatMoney(
                            row.totalAmountMinor,
                            primaryCurrency,
                          )}
                          strong
                        />
                      </article>
                    ),
                  )}
                </div>
              )}
            </section>

            <section className="rounded-[24px] border border-border bg-white">
              <div className="border-b border-border p-4">
                <h2 className="text-[13px] font-black">
                  Son ödemeler
                </h2>

                <p className="mt-1 text-[9px] text-muted-foreground">
                  Son 20 başarılı işlem.
                </p>
              </div>

              {recentPaidOrders.length ===
              0 ? (
                <EmptyState />
              ) : (
                <div className="divide-y divide-border">
                  {recentPaidOrders.map(
                    (order) => {
                      const isGift =
                        order.metadata
                          ?.kind ===
                        "gift";

                      return (
                        <article
                          key={
                            order.id
                          }
                          className="grid gap-3 p-4 sm:grid-cols-[100px_minmax(0,1fr)_120px_120px] sm:items-center"
                        >
                          <div>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.08em] ${
                                isGift
                                  ? "bg-violet-50 text-violet-700"
                                  : "bg-neutral-100 text-neutral-700"
                              }`}
                            >
                              {isGift
                                ? "🎁 Gift"
                                : "Offer"}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[10px] font-black">
                              {order.experience_title ??
                                "Experience"}
                            </p>

                            <p className="mt-1 truncate text-[8px] text-muted-foreground">
                              {isGift
                                ? order.metadata
                                    ?.giftTitle ??
                                  "Hediye"
                                : order.offer_title ??
                                  "Offer"}
                            </p>
                          </div>

                          <p className="text-[8px] font-bold text-muted-foreground sm:text-right">
                            {formatDate(
                              order.paid_at ??
                                order.created_at,
                            )}
                          </p>

                          <p className="text-[13px] font-black sm:text-right">
                            {formatMoney(
                              normalizeMinorAmount(
                                order.amount_minor,
                              ),
                              order.currency,
                            )}
                          </p>
                        </article>
                      );
                    },
                  )}
                </div>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: "gift";
}) {
  return (
    <article
      className={`rounded-[22px] border p-5 ${
        accent === "gift"
          ? "border-violet-100 bg-violet-50/60"
          : "border-border bg-white"
      }`}
    >
      <p className="text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-3 text-[25px] font-black tracking-[-0.05em]">
        {value}
      </p>

      <p className="mt-1 text-[8px] font-bold text-muted-foreground">
        {hint}
      </p>
    </article>
  );
}

function MoneyColumn({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="sm:text-right">
      <p className="text-[7px] font-black uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-1 ${
          strong
            ? "text-[13px] font-black"
            : "text-[10px] font-bold"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-10 text-center">
      <p className="text-[11px] font-black">
        Henüz gelir yok.
      </p>

      <p className="mt-2 text-[9px] text-muted-foreground">
        İlk Gift veya Offer ödemesi
        burada görünecek.
      </p>
    </div>
  );
}

function sumOrders(
  orders: CreatorOrder[],
) {
  return orders.reduce(
    (total, order) =>
      total +
      normalizeMinorAmount(
        order.amount_minor,
      ),
    0,
  );
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

function getTimestamp(
  order: CreatorOrder,
) {
  const date = new Date(
    order.paid_at ??
      order.created_at,
  );

  return Number.isNaN(
    date.getTime(),
  )
    ? 0
    : date.getTime();
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
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}