import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import { PublicPageShell } from "@/components/public/PublicPageShell";

export const Route = createFileRoute(
  "/ai-credits",
)({
  component: AiCreditsPage,
});

const uses = [
  {
    title: "Fikir üretimi",
    text: "Ne oluşturacağını bilmiyorsan Experience fikirleri üret.",
  },
  {
    title: "Experience taslağı",
    text: "Seçtiğin fikirden düzenlenebilir bir başlangıç taslağı oluştur.",
  },
  {
    title: "İçerik desteği",
    text: "Sorular, seçenekler, hikaye akışı veya metin varyasyonları üret.",
  },
  {
    title: "Düzenleme",
    text: "Metni kısalt, netleştir veya farklı bir tona uyarlamak için AI’dan destek al.",
  },
];

function AiCreditsPage() {
  return (
    <PublicPageShell
      eyebrow="AI kredileri"
      title="AI senin yerine creator olmaz. Üretimi hızlandırır."
      description="AQRYO AI kredileri, creator’ın fikirden yayınlanabilir Experience taslağına daha hızlı ulaşması için kullanılır."
    >
      <section className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-7 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {uses.map((item) => (
            <article
              key={item.title}
              className="rounded-[24px] border border-border bg-white p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/[0.07] text-lg text-primary">
                ✦
              </div>

              <h2 className="mt-4 text-[20px] font-black tracking-[-0.035em]">
                {item.title}
              </h2>

              <p className="mt-2 text-[12px] leading-6 text-muted-foreground">
                {item.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[28px] border border-primary/10 bg-violet-50/70 p-6 sm:p-8">
          <h2 className="text-[24px] font-black tracking-[-0.04em]">
            Kredi miktarları henüz sabitlenmedi.
          </h2>

          <p className="mt-3 max-w-2xl text-[12px] leading-6 text-muted-foreground">
            Yeni creator başlangıç kredisi, generation maliyetleri, ek kredi satın alma ve kredi kullanım kuralları ürün fiyatlandırmasıyla birlikte belirlenecek. Bu nedenle sayfada şu aşamada sahte veya geçici bir kredi rakamı göstermiyoruz.
          </p>

          <Link
            to="/creator-auth"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-[11px] font-black text-white"
          >
            Creator hesabına git →
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}