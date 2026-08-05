import { Link } from "@tanstack/react-router";

const groups = [
  {
    title: "Ürün",
    items: [
      ["Nasıl çalışır?", "#how-it-works"],
      ["Örnek deneyimler", "#examples"],
      ["AI kredileri", "#ai-credits"],
      ["Fiyatlandırma", "#pricing"],
    ],
  },
  {
    title: "Creator",
    items: [
      ["Creator girişi", "/creator-auth"],
      ["Creator Studio", "/creator-studio"],
    ],
  },
  {
    title: "Yasal",
    items: [
      ["Kullanım koşulları", "/terms"],
      ["Gizlilik politikası", "/privacy"],
      ["Çerez politikası", "/cookies"],
      ["Creator koşulları", "/creator-terms"],
    ],
  },
];

export function HomeFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-10 sm:px-7 md:grid-cols-[1.2fr_2fr] lg:px-10">
        <div>
          <Link
            to="/"
            className="text-[27px] font-black tracking-[-0.065em] text-primary"
          >
            AQRYO.
          </Link>

          <p className="mt-3 max-w-xs text-[11px] leading-5 text-muted-foreground">
            Etkileşimini interaktif deneyimlere dönüştür.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-black">
                {group.title}
              </p>

              <div className="mt-3 flex flex-col gap-2.5">
                {group.items.map(
                  ([label, href]) =>
                    href.startsWith("/") ? (
                      <Link
                        key={href}
                        to={href}
                        className="text-[10px] text-muted-foreground transition hover:text-primary"
                      >
                        {label}
                      </Link>
                    ) : (
                      <a
                        key={href}
                        href={href}
                        className="text-[10px] text-muted-foreground transition hover:text-primary"
                      >
                        {label}
                      </a>
                    ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 px-5 py-5 text-[9px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10">
          <span>
            © {new Date().getFullYear()} AQRYO.
          </span>
          <span>
            Interactive experiences for creators.
          </span>
        </div>
      </div>
    </footer>
  );
}