import { CreatorNavigation } from "@/components/CreatorNavigation";
import { getCurrentCreator, signOutCreator } from "@/services/auth";
import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/creator-studio")({
  component: CreatorStudioPage,
});

type ProductCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
  accent: "rose" | "violet" | "sky";
  visual: React.ReactNode;
};

function CreatorStudioPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function protectRoute() {
      const creator = await getCurrentCreator();

      if (!creator) {
        window.location.href = "/creator-auth";
        return;
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    void protectRoute();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen bg-[#f7f5fb] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href = "/creator-auth";
        }}
      />

      <section className="mx-auto max-w-[1240px] px-4 pb-16 pt-7 sm:px-6 sm:pt-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
              AQRYO Studio
            </p>
            <h1 className="mt-2 text-[30px] font-black tracking-[-0.055em] sm:text-[42px]">
              Bugün ne paylaşmak istiyorsun?
            </h1>
            <p className="mt-2 max-w-[620px] text-[13px] leading-6 text-muted-foreground">
              Uzun formlar yok. Bir format seç, içeriğini hazırla ve takipçilerine gönder.
            </p>
          </div>

          <div className="hidden rounded-full border border-border bg-white px-4 py-2 text-[11px] font-bold text-muted-foreground sm:block">
            4 çekirdek format
          </div>
        </div>

        <Link
          to="/question-confession-builder"
          className="group relative block overflow-hidden rounded-[32px] border border-violet-200 bg-[#17101f] p-5 text-white shadow-[0_24px_70px_rgba(56,27,90,0.22)] transition hover:-translate-y-0.5 sm:p-8"
        >
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/30 blur-3xl" />
          <div className="absolute -bottom-28 left-10 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />

          <div className="relative grid gap-7 lg:grid-cols-[1fr_440px] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#17101f]">
                  Ana format
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold text-white/80">
                  Anonim
                </span>
              </div>

              <h2 className="mt-5 text-[40px] font-black leading-[0.94] tracking-[-0.065em] sm:text-[58px]">
                Soru mu
                <br />
                İtiraf mı?
              </h2>

              <p className="mt-4 max-w-[570px] text-[13px] leading-6 text-white/65 sm:text-[15px]">
                Takipçin ya sana merak ettiği şeyi sorar ya da söylemeye cesaret edemediği şeyi anonim itiraf eder.
                Sen içlerinden seçtiklerini X’te cevaplayarak etkileşimi yeniden başlatırsın.
              </p>

              <span className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-[12px] font-black text-[#17101f] transition group-hover:bg-[#74f0de]">
                Oluşturmaya başla →
              </span>
            </div>

            <QuestionConfessionPreview />
          </div>
        </Link>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <ProductCard
            eyebrow="Uyum"
            title="Aşk Metre"
            description="Kendi cevaplarını tanımla. Takipçin cevaplasın ve aranızdaki uyumu görsün."
            href="/compatibility-builder"
            accent="rose"
            badge="Hazır"
            visual={<LoveVisual />}
          />

          <ProductCard
            eyebrow="Anlat"
            title="Flood / Hikaye"
            description="Metinlerini ve kendi görsellerini sırayla ekle. Hikayeni kart kart anlat."
            href="/story-builder"
            accent="sky"
            badge="Kendi görselini yükle"
            visual={<StoryVisual />}
          />

          <ProductCard
            eyebrow="Meydan oku"
            title="Puzzle"
            description="Kaç tane var, geometri veya matematik problemi üret. Görseli indir, cevabı X’te toplat."
            href="/puzzle-builder"
            accent="violet"
            badge="SVG ücretsiz"
            visual={<PuzzleVisual />}
          />
        </div>

        <div className="mt-6 rounded-[24px] border border-border bg-white px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div>
            <p className="text-[12px] font-black">Görsel üretim politikası</p>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
              AQRYO’nun SVG puzzle üretimleri ücretsiz. Kendi görselini yüklemek ücretsiz. AI ile özel görsel üretimi krediyle açılacak.
            </p>
          </div>
          <span className="mt-3 inline-flex shrink-0 rounded-full bg-[#f4f0fb] px-3 py-2 text-[10px] font-black text-primary sm:mt-0">
            AI görsel = ücretli
          </span>
        </div>
      </section>
    </main>
  );
}

function ProductCard({
  eyebrow,
  title,
  description,
  href,
  badge,
  accent,
  visual,
}: ProductCardProps) {
  const accentClass =
    accent === "rose"
      ? "text-rose-600"
      : accent === "sky"
        ? "text-sky-600"
        : "text-violet-600";

  return (
    <Link
      to={href}
      className="group overflow-hidden rounded-[28px] border border-border bg-white p-4 shadow-[0_16px_45px_rgba(33,21,53,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(33,21,53,0.10)]"
    >
      {visual}

      <div className="px-1 pb-1 pt-5">
        <div className="flex items-center justify-between gap-3">
          <p className={`text-[9px] font-black uppercase tracking-[0.16em] ${accentClass}`}>
            {eyebrow}
          </p>
          {badge ? (
            <span className="rounded-full bg-background px-2.5 py-1 text-[9px] font-bold text-muted-foreground">
              {badge}
            </span>
          ) : null}
        </div>

        <h3 className="mt-2 text-[24px] font-black tracking-[-0.05em]">
          {title}
        </h3>
        <p className="mt-2 min-h-[60px] text-[11px] leading-5 text-muted-foreground">
          {description}
        </p>

        <p className="mt-4 text-[10px] font-black text-foreground">
          Oluştur →
        </p>
      </div>
    </Link>
  );
}

function QuestionConfessionPreview() {
  return (
    <div className="rounded-[28px] border border-white/15 bg-white/10 p-3 backdrop-blur">
      <div className="rounded-[23px] bg-white p-4 text-[#17101f] shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#74f0de] text-[19px] font-black">
            Q
          </div>
          <div>
            <p className="text-[11px] font-black">@creator</p>
            <p className="text-[9px] text-muted-foreground">Sana anonim bir şey bırak</p>
          </div>
        </div>

        <p className="mt-5 text-[18px] font-black leading-tight tracking-[-0.04em]">
          Soru mu, itiraf mı?
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-[18px] bg-violet-100 px-3 py-4">
            <p className="text-[18px]">?</p>
            <p className="mt-2 text-[11px] font-black">Soru sor</p>
          </div>
          <div className="rounded-[18px] bg-rose-100 px-3 py-4">
            <p className="text-[18px]">♡</p>
            <p className="mt-2 text-[11px] font-black">İtiraf et</p>
          </div>
        </div>

        <div className="mt-3 rounded-[16px] border border-border bg-background px-4 py-3 text-[10px] text-muted-foreground">
          Buraya yaz... Kim olduğunu söylemeyeceğiz.
        </div>
      </div>
    </div>
  );
}

function LoveVisual() {
  return (
    <div className="relative h-[170px] overflow-hidden rounded-[22px] bg-gradient-to-br from-rose-100 via-fuchsia-50 to-white">
      <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-[9px] font-black text-rose-600">
        AŞK METRE
      </div>
      <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
        <div>
          <p className="text-[34px] font-black leading-none text-rose-600">87%</p>
          <p className="mt-1 text-[10px] font-bold text-rose-900/60">uyum</p>
        </div>
        <svg viewBox="0 0 120 90" className="h-[86px] w-[116px]" aria-hidden="true">
          <circle cx="33" cy="38" r="22" fill="#fecdd3" />
          <circle cx="87" cy="38" r="22" fill="#e9d5ff" />
          <path d="M60 78C42 67 33 57 33 45C33 36 39 30 47 30C54 30 58 34 60 39C62 34 66 30 73 30C81 30 87 36 87 45C87 57 78 67 60 78Z" fill="#e11d48" />
        </svg>
      </div>
    </div>
  );
}

function StoryVisual() {
  return (
    <div className="relative h-[170px] overflow-hidden rounded-[22px] bg-gradient-to-br from-sky-50 to-indigo-50">
      <div className="absolute left-6 top-7 h-[110px] w-[82px] -rotate-6 rounded-[18px] border border-sky-200 bg-white shadow-sm" />
      <div className="absolute left-[90px] top-5 h-[122px] w-[92px] rotate-3 rounded-[18px] border border-indigo-200 bg-white shadow-sm">
        <div className="m-3 h-12 rounded-[11px] bg-indigo-100" />
        <div className="mx-3 mt-2 h-2 rounded-full bg-indigo-200" />
        <div className="mx-3 mt-2 h-2 w-10 rounded-full bg-indigo-100" />
      </div>
      <div className="absolute bottom-5 right-5 rounded-full bg-sky-500 px-3 py-2 text-[9px] font-black text-white">
        + görsel
      </div>
    </div>
  );
}

function PuzzleVisual() {
  return (
    <div className="relative h-[170px] overflow-hidden rounded-[22px] bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
      <svg viewBox="0 0 320 170" className="h-full w-full" aria-hidden="true">
        <path d="M52 125L92 48L132 125H52Z" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="5" />
        <path d="M72 91H113" stroke="#7c3aed" strokeWidth="4" />
        <text x="156" y="75" fontSize="34" fontWeight="900" fill="#17101f">3/4</text>
        <text x="211" y="75" fontSize="30" fontWeight="900" fill="#7c3aed">+</text>
        <text x="244" y="75" fontSize="34" fontWeight="900" fill="#17101f">1/2</text>
        <text x="174" y="125" fontSize="18" fontWeight="800" fill="#6b7280">= ?</text>
      </svg>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#f7f5fb]">
      <div className="mx-auto max-w-[1240px] px-4 py-10">
        <div className="h-[240px] animate-pulse rounded-[32px] bg-white" />
      </div>
    </main>
  );
}
