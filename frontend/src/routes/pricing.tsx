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
      title="Çekirdek üretim araçlarıyla başla."
      description="Soru mu İtiraf mı, Aşk Metre, Flood/Hikaye ve temel SVG Puzzle araçları ürünün çekirdeğini oluşturuyor. AI ile özel görsel üretimi ayrı krediyle sunulacak."
    >
      <section className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-7 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-[26px] border border-border bg-white p-6">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary">
              Çekirdek araçlar
            </span>

            <h2 className="mt-3 text-[22px] font-black tracking-[-0.04em]">
              Başlangıç
            </h2>

            <p className="mt-3 text-[12px] leading-6 text-muted-foreground">
              Temel içerik oluşturma akışlarını mümkün olduğunca sade tutuyoruz. Kesin plan yapısı ürün kullanımıyla birlikte netleşecek.
            </p>
          </article>

          <article className="rounded-[26px] border border-primary/15 bg-violet-50/60 p-6">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary">
              Puzzle
            </span>

            <h2 className="mt-3 text-[22px] font-black tracking-[-0.04em]">
              SVG üretimi
            </h2>

            <p className="mt-3 text-[12px] leading-6 text-muted-foreground">
              Kaç tane var, geometri ve matematik puzzle görselleri AQRYO içinde SVG olarak üretilebilir.
            </p>
          </article>

          <article className="rounded-[26px] border border-border bg-white p-6">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary">
              Özel görsel
            </span>

            <h2 className="mt-3 text-[22px] font-black tracking-[-0.04em]">
              AI görsel kredisi
            </h2>

            <p className="mt-3 text-[12px] leading-6 text-muted-foreground">
              AI ile özel görsel üretimi ücretsiz kotaya dahil edilmeyecek. İhtiyaç olduğunda kredi paketiyle kullanılabilecek; manuel görsel yükleme ücretsiz kalacak.
            </p>
          </article>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[28px] bg-black p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-[24px] font-black tracking-[-0.04em]">
              Önce ürünü hızlıca kullan.
            </h2>

            <p className="mt-2 max-w-xl text-[11px] leading-5 text-white/65">
              Amaç creator’ın neyin ücretsiz, neyin isteğe bağlı ücretli olduğunu tek bakışta anlayabildiği sade bir model kurmak.
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