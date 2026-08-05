interface CreatorPayoutPreparationCardProps {
  countryLabel?: string;
}

export function CreatorPayoutPreparationCard({
  countryLabel = "Henüz seçilmedi",
}: CreatorPayoutPreparationCardProps) {
  return (
    <section className="rounded-[22px] border border-border bg-white p-5 sm:p-6">
      <p className="text-[8px] font-black uppercase tracking-[0.09em] text-primary">
        Ödeme alma
      </p>

      <h2 className="mt-2 text-[20px] font-black tracking-[-0.035em]">
        Payout hesabı
      </h2>

      <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
        Creator payout sistemi henüz aktif değil. Bu alan gelecekte ülke, kimlik/KYC ve ödeme alma hesabı bağlantısını yönetecek.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[16px] bg-[#fafafa] p-4">
          <p className="text-[8px] font-black uppercase tracking-[0.06em] text-muted-foreground">
            Ülke
          </p>
          <p className="mt-2 text-[11px] font-black">
            {countryLabel}
          </p>
        </div>

        <div className="rounded-[16px] bg-[#fafafa] p-4">
          <p className="text-[8px] font-black uppercase tracking-[0.06em] text-muted-foreground">
            Kimlik
          </p>
          <p className="mt-2 text-[11px] font-black">
            Bağlı değil
          </p>
        </div>

        <div className="rounded-[16px] bg-[#fafafa] p-4">
          <p className="text-[8px] font-black uppercase tracking-[0.06em] text-muted-foreground">
            Payout yöntemi
          </p>
          <p className="mt-2 text-[11px] font-black">
            Bağlı değil
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-[9px] leading-4 text-amber-800">
          Buraya şimdilik IBAN veya sahte payout bilgisi girilmeyecek. Provider ve ülke modeli kesinleşince gerçek onboarding bağlanacak.
        </p>
      </div>
    </section>
  );
}