import type {
  CreatorFinanceBalance,
} from "@/services/creatorFinance";

interface CreatorBalanceSummaryProps {
  balances: CreatorFinanceBalance[];
  loading?: boolean;
}

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

export function CreatorBalanceSummary({
  balances,
  loading = false,
}: CreatorBalanceSummaryProps) {
  if (loading) {
    return (
      <div className="rounded-[24px] border border-border bg-white p-6 text-[11px] text-muted-foreground">
        Bakiye yükleniyor...
      </div>
    );
  }

  if (balances.length === 0) {
    return (
      <div className="rounded-[24px] border border-border bg-white p-6">
        <p className="text-[11px] font-black">
          Henüz payout bakiyesi oluşmadı
        </p>

        <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
          Mevcut satışların creator finance ledger’a aktarılması entegrasyon aşamasında yapılacak.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {balances.map((balance) => (
        <section
          key={balance.currency}
          className="rounded-[24px] border border-border bg-white p-5 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-primary">
                {balance.currency}
              </p>

              <h2 className="mt-1 text-[22px] font-black tracking-[-0.04em]">
                Creator bakiyesi
              </h2>
            </div>

            <div className="rounded-full bg-primary/[0.07] px-3 py-1 text-[9px] font-black text-primary">
              Ledger
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[18px] bg-amber-50 p-4">
              <p className="text-[8px] font-black uppercase tracking-[0.08em] text-amber-700">
                Bekleyen
              </p>

              <p className="mt-2 text-[20px] font-black tracking-[-0.04em]">
                {formatMinor(
                  balance.pendingMinor,
                  balance.currency,
                )}
              </p>

              <p className="mt-1 text-[8px] leading-4 text-muted-foreground">
                Hold / risk süresi tamamlanmamış hak ediş.
              </p>
            </div>

            <div className="rounded-[18px] bg-emerald-50 p-4">
              <p className="text-[8px] font-black uppercase tracking-[0.08em] text-emerald-700">
                Çekilebilir
              </p>

              <p className="mt-2 text-[20px] font-black tracking-[-0.04em]">
                {formatMinor(
                  balance.availableMinor,
                  balance.currency,
                )}
              </p>

              <p className="mt-1 text-[8px] leading-4 text-muted-foreground">
                Payout koşulları sağlandığında çekilebilir.
              </p>
            </div>

            <div className="rounded-[18px] bg-[#f7f7f8] p-4">
              <p className="text-[8px] font-black uppercase tracking-[0.08em] text-muted-foreground">
                Ödenmiş
              </p>

              <p className="mt-2 text-[20px] font-black tracking-[-0.04em]">
                {formatMinor(
                  balance.paidMinor,
                  balance.currency,
                )}
              </p>

              <p className="mt-1 text-[8px] leading-4 text-muted-foreground">
                Tamamlanmış payout hareketleri.
              </p>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}