import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPageShell } from "@/components/public/PublicPageShell";

export const Route = createFileRoute("/internetten-para-kazanma")({
  head: () => ({
    meta: [
      { title: "AQRYO | Creator Araçları" },
      { name: "description", content: "AQRYO ile takipçilerinle paylaşabileceğin interaktif içerikler oluştur." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LegacyCreatorGuidePage,
});

function LegacyCreatorGuidePage() {
  return (
    <PublicPageShell
      eyebrow="AQRYO"
      title="AQRYO artık etkileşim odaklı."
      description="Soru mu İtiraf mı, Aşk Metre, Flood/Hikaye ve Puzzle formatlarıyla takipçilerinle paylaşabileceğin içerikler oluştur."
    >
      <section className="mx-auto w-full max-w-[900px] px-5 py-14 sm:px-7">
        <div className="rounded-[28px] border border-border bg-white p-6 sm:p-8">
          <h2 className="text-[26px] font-black tracking-[-0.04em]">
            Creator Studio’ya geç
          </h2>
          <p className="mt-3 max-w-2xl text-[12px] leading-6 text-muted-foreground">
            AQRYO’nun güncel odağı, creator ile takipçisi arasında yeni etkileşimler başlatan kolay ve paylaşılabilir içerikler üretmek.
          </p>
          <Link
            to="/creator-auth"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-[11px] font-black text-white"
          >
            İçerik oluşturmaya başla →
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
