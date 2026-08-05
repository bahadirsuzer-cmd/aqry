import type {
  CreatorPayout,
} from "@/services/creatorFinance";

interface CreatorPayoutHistoryProps {
  payouts: CreatorPayout[];
  loading?: boolean;
}

const STATUS_LABELS: Record<
  CreatorPayout["status"],
  string
> = {
  requested: "Talep edildi",
  reviewing: "İnceleniyor",
  processing: "İşleniyor",
  paid: "Ödendi",
  failed: "Başarısız",
  cancelled: "İptal",
  reversed: "Geri alındı",
};

function formatMinor(
  amountMinor: number,
  currency: string,
) {
  try {
    return new Intl.NumberFormat(
      "tr-TR",
      {
        style: "currency",
        currency,
      },
    ).format(
      amountMinor / 100,
    );
  } catch {
    return `${(
      amountMinor / 100
    ).toFixed(2)} ${currency}`;
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
    return "";
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

export function CreatorPayoutHistory({
  payouts,
  loading = false,
}: CreatorPayoutHistoryProps) {
  if (loading) {
    return (
      <div className="rounded-[24px] border border-border bg-white p-6 text-[11px] text-muted-foreground">
        Payout geçmişi yükleniyor...
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <div className="rounded-[24px] border border-border bg-white p-6 text-center">
        <p className="text-[11px] font-black">
          Henüz payout yok
        </p>

        <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
          Payout sistemi aktif olduğunda çekim geçmişin burada görünecek.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-border bg-white">
      {payouts.map((payout) => (
        <div
          key={payout.id}
          className="flex flex-col gap-3 border-b border-border px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-[11px] font-black">
              {formatMinor(
                payout.amountMinor,
                payout.currency,
              )}
            </p>

            <p className="mt-1 text-[9px] text-muted-foreground">
              {formatDate(
                payout.requestedAt,
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#f4f4f5] px-3 py-1 text-[9px] font-black">
              {STATUS_LABELS[
                payout.status
              ]}
            </span>

            {payout.failureMessage ? (
              <span className="max-w-[240px] truncate text-[9px] text-red-600">
                {payout.failureMessage}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}