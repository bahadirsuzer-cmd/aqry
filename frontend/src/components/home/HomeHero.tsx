import { Link } from "@tanstack/react-router";

interface HomeHeroProps {
  isCreator?: boolean;
  authChecked?: boolean;
}

export function HomeHero({
  isCreator = false,
  authChecked = true,
}: HomeHeroProps) {
  return (
    <section className="overflow-hidden bg-[#faf8ff]">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 pb-14 pt-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:py-20">
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
            Soru mu İtiraf mı, Aşk Metre, Hikaye ve sosyal puzzle’lar.
            Formatını seç, içeriğini hazırla, kendi kitlenle paylaş.
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

          <div className="mt-8 flex flex-wrap gap-2">
            {["Anonim etkileşim", "SVG puzzle", "Kendi görselin", "15 dil"].map((item) => (
              <span
                key={item}
                className="rounded-full bg-white px-3 py-2 text-[12px] font-extrabold text-[#6a6077] shadow-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div id="aqryo-formats" className="relative">
          <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-violet-300/25 blur-3xl" />
          <div className="absolute -bottom-8 right-0 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative rounded-[36px] border border-violet-200 bg-[#17101f] p-4 shadow-[0_30px_80px_rgba(31,18,58,.22)] sm:p-6">
            <div className="rounded-[28px] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-violet-600">
                    ANA FORMAT
                  </p>
                  <h2 className="mt-2 text-[34px] font-black tracking-[-0.055em] text-[#21163b]">
                    Soru mu İtiraf mı?
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#74f0de] text-[22px] font-black text-[#17101f]">
                  Q
                </div>
              </div>

              <p className="mt-3 text-[14px] font-medium leading-6 text-[#6a6077]">
                Anonim linkini paylaş. Takipçin soru sorsun ya da itiraf bıraksın.
                Sen seçtiklerini X’te cevapla.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[22px] bg-violet-100 p-5">
                  <p className="text-[26px] font-black">?</p>
                  <p className="mt-3 text-[14px] font-black">Soru sor</p>
                </div>
                <div className="rounded-[22px] bg-rose-100 p-5">
                  <p className="text-[26px]">♡</p>
                  <p className="mt-3 text-[14px] font-black">İtiraf et</p>
                </div>
              </div>

              <div className="mt-4 rounded-[18px] border border-[#e7e0ee] bg-[#faf8ff] px-4 py-4 text-[13px] font-semibold text-[#7a7085]">
                Buraya yaz... Kim olduğun görünmez.
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <FormatMiniCard
                eyebrow="UYUM"
                title="Aşk Metre"
                detail="Cevapla · uyumu gör"
              />
              <FormatMiniCard
                eyebrow="ANLAT"
                title="Hikaye"
                detail="Metin + kendi görselin"
              />
              <FormatMiniCard
                eyebrow="MEYDAN OKU"
                title="Puzzle"
                detail="Sonsuz varyasyon"
              />
            </div>

            <p className="mt-4 text-center text-[12px] font-bold text-white/65">
              Oluştur · paylaş · etkileşimi kendi sosyal hesabında büyüt
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FormatMiniCard({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 text-white backdrop-blur">
      <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#74f0de]">
        {eyebrow}
      </p>
      <p className="mt-2 text-[18px] font-black tracking-[-0.04em]">{title}</p>
      <p className="mt-1 text-[11px] font-semibold leading-5 text-white/60">{detail}</p>
    </div>
  );
}
