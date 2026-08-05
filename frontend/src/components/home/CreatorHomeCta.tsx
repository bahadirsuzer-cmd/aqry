import { Link } from "@tanstack/react-router";

interface CreatorHomeCtaProps {
  isCreator?: boolean;
}

export function CreatorHomeCta({
  isCreator = false,
}: CreatorHomeCtaProps) {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 pb-12 sm:px-7 lg:px-10">
      <div className="rounded-[28px] border border-primary/10 bg-gradient-to-r from-violet-50 via-fuchsia-50/70 to-purple-50 p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.6fr_auto] lg:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-2xl text-primary shadow-sm">
              ⚡
            </div>

            <div>
              <h2 className="text-[24px] font-black tracking-[-0.04em]">
                {isCreator
                  ? "Üretmeye devam et."
                  : "Creator mısın?"}
              </h2>

              <p className="mt-1 text-[11px] text-muted-foreground">
                {isCreator
                  ? "Yeni bir deneyim oluştur ve kitlenle paylaş."
                  : "Kendi kitleni etkile, gelirini artır."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              [
                "✎",
                "Kolay oluşturma",
                "Kod yok",
              ],
              [
                "✦",
                "AI destekli üretim",
                "Fikirden taslağa",
              ],
              [
                "▣",
                "Gelir",
                "Hediye ve teklif",
              ],
            ].map(
              ([icon, title, text]) => (
                <div
                  key={title}
                  className="text-center lg:text-left"
                >
                  <div className="text-xl text-primary">
                    {icon}
                  </div>

                  <p className="mt-1 text-[10px] font-black">
                    {title}
                  </p>

                  <p className="mt-1 text-[9px] text-muted-foreground">
                    {text}
                  </p>
                </div>
              ),
            )}
          </div>

          <Link
            to={
              isCreator
                ? "/creator-studio"
                : "/creator-auth"
            }
            className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-purple-500 px-7 text-[12px] font-black text-white shadow-[0_14px_30px_rgba(109,40,217,0.20)]"
          >
            {isCreator
              ? "Studio’ya dön"
              : "Hemen başla"}

            <span className="ml-5">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}