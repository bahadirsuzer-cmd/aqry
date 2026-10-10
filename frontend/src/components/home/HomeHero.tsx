import { anonymousName } from "@/lib/anonymousFormats";
import { Link } from "@tanstack/react-router";
import { useAqryoLocale } from "@/lib/i18n";

interface HomeHeroProps {
  isCreator?: boolean;
  authChecked?: boolean;
}

const formatCards = [
  {
    titleKey: "questionConfession",
    anonymousMode: "question",
    descriptionKey: "questionConfessionDesc",
    to: "/question-confession-builder",
    symbol: "?",
    visual: "from-violet-500 via-purple-500 to-fuchsia-400",
  },
  {
    titleKey: "questionConfession",
    descriptionKey: "questionConfessionDesc",
    anonymousMode: "confession",
    to: "/question-confession-builder",
    symbol: "♡",
    visual: "from-rose-500 via-pink-500 to-fuchsia-400",
  },
  {
    titleKey: "puzzle",
    descriptionKey: "puzzleDesc",
    to: "/puzzle-builder",
    symbol: "7+?",
    visual: "from-amber-300 via-orange-400 to-rose-400",
  },
  {
    titleKey: "loveMeter",
    descriptionKey: "loveMeterDesc",
    to: "/compatibility-builder",
    symbol: "♡",
    visual: "from-pink-400 via-rose-400 to-red-400",
  },
  {
    titleKey: "story",
    descriptionKey: "storyDesc",
    to: "/story-builder",
    symbol: "Aa",
    visual: "from-cyan-400 via-sky-500 to-indigo-500",
  },
] as const;

export function HomeHero({
  isCreator = false,
  authChecked = true,
}: HomeHeroProps) {
  const { t, locale } = useAqryoLocale();
  return (
    <section className="overflow-hidden bg-[#faf8ff]">
      <div className="mx-auto grid max-w-[1240px] gap-6 px-5 pb-8 pt-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-16 lg:py-20">
        <div className="relative max-w-xl">

          <h1 className="text-[clamp(2.65rem,5.4vw,5.5rem)] font-black leading-[0.88] tracking-[-0.07em] text-[#21163b] sm:pr-36">
            {t("viralInFive")}
          </h1>

          <p className="mt-3 max-w-[34rem] text-[16px] font-medium leading-6 text-[#625a70] sm:mt-6 sm:text-[19px] sm:leading-8">
            {t("studioDescription")}
          </p>

        </div>

        <div id="aqryo-formats" className="relative">
          <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-violet-300/25 blur-3xl" />
          <div className="absolute -bottom-8 right-0 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative grid grid-cols-2 gap-2.5 sm:gap-4">
            {formatCards.map((card) => (
              <Link
                key={"anonymousMode" in card ? card.anonymousMode : card.titleKey}
                to={isCreator ? card.to : "/creator-auth"}
                search={isCreator ? ("anonymousMode" in card ? { mode: card.anonymousMode } : undefined) : { next: card.to + ("anonymousMode" in card ? `?mode=${card.anonymousMode}` : "") }}
                className="group relative aspect-[1/0.94] min-w-0 overflow-hidden rounded-[26px] border border-white/70 bg-white shadow-[0_18px_50px_rgba(48,31,75,.12)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(48,31,75,.18)] sm:rounded-[32px]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.visual}`} />
                <div className="absolute -right-[12%] -top-[8%] h-[58%] w-[58%] rounded-full bg-white/20 blur-2xl" />
                <div className="absolute inset-x-0 top-0 flex h-[56%] items-center justify-center">
                  <div className="flex h-[45%] min-h-16 w-[45%] min-w-16 items-center justify-center rounded-[24px] border border-white/30 bg-white/20 text-[clamp(2rem,5vw,4.2rem)] font-black tracking-[-0.08em] text-white shadow-[0_18px_45px_rgba(25,15,50,.16)] backdrop-blur-sm">
                    {card.symbol}
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 min-h-[46%] bg-gradient-to-t from-[#17101f]/90 via-[#17101f]/72 to-transparent px-4 pb-4 pt-9 text-white sm:px-6 sm:pb-6 sm:pt-12">
                  <h2 className="text-[clamp(1.15rem,2.4vw,1.75rem)] font-black tracking-[-0.045em]">
                    {"anonymousMode" in card ? anonymousName(locale, card.anonymousMode) : t(card.titleKey)}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-[11px] font-semibold leading-4 text-white/80 sm:mt-2 sm:text-[13px] sm:leading-5">
                    {"anonymousMode" in card ? (locale === "tr" ? (card.anonymousMode === "question" ? "Takipçilerin anonim soru sorsun. Cevabını paylaş." : "Takipçilerin anonim itiraflarını bıraksın. İstediğini paylaş.") : anonymousName(locale, card.anonymousMode)) : t(card.descriptionKey)}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <p className="mt-2 text-center text-[12px] font-bold text-[#756b82] sm:mt-4">
            {t("studioDescription")}
          </p>
        </div>
      </div>
    </section>
  );
}
