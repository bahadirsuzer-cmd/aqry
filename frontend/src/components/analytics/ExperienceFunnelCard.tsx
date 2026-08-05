import type {
  ExperienceFunnel,
} from "@/services/experienceAnalytics";

interface ExperienceFunnelCardProps {
  funnel: ExperienceFunnel;
}

function percent(
  value: number,
) {
  return new Intl.NumberFormat(
    "tr-TR",
    {
      style: "percent",
      maximumFractionDigits: 1,
    },
  ).format(value);
}

export function ExperienceFunnelCard({
  funnel,
}: ExperienceFunnelCardProps) {
  const rows = [
    {
      label: "Görüntüleme",
      value: funnel.views,
      rateLabel: null,
    },
    {
      label: "Başlatma",
      value: funnel.starts,
      rateLabel:
        percent(
          funnel.startRate,
        ),
    },
    {
      label: "Tamamlama",
      value: funnel.completions,
      rateLabel:
        percent(
          funnel.completionRate,
        ),
    },
    {
      label: "Result",
      value: funnel.resultViews,
      rateLabel: null,
    },
    {
      label: "Offer görüntüleme",
      value: funnel.offerViews,
      rateLabel: null,
    },
    {
      label: "Offer satın alma",
      value: funnel.offerPurchases,
      rateLabel:
        percent(
          funnel.offerConversionRate,
        ),
    },
    {
      label: "Gift",
      value: funnel.giftPurchases,
      rateLabel:
        percent(
          funnel.giftConversionRate,
        ),
    },
    {
      label: "Paylaşım",
      value: funnel.shares,
      rateLabel:
        percent(
          funnel.shareRate,
        ),
    },
  ];

  return (
    <section className="rounded-[24px] border border-border bg-white p-5 sm:p-6">
      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-primary">
        Dönüşüm hunisi
      </p>

      <h2 className="mt-2 text-[21px] font-black tracking-[-0.04em]">
        Experience performansı
      </h2>

      <div className="mt-5 divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-5 py-3"
          >
            <p className="text-[10px] font-bold text-muted-foreground">
              {row.label}
            </p>

            <div className="flex items-center gap-3">
              {row.rateLabel ? (
                <span className="rounded-full bg-primary/[0.06] px-2.5 py-1 text-[8px] font-black text-primary">
                  {row.rateLabel}
                </span>
              ) : null}

              <span className="min-w-[34px] text-right text-[13px] font-black">
                {row.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}