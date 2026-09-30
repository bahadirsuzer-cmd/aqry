import { Link } from "@tanstack/react-router";

interface HomeHeroProps {
  isCreator?: boolean;
  authChecked?: boolean;
}

const formatCards = [
  {
    title: "Soru Sor",
    description: "Anonim soru ve itiraflarla kitleni konuştur.",
    to: "/question-confession-builder",
    symbol: "?",
    visual: "from-violet-500 via-purple-500 to-fuchsia-400",
  },
  {
    title: "Puzzle Üret",
    description: "Saniyeler içinde paylaşılabilir viral bulmacalar üret.",
    to: "/puzzle-builder",
    symbol: "7+?",
    visual: "from-amber-300 via-orange-400 to-rose-400",
  },
  {
    title: "Aşk Metre",
    description: "Uyumu ölçen eğlenceli içerikler oluştur ve paylaş.",
    to: "/compatibility-builder",
    symbol: "♡",
    visual: "from-pink-400 via-rose-400 to-red-400",
  },
  {
    title: "Hikaye",
    description: "Görsel ve metni birleştir, takipçini hikâyenin içine çek.",
    to: "/story-builder",
    symbol: "Aa",
    visual: "from-cyan-400 via-sky-500 to-indigo-500",
  },
] as const;

export function HomeHero({
  isCreator = false,
  authChecked = true,
}: HomeHeroProps) {
  return (
    <section className="overflow-hidden bg-[#faf8ff]">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 pb-14 pt-10 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-16 lg:py-20">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-[12px] font-black text-[#7140c4]">
            <span className="h-2 w-2 rounded-full bg-[#74f0de]" />
            AQRYO · CREATOR STUDIO
          </div>

          <h1 className="mt-5 text-[clamp(3rem,5.4vw,5.5rem)] font-black leading-[0.94] tracking-[-0.07em] text-[#21163b]">
            5 saniyede
            <br />
            <span className="text-[#7540d0]">viral içerik üret.</span>
          </h1>

          <p className="mt-6 max-w-[34rem] text-[17px] font-medium leading-8 text-[#625a70] sm:text-[19px]">
            Formatını seç, içeriğini hazırla ve kendi kitlenle paylaş.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {authChecked ? (
              <Link
                to={isCreator ? "/creator-studio" : "/creator-auth"}
                className="inline-flex min-h-13 items-center justify-center rounded-full bg-[#7540d0] px-7 py-3 text-[15px] font-black text-white shadow-[0_14px_30px_rgba(117,64,208,.2)] transition hover:bg-[#5f2bb9]"
              >
                {isCreator ? "Studio’ya git" : "İlk içeriğini oluştur"} →
              </Link>
            ) : null}

            <a
              href="#aqryo-formats"
              className="inline-flex min-h-13 items-center justify-center rounded-full border border-[#ded5ed] bg-white px-7 py-3 text-[15px] font-black text-[#332347]"
            >
              Formatları gör
            </a>
          </div>
        </div>

        <div id="aqryo-formats" className="relative">
          <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-violet-300/25 blur-3xl" />
          <div className="absolute -bottom-8 right-0 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
            {formatCards.map((card) => (
              <Link
                key={card.title}
                to={card.to}
                className="group relative aspect-square min-w-0 overflow-hidden rounded-[26px] border border-white/70 bg-white shadow-[0_18px_50px_rgba(48,31,75,.12)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(48,31,75,.18)] sm:rounded-[32px]"
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
                    {card.title}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-[11px] font-semibold leading-4 text-white/80 sm:mt-2 sm:text-[13px] sm:leading-5">
                    {card.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <p className="mt-4 text-center text-[12px] font-bold text-[#756b82]">
            Bir format seç · oluştur · paylaş
          </p>
        </div>
      </div>
    </section>
  );
}
