import { Link } from "@tanstack/react-router";

const shareCards = [
  {
    id: "whatsapp",
    platform: "WhatsApp Durumu",
    handle: "@seninicerigin",
    type: "UYUM TESTİ",
    title: "Benimle ne kadar uyumlusun?",
    subtitle: "8 soruyu cevapla, uyum oranını gör.",
    action: "Testi çöz",
    accent:
      "from-[#1FAF5A] via-[#169c50] to-[#0d5f31]",
    pill: "WhatsApp",
    className:
      "left-0 top-14 z-20 rotate-[-14deg] sm:left-2 lg:left-0 lg:top-20",
  },
  {
    id: "instagram",
    platform: "Instagram Hikâyesi",
    handle: "@seninicerigin",
    type: "İNTERAKTİF HİKÂYE",
    title: "23:41'de Gelen Mesaj",
    subtitle:
      "Hikâyeyi ilerlet, sonunda ne olduğunu öğren.",
    action: "Hikâyeyi aç",
    accent:
      "from-[#ff7a18] via-[#ff3d77] to-[#7c3aed]",
    pill: "Instagram",
    className:
      "left-20 top-0 z-40 rotate-[-4deg] sm:left-24 lg:left-28 lg:top-0",
  },
  {
    id: "x",
    platform: "X Paylaşımı",
    handle: "@seninhesabin",
    type: "GÖRSEL BULMACA",
    title: "Bu görselde ilk gördüğün şey ne?",
    subtitle:
      "Tahminini yap ve sonucunu hemen gör.",
    action: "Tahmin et",
    accent:
      "from-[#111827] via-[#1f2937] to-[#374151]",
    pill: "X",
    className:
      "left-40 top-20 z-30 rotate-[8deg] sm:left-52 lg:left-[20rem] lg:top-24",
  },
  {
    id: "facebook",
    platform: "Facebook Hikâyesi",
    handle: "@seninicerigin",
    type: "KİŞİLİK TESTİ",
    title: "Kıskançlık seviyen kaç?",
    subtitle:
      "10 soruyu cevapla, sonucunu öğren.",
    action: "Testi başlat",
    accent:
      "from-[#1877F2] via-[#2563eb] to-[#1e3a8a]",
    pill: "Facebook",
    className:
      "left-56 top-6 z-50 rotate-[15deg] sm:left-80 lg:left-[31rem] lg:top-10",
  },
];

interface HomeHeroProps {
  isCreator?: boolean;
  authChecked?: boolean;
}

export function HomeHero({
  isCreator = false,
  authChecked = true,
}: HomeHeroProps) {
  return (
    <section className="border-b border-border/60 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.10),_transparent_42%),linear-gradient(to_bottom,_#ffffff,_#fcfbff)]">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 pb-14 pt-8 sm:px-7 sm:pb-16 sm:pt-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(520px,0.98fr)] lg:items-center lg:gap-8 lg:px-10 lg:pb-20 lg:pt-12">
        <div className="max-w-[760px]">
          <div className="inline-flex rounded-full border border-primary/10 bg-primary/[0.05] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-primary sm:text-xs">
            Test · Hikâye · Bulmaca · Deneyim
          </div>

          <h1 className="mt-5 max-w-[820px] text-[40px] font-black leading-[0.98] tracking-[-0.065em] text-[#140f26] sm:text-[54px] lg:text-[64px]">
            AQRYO’da testler, hikâyeler,
            bulmacalar ve interaktif
            deneyimler üret.
            <br />
            <span className="text-primary">
              Paylaş, gelire dönüştür.
            </span>
          </h1>

          <p className="mt-6 max-w-[690px] text-[18px] leading-8 text-muted-foreground sm:text-[20px] sm:leading-9">
            Takipçilerin linke tıklar;
            soruları cevaplar, hikâyeyi
            ilerletir, bulmacayı çözer ve
            sonucunu görür. İsterse sana
            hediye gönderir ya da sunduğun
            teklifi satın alır.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#examples"
              className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-7 text-sm font-black text-white shadow-[0_18px_45px_rgba(109,40,217,0.24)] transition hover:translate-y-[-1px]"
            >
              Örnekleri keşfet
              <span className="ml-3 text-base">
                →
              </span>
            </a>

            {authChecked ? (
  <Link
    to={
      isCreator
        ? "/creator-studio"
        : "/creator-auth"
    }
    className="inline-flex h-14 items-center justify-center rounded-full border border-border bg-white px-7 text-sm font-black text-[#140f26] transition hover:border-primary/30 hover:text-primary"
  >
    {isCreator
      ? "Creator Studio’ya dön"
      : "Creator olarak başla"}
  </Link>
) : (
  <div className="h-14 w-[190px] rounded-full border border-border bg-white" />
)}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-[18px] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(20,15,38,0.05)] ring-1 ring-black/[0.03]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
                {"</>"}
              </div>

              <div>
                <p className="text-[13px] font-black text-[#140f26]">
                  Kod yazmadan oluştur
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Dakikalar içinde hazırla
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-[18px] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(20,15,38,0.05)] ring-1 ring-black/[0.03]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
                ↗
              </div>

              <div>
                <p className="text-[13px] font-black text-[#140f26]">
                  Kendi mecranda paylaş
                </p>
                <p className="text-[11px] text-muted-foreground">
                  WhatsApp, X, Instagram,
                  Facebook
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-[18px] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(20,15,38,0.05)] ring-1 ring-black/[0.03]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
                ₺
              </div>

              <div>
                <p className="text-[13px] font-black text-[#140f26]">
                  Hediye ve tekliflerle kazan
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Etkileşimi gelire çevir
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="mb-4 text-center lg:mb-6">
            <p className="text-[12px] font-black uppercase tracking-[0.14em] text-primary">
              AQRYO’da oluştur
            </p>

            <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
              Sonra WhatsApp, X, Instagram
              veya Facebook&apos;ta paylaş.
            </p>
          </div>

          <div className="relative mx-auto h-[350px] w-[330px] sm:h-[390px] sm:w-[470px] lg:h-[500px] lg:w-[650px]">
            <div className="absolute inset-0 rounded-[40px] bg-[radial-gradient(circle_at_center,_rgba(124,58,237,0.12),_transparent_62%)] blur-2xl" />

            {shareCards.map((card) => (
              <article
                key={card.id}
                className={`absolute h-[220px] w-[155px] overflow-hidden rounded-[28px] bg-gradient-to-br p-4 text-white shadow-[0_28px_60px_rgba(17,12,30,0.22)] ring-1 ring-white/12 transition duration-300 hover:translate-y-[-4px] sm:h-[260px] sm:w-[190px] sm:p-5 lg:h-[315px] lg:w-[220px] lg:p-6 ${card.accent} ${card.className}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_40%)]" />

                <div className="relative flex items-center justify-between">
                  <span className="text-[9px] font-black text-white/90 sm:text-[10px]">
                    {card.platform}
                  </span>

                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[8px] font-black text-white/90 sm:text-[9px]">
                    {card.pill}
                  </span>
                </div>

                <div className="relative mt-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/18 text-[10px] font-black">
                    A
                  </div>

                  <p className="truncate text-[9px] font-bold text-white/70">
                    {card.handle}
                  </p>
                </div>

                <div className="relative mt-4 rounded-[20px] bg-black/10 p-3 backdrop-blur-[3px] sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[8px] font-black uppercase tracking-[0.12em] text-white/75 sm:text-[9px]">
                      {card.type}
                    </span>

                    <span className="text-[8px] font-black text-white">
                      AQRYO
                    </span>
                  </div>

                  <h3 className="mt-3 text-[17px] font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-[20px] lg:text-[24px]">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-[9px] leading-4 text-white/80 sm:text-[10px]">
                    {card.subtitle}
                  </p>

                  <div className="mt-4 inline-flex rounded-full bg-white px-3 py-1.5 text-[9px] font-black text-[#140f26]">
                    {card.action} →
                  </div>
                </div>

                <div className="relative mt-3 flex items-center justify-between text-[8px] font-bold text-white/70 sm:text-[9px]">
                  <span>AQRYO deneyimi</span>
                  <span>aqryo.com</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}