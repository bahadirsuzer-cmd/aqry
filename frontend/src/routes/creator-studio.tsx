import { CreatorNavigation } from "@/components/CreatorNavigation";
import { getCurrentCreator, signOutCreator } from "@/services/auth";
import { useAqryoLocale } from "@/lib/i18n";
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
  cta: string;
};

function CreatorStudioPage() {
  const [loading, setLoading] = useState(true);
  const { t } = useAqryoLocale();

  useEffect(() => {
    let cancelled = false;
    async function protectRoute() {
      const creator = await getCurrentCreator();
      if (!creator) {
        window.location.href = "/creator-auth";
        return;
      }
      if (!cancelled) setLoading(false);
    }
    void protectRoute();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <main className="min-h-screen bg-[#f7f5fb] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href = "/creator-auth";
        }}
      />

      <section className="mx-auto max-w-[1240px] px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <div className="mb-7">
          <p className="text-[12px] font-black uppercase tracking-[0.18em] text-primary">
            {t("studioEyebrow")}
          </p>
          <h1 className="mt-2 max-w-[760px] text-[38px] font-black leading-[0.98] tracking-[-0.06em] sm:text-[58px]">
            {t("studioTitle")}
          </h1>
          <p className="mt-4 max-w-[680px] text-[16px] font-semibold leading-7 text-muted-foreground sm:text-[18px]">
            {t("studioDescription")}
          </p>
        </div>

        <Link
          to="/question-confession-builder"
          className="group relative block overflow-hidden rounded-[34px] border border-violet-200 bg-[#17101f] p-6 text-white shadow-[0_24px_70px_rgba(56,27,90,0.22)] transition hover:-translate-y-0.5 sm:p-9"
        >
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/30 blur-3xl" />
          <div className="absolute -bottom-28 left-10 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_430px] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#17101f]">
                  MAIN
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold text-white/85">
                  Anonymous
                </span>
              </div>

              <h2 className="mt-6 text-[46px] font-black leading-[0.92] tracking-[-0.07em] sm:text-[66px]">
                {t("questionConfession")}
              </h2>
              <p className="mt-5 max-w-[590px] text-[16px] font-semibold leading-7 text-white/72 sm:text-[18px]">
                {t("questionConfessionDesc")}
              </p>
              <span className="mt-7 inline-flex h-13 items-center justify-center rounded-full bg-white px-7 py-3.5 text-[14px] font-black text-[#17101f] transition group-hover:bg-[#74f0de]">
                {t("create")} →
              </span>
            </div>

            <QuestionConfessionPreview />
          </div>
        </Link>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <ProductCard
            eyebrow="MATCH"
            title={t("loveMeter")}
            description={t("loveMeterDesc")}
            href="/compatibility-builder"
            accent="rose"
            badge={t("ready")}
            visual={<LoveVisual />}
            cta={t("create")}
          />
          <ProductCard
            eyebrow="STORY"
            title={t("story")}
            description={t("storyDesc")}
            href="/story-builder"
            accent="sky"
            badge={t("ownImage")}
            visual={<StoryVisual />}
            cta={t("create")}
          />
          <ProductCard
            eyebrow="CHALLENGE"
            title={t("puzzle")}
            description={t("puzzleDesc")}
            href="/puzzle-builder"
            accent="violet"
            badge={t("freeSvg")}
            visual={<PuzzleVisual />}
            cta={t("create")}
          />
        </div>
      </section>
    </main>
  );
}

function ProductCard({ eyebrow, title, description, href, badge, accent, visual, cta }: ProductCardProps) {
  const accentClass =
    accent === "rose" ? "text-rose-600" : accent === "sky" ? "text-sky-600" : "text-violet-600";

  return (
    <Link
      to={href}
      className="group overflow-hidden rounded-[30px] border border-border bg-white p-4 shadow-[0_16px_45px_rgba(33,21,53,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(33,21,53,0.10)]"
    >
      {visual}
      <div className="px-2 pb-2 pt-5">
        <div className="flex items-center justify-between gap-3">
          <p className={`text-[11px] font-black uppercase tracking-[0.15em] ${accentClass}`}>{eyebrow}</p>
          {badge ? (
            <span className="max-w-[55%] truncate rounded-full bg-background px-3 py-1.5 text-[12px] font-extrabold text-muted-foreground">
              {badge}
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 text-[29px] font-black leading-tight tracking-[-0.055em]">{title}</h3>
        <p className="mt-3 min-h-[84px] text-[14px] font-medium leading-6 text-muted-foreground">{description}</p>
        <p className="mt-5 text-[13px] font-black text-foreground">{cta} →</p>
      </div>
    </Link>
  );
}

function QuestionConfessionPreview() {
  return (
    <div className="rounded-[30px] border border-white/15 bg-white/10 p-3 backdrop-blur">
      <div className="rounded-[25px] bg-white p-5 text-[#17101f] shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#74f0de] text-[21px] font-black">Q</div>
          <div>
            <p className="text-[13px] font-black">@creator</p>
            <p className="text-[11px] font-semibold text-muted-foreground">Anonymous inbox</p>
          </div>
        </div>
        <p className="mt-6 text-[25px] font-black leading-tight tracking-[-0.05em]">Question or confession?</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[20px] bg-violet-100 px-4 py-5">
            <p className="text-[22px] font-black">?</p>
            <p className="mt-3 text-[13px] font-black">Ask</p>
          </div>
          <div className="rounded-[20px] bg-rose-100 px-4 py-5">
            <p className="text-[22px]">♡</p>
            <p className="mt-3 text-[13px] font-black">Confess</p>
          </div>
        </div>
        <div className="mt-3 rounded-[18px] border border-border bg-background px-4 py-4 text-[12px] font-semibold text-muted-foreground">
          Write here... Your identity stays hidden.
        </div>
      </div>
    </div>
  );
}

function LoveVisual() {
  return (
    <div className="relative h-[210px] overflow-hidden rounded-[24px] bg-gradient-to-br from-rose-100 via-fuchsia-50 to-white">
      <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-black text-rose-600">LOVE METER</div>
      <div className="absolute inset-x-5 bottom-6 flex items-end justify-between">
        <div>
          <p className="text-[46px] font-black leading-none text-rose-600">87%</p>
          <p className="mt-2 text-[12px] font-extrabold text-rose-900/60">match</p>
        </div>
        <svg viewBox="0 0 120 90" className="h-[100px] w-[128px]" aria-hidden="true">
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
    <div className="relative h-[210px] overflow-hidden rounded-[24px] bg-gradient-to-br from-sky-50 to-indigo-50">
      <div className="absolute left-7 top-8 h-[130px] w-[96px] -rotate-6 rounded-[20px] border border-sky-200 bg-white shadow-sm" />
      <div className="absolute left-[110px] top-6 h-[145px] w-[108px] rotate-3 rounded-[20px] border border-indigo-200 bg-white shadow-sm">
        <div className="m-3 h-14 rounded-[12px] bg-indigo-100" />
        <div className="mx-3 mt-3 h-2.5 rounded-full bg-indigo-200" />
        <div className="mx-3 mt-2 h-2.5 w-12 rounded-full bg-indigo-100" />
      </div>
      <div className="absolute bottom-5 right-5 rounded-full bg-sky-500 px-4 py-2.5 text-[11px] font-black text-white">+ image</div>
    </div>
  );
}

function PuzzleVisual() {
  return (
    <div className="relative h-[210px] overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
      <svg viewBox="0 0 320 190" className="h-full w-full" aria-hidden="true">
        <path d="M46 145L92 48L138 145H46Z" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="6" />
        <path d="M69 96H116" stroke="#7c3aed" strokeWidth="5" />
        <text x="166" y="80" fontSize="35" fontWeight="900" fill="#17101f">x = ?</text>
        <text x="166" y="123" fontSize="18" fontWeight="800" fill="#7c3aed">5 sec challenge</text>
      </svg>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#f7f5fb]">
      <div className="mx-auto max-w-[1240px] px-4 py-10">
        <div className="h-[260px] animate-pulse rounded-[32px] bg-white" />
      </div>
    </main>
  );
}
