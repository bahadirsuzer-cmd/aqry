import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import { PublicPageShell } from "@/components/public/PublicPageShell";

export const Route = createFileRoute(
  "/pricing",
)({
  component: PricingPage,
});

function PricingPage() {
  return (
    <PublicPageShell
      eyebrow="Fiyatlandırma"
      title="Basit olması gerekiyor. Bu yüzden acele etmiyoruz."
      description="AQRYO’nun creator fiyatlandırması, AI kredi sistemi ve gelir paylaşımı birlikte ele alınacak. Kesinleşmemiş bir planı kullanıcıya fiyatmış gibi göstermiyoruz."
    >
      <section className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-7 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-[26px] border border-border bg-white p-6">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary">
              Experience
            </span>

            <h2 className="mt-3 text-[22px] font-black tracking-[-0.04em]">
              Creator planı
            </h2>

            <p className="mt-3 text-[12px] leading-6 text-muted-foreground">
              Hesap/abonelik yapısının nihai fiyatlandırması henüz kesinleştirilmedi.
            </p>
          </article>

          <article className="rounded-[26px] border border-primary/15 bg-violet-50/60 p-6">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary">
              Result sonrası
            </span>

            <h2 className="mt-3 text-[22px] font-black tracking-[-0.04em]">
              Ücretli ek değer
            </h2>

            <p className="mt-3 text-[12px] leading-6 text-muted-foreground">
              Mevcut MVP kararında ücretli ek Result / Offer fiyatı 9 TL’dir. Result’ın kendisi ücretsiz kalır.
            </p>
          </article>

          <article className="rounded-[26px] border border-border bg-white p-6">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary">
              Creator geliri
            </span>

            <h2 className="mt-3 text-[22px] font-black tracking-[-0.04em]">
              Gelir paylaşımı
            </h2>

            <p className="mt-3 text-[12px] leading-6 text-muted-foreground">
              Creator / AQRYO gelir paylaşımı henüz nihai sözleşme oranı olarak sabitlenmedi. Payout, ödeme maliyetleri, vergi, refund ve chargeback modeliyle birlikte finalize edilecek.
            </p>
          </article>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[28px] bg-black p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-[24px] font-black tracking-[-0.04em]">
              Ürün hazır olduğunda fiyat da net olacak.
            </h2>

            <p className="mt-2 max-w-xl text-[11px] leading-5 text-white/65">
              Amaç creator’ın ne ödediğini ve ne kazandığını tek bakışta anlayabileceği bir model kurmak.
            </p>
          </div>

          <Link
            to="/creator-auth"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-white px-6 text-[11px] font-black text-black"
          >
            Creator girişi →
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}