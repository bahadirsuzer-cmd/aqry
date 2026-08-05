export function AiCreditsIntro() {
  return (
    <section
      id="ai-credits"
      className="mx-auto w-full max-w-[1440px] px-5 sm:px-7 lg:px-10"
    >
      <div className="rounded-[28px] border border-primary/10 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 p-5 sm:p-7">
        <div className="grid gap-7 lg:grid-cols-[1.1fr_1.6fr_0.72fr] lg:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-white text-[38px] shadow-[0_16px_35px_rgba(109,40,217,0.12)]">
              ◉
            </div>

            <div>
              <h2 className="text-[21px] font-black leading-tight tracking-[-0.035em] sm:text-[25px]">
                AI kredileriyle
                <br />
                fikirden yayına, çok hızlı!
              </h2>

              <p className="mt-2 max-w-sm text-[12px] leading-5 text-muted-foreground">
                Fikir bul, taslak oluştur, sorularını yazdır.
                AI kredileriyle üretim süresini kısalt.
              </p>
            </div>
          </div>

          <div
            id="how-it-works"
            className="grid grid-cols-3 gap-3"
          >
            {[
              ["✦", "Fikir üret", "AI sana fikirler önerir."],
              ["▤", "Taslak oluştur", "Sorularını ve içeriğini hazırlar."],
              ["↗", "Yayınla", "Deneyimini yayınla ve paylaş."],
            ].map(([icon, title, text]) => (
              <div
                key={title}
                className="rounded-[20px] bg-white/80 p-4 text-center"
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/[0.07] text-lg text-primary">
                  {icon}
                </div>

                <p className="mt-3 text-[11px] font-black">
                  {title}
                </p>

                <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-[22px] border border-primary/10 bg-white p-5 text-center">
            <div className="text-3xl">
              🎁
            </div>

            <p className="mt-2 text-[10px] font-bold text-muted-foreground">
              Yeni creator’lara
            </p>

            <p className="mt-1 text-[22px] font-black tracking-[-0.04em] text-primary">
              AI kredisi
            </p>

            <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
              Başlangıçta kullanman için.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}