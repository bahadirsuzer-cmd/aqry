import { useState } from "react";

interface OfferCardProps {
  price?: number;
  currency?: string;
}

export function OfferCard({
  price = 19,
  currency = "TL",
}: OfferCardProps) {
  const [isSelected, setIsSelected] = useState(false);

  if (isSelected) {
    return (
      <section className="overflow-hidden rounded-3xl border border-primary/30 bg-card shadow-soft">
        <div className="space-y-5 p-6 sm:p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand-soft text-xl">
            ✓
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Teklif seçildi
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">
              Detaylı Analiz
            </h2>

            <p className="mt-3 leading-relaxed text-muted-foreground">
              Ücretsiz sonucuna ek olarak güçlü yönlerini, dikkat etmen gereken
              noktaları ve sana özel detaylı yorumları görebileceksin.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-gradient-brand-soft p-4">
            <span className="font-semibold text-foreground">
              Toplam
            </span>

            <span className="text-xl font-black text-foreground">
              {price} {currency}
            </span>
          </div>

          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => {
              window.alert("Ödeme sistemi sonraki aşamada bağlanacak.");
            }}
          >
            Ödemeye Devam Et
          </button>

          <button
            type="button"
            onClick={() => setIsSelected(false)}
            className="w-full text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Vazgeç
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="bg-gradient-brand-soft p-6 sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Daha fazlasını keşfet
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">
              Detaylı Analiz
            </h2>
          </div>

          <div className="shrink-0 rounded-2xl bg-background px-4 py-3 text-center shadow-sm">
            <p className="text-xl font-black text-foreground">
              {price}
            </p>

            <p className="text-xs font-bold text-muted-foreground">
              {currency}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6 sm:p-7">
        <p className="leading-relaxed text-muted-foreground">
          Sonucunun arkasındaki davranış biçimlerini, güçlü yönlerini,
          zorlandığın noktaları ve sana özel yorumları daha ayrıntılı gör.
        </p>

        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-brand-soft text-xs font-black text-primary">
              ✓
            </span>

            <span className="text-sm font-medium leading-relaxed text-foreground">
              Sana özel detaylı kişilik yorumu
            </span>
          </li>

          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-brand-soft text-xs font-black text-primary">
              ✓
            </span>

            <span className="text-sm font-medium leading-relaxed text-foreground">
              Güçlü ve geliştirebileceğin yönlerin
            </span>
          </li>

          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-brand-soft text-xs font-black text-primary">
              ✓
            </span>

            <span className="text-sm font-medium leading-relaxed text-foreground">
              İlişkilerde ve sosyal hayatta davranış biçimin
            </span>
          </li>
        </ul>

        <button
          type="button"
          onClick={() => setIsSelected(true)}
          className="btn-primary w-full"
        >
          Detaylı Analizi Gör · {price} {currency}
        </button>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          Ücretsiz sonucun sende kalır. Bu teklif yalnızca ek değer sunar.
        </p>
      </div>
    </section>
  );
}