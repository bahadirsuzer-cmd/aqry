import { Link } from "@tanstack/react-router";

const groups = [
  {
    title: "Ürün",
    items: [
      ["Nasıl çalışır?", "/#how-it-works"],
      ["Örneği oyna", "/#hero-demo"],
      ["İçerik oluştur", "/#start-creating"],
      ["Fiyatlandırma", "/pricing"],
      ["İnternetten para kazanma", "/internetten-para-kazanma"],
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
      ["Hakkımızda", "/about"],
      ["İletişim", "/contact"],
      ["Kullanım koşulları", "/terms"],
      ["Gizlilik ve KVKK", "/privacy"],
      ["Teslimat ve iade", "/delivery-refund"],
      ["Mesafeli satış sözleşmesi", "/distance-sales"],
      ["Ödeme koşulları", "/payment-terms"],
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

          <div className="mt-6 max-w-sm text-[10px] leading-5 text-muted-foreground">
            <p className="font-semibold text-foreground">
              BUUME Bilişim Teknoloji Reklamcılık Anonim Şirketi
            </p>
            <p className="mt-1">
              Büyükesat Mahallesi Koza 1 Caddesi No: 153/4
              <br />
              Çankaya / Ankara
            </p>

            <div className="mt-2 flex flex-col">
              <a
                href="mailto:hey@buum-e.com"
                className="transition hover:text-primary"
              >
                hey@buum-e.com
              </a>

              <a
                href="tel:+905412914935"
                className="transition hover:text-primary"
              >
                0541 291 49 35
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-black">
                {group.title}
              </p>

              <div className="mt-3 flex flex-col gap-2.5">
                {group.items.map(([label, href]) =>
                  href.startsWith("/") && !href.includes("#") ? (
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
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 py-6 sm:px-7 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold text-foreground">
                Güvenli ödeme
              </p>
              <p className="mt-1 text-[9px] text-muted-foreground">
                Ödemeler güvenli ödeme altyapısı üzerinden gerçekleştirilir.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <img
                src="/payment-logos/visa.svg"
                alt="Visa"
                className="h-6 w-auto object-contain"
              />

              <img
                src="/payment-logos/mastercard.svg"
                alt="Mastercard"
                className="h-7 w-auto object-contain"
              />

              <div className="hidden h-7 w-px bg-border sm:block" />

              <img
                src="/payment-logos/iyzico-ile-ode.svg"
                alt="iyzico ile Öde"
                className="h-7 w-auto object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-5 text-[9px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()} AQRYO.
            </span>

            <span>
              Interactive experiences for creators.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
