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
  "/creator-payments",
)({
  component: CreatorPaymentsPage,
});

type OrderMetadata = {
  kind?: "gift" | "offer" | string;
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

function CreatorPaymentsPage() {
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

  useEffect(() => {
    let cancelled = false;

    async function loadPaymentPage() {
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
          .select("id")
          .eq(
            "creator_id",
            creator.id,
          );

        if (experienceError) {
          throw new Error(
            experienceError.message,
          );
        }

        const experienceIds =
          (experienceData ?? []).map(
            (experience) =>
              experience.id,
          );

        if (cancelled) {
          return;
        }

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
            : "Ödeme bilgileri yüklenemedi.";

        console.error(
          "Creator ödeme ekranı yüklenemedi:",
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

    void loadPaymentPage();

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
          "pending",
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

  const grossPaidAmountMinor =
    sumOrders(paidOrders);

  const pendingAmountMinor =
    sumOrders(pendingOrders);

  const primaryCurrency =
    paidOrders[0]?.currency ??
    pendingOrders[0]?.currency ??
    "TRY";

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            getTimestamp(b) -
            getTimestamp(a),
        )
        .slice(0, 30),
    [orders],
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
              Ödemeler
            </h1>

            <p className="mt-2 max-w-[620px] text-[11px] leading-5 text-muted-foreground">
              Gift ve Offer ödemelerinin
              işlem durumunu burada takip et.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/creator-earnings"
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-4 text-[9px] font-black"
            >
              Kazançlar
            </Link>

            <Link
              to="/creator-gifts"
              className="inline-flex h-10 items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-4 text-[9px] font-black text-violet-700"
            >
              🎁 Hediyeler
            </Link>
          </div>
        </header>

        {loading ? (
          <section className="mt-5 rounded-[24px] border border-border bg-white p-12 text-center">
            <p className="text-xs font-bold text-muted-foreground">
              Ödeme bilgileri yükleniyor...
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
              <PaymentMetric
                label="Başarılı ödeme"
                value={formatMoney(
                  grossPaidAmountMinor,
                  primaryCurrency,
                )}
                hint={`${paidOrders.length} işlem`}
              />

              <PaymentMetric
                label="Gift"
                value={`${giftOrders.length}`}
                hint="Başarılı hediye ödemesi"
                accent
              />

              <PaymentMetric
                label="Offer"
                value={`${offerOrders.length}`}
                hint="Başarılı Offer ödemesi"
              />

              <PaymentMetric
                label="Bekleyen"
                value={formatMoney(
                  pendingAmountMinor,
                  primaryCurrency,
                )}
                hint={`${pendingOrders.length} işlem`}
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="rounded-[24px] border border-border bg-white">
                <div className="border-b border-border p-4">
                  <h2 className="text-[13px] font-black">
                    Ödeme geçmişi
                  </h2>

                  <p className="mt-1 text-[9px] text-muted-foreground">
                    Son 30 işlem. Gift ve
                    Offer birlikte gösterilir.
                  </p>
                </div>

                {recentOrders.length ===
                0 ? (
                  <div className="p-12 text-center">
                    <p className="text-[11px] font-black">
                      Henüz ödeme yok.
                    </p>

                    <p className="mt-2 text-[9px] text-muted-foreground">
                      İlk ödeme burada
                      görünecek.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {recentOrders.map(
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
                            className="grid gap-3 p-4 sm:grid-cols-[88px_minmax(0,1fr)_100px_120px] sm:items-center"
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

                              <p className="mt-1 text-[7px] text-muted-foreground/70">
                                #
                                {order.id.slice(
                                  0,
                                  8,
                                )}
                              </p>
                            </div>

                            <StatusBadge
                              status={
                                order.status
                              }
                            />

                            <div className="sm:text-right">
                              <p className="text-[12px] font-black">
                                {formatMoney(
                                  normalizeMinorAmount(
                                    order.amount_minor,
                                  ),
                                  order.currency,
                                )}
                              </p>

                              <p className="mt-1 text-[7px] text-muted-foreground">
                                {formatDate(
                                  order.paid_at ??
                                    order.created_at,
                                )}
                              </p>
                            </div>
                          </article>
                        );
                      },
                    )}
                  </div>
                )}
              </div>

              <aside className="space-y-4">
                <div className="rounded-[24px] border border-border bg-white p-5">
                  <p className="text-[8px] font-black uppercase tracking-[0.1em] text-violet-600">
                    Para çekme
                  </p>

                  <h2 className="mt-3 text-[20px] font-black tracking-[-0.04em]">
                    Payout henüz aktif değil
                  </h2>

                  <p className="mt-3 text-[10px] leading-5 text-muted-foreground">
                    Şu an ekranda gördüğün
                    tutarlar gerçek sipariş
                    verileridir. Creator
                    hak edişi, komisyon,
                    çekilebilir bakiye ve
                    banka transferi altyapısı
                    henüz bağlanmadı.
                  </p>

                  <div className="mt-5 space-y-2">
                    <InfoRow
                      label="Ödeme hesabı"
                      value="Bağlanmadı"
                    />
                    <InfoRow
                      label="Banka hesabı"
                      value="Bağlanmadı"
                    />
                    <InfoRow
                      label="Çekilebilir bakiye"
                      value="—"
                    />
                    <InfoRow
                      label="Payout geçmişi"
                      value="—"
                    />
                  </div>
                </div>

                <div className="rounded-[24px] border border-amber-100 bg-amber-50 p-5">
                  <p className="text-[9px] font-black text-amber-900">
                    Sandbox ödeme modu
                  </p>

                  <p className="mt-2 text-[9px] leading-5 text-amber-800">
                    Canlı ödeme sağlayıcısı,
                    webhook doğrulaması,
                    refund/dispute ve payout
                    sistemi production öncesi
                    tamamlanacak.
                  </p>
                </div>
              </aside>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function PaymentMetric({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <article
      className={`rounded-[22px] border p-5 ${
        accent
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

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toLowerCase();

  if (normalized === "paid") {
    return (
      <span className="inline-flex w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-emerald-700">
        Ödendi
      </span>
    );
  }

  if (normalized === "pending") {
    return (
      <span className="inline-flex w-fit rounded-full bg-amber-50 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-amber-700">
        Bekliyor
      </span>
    );
  }

  if (
    normalized ===
    "payment_started"
  ) {
    return (
      <span className="inline-flex w-fit rounded-full bg-blue-50 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-blue-700">
        Başlatıldı
      </span>
    );
  }

  if (
    normalized === "failed"
  ) {
    return (
      <span className="inline-flex w-fit rounded-full bg-red-50 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-red-700">
        Başarısız
      </span>
    );
  }

  if (
    normalized ===
    "cancelled"
  ) {
    return (
      <span className="inline-flex w-fit rounded-full bg-neutral-100 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-neutral-600">
        İptal
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit rounded-full bg-neutral-100 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-neutral-600">
      {status}
    </span>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-background px-3 py-3">
      <span className="text-[8px] font-bold text-muted-foreground">
        {label}
      </span>

      <span className="text-[8px] font-black">
        {value}
      </span>
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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}