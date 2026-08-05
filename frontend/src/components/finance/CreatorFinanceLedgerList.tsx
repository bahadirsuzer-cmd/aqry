import type {
  CreatorFinanceLedgerEntry,
} from "@/services/creatorFinance";

interface CreatorFinanceLedgerListProps {
  entries: CreatorFinanceLedgerEntry[];
  loading?: boolean;
}

const LABELS: Record<
  CreatorFinanceLedgerEntry["entryType"],
  string
> = {
  earning_pending: "Bekleyen hak ediş",
  earning_available: "Çekilebilir hak ediş",
  earning_release: "Hak ediş serbest bırakıldı",
  refund_debit: "İade",
  chargeback_debit: "Chargeback",
  adjustment_credit: "Bakiye düzeltmesi",
  adjustment_debit: "Bakiye düzeltmesi",
  payout_debit: "Payout",
  payout_reversal: "Payout geri dönüşü",
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
    },
  ).format(date);
}

export function CreatorFinanceLedgerList({
  entries,
  loading = false,
}: CreatorFinanceLedgerListProps) {
  if (loading) {
    return (
      <div className="rounded-[24px] border border-border bg-white p-6 text-[11px] text-muted-foreground">
        Finans hareketleri yükleniyor...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-[24px] border border-border bg-white p-6 text-center">
        <p className="text-[11px] font-black">
          Henüz ledger hareketi yok
        </p>

        <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
          Sipariş → hak ediş entegrasyonu yapıldığında finans hareketleri burada oluşacak.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-border bg-white">
      {entries.map((entry) => {
        const positive =
          entry.amountMinor > 0;

        return (
          <div
            key={entry.id}
            className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate text-[11px] font-black">
                {LABELS[
                  entry.entryType
                ]}
              </p>

              <p className="mt-1 truncate text-[9px] text-muted-foreground">
                {entry.balanceBucket}
                {" · "}
                {formatDate(
                  entry.createdAt,
                )}
                {entry.orderId
                  ? ` · Order ${entry.orderId.slice(
                      0,
                      8,
                    )}`
                  : ""}
              </p>
            </div>

            <span
              className={`shrink-0 text-[12px] font-black ${
                positive
                  ? "text-emerald-700"
                  : "text-red-700"
              }`}
            >
              {positive ? "+" : ""}
              {formatMinor(
                entry.amountMinor,
                entry.currency,
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}