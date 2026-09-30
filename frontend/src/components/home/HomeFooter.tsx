import { Link } from "@tanstack/react-router";
import { useAqryoLocale } from "@/lib/i18n";

export function HomeFooter() {
  const { t } = useAqryoLocale();
  const groups = [
    { title: t("product"), items: [[t("howItWorks"), "/#how-it-works"], [t("playExample"), "/#hero-demo"], [t("createContent"), "/#aqryo-formats"], [t("pricing"), "/pricing"]] },
    { title: t("creator"), items: [[t("creatorLogin"), "/creator-auth"]] },
    { title: t("legal"), items: [[t("about"), "/about"], [t("contact"), "/contact"], [t("terms"), "/terms"], [t("privacy"), "/privacy"], [t("deliveryRefund"), "/delivery-refund"], [t("distanceSales"), "/distance-sales"], [t("paymentTerms"), "/payment-terms"], [t("cookies"), "/cookies"], [t("creatorTerms"), "/creator-terms"]] },
  ];

  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-10 sm:px-7 md:grid-cols-[1.2fr_2fr] lg:px-10">
        <div>
          <Link to="/" className="text-[27px] font-black tracking-[-0.065em] text-primary">AQRYO.</Link>
          <p className="mt-3 max-w-xs text-[11px] leading-5 text-muted-foreground">{t("footerTagline")}</p>
          <div className="mt-6 max-w-sm text-[10px] leading-5 text-muted-foreground">
            <p className="font-semibold text-foreground">BUUME Bilişim Teknoloji Reklamcılık Anonim Şirketi</p>
            <p className="mt-1">Büyükesat Mahallesi Koza 1 Caddesi No: 153/4<br />Çankaya / Ankara</p>
            <div className="mt-2 flex flex-col">
              <a href="mailto:hey@buum-e.com" className="transition hover:text-primary">hey@buum-e.com</a>
              <a href="tel:+905412914935" className="transition hover:text-primary">0541 291 49 35</a>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {groups.map((group) => <div key={group.title}>
            <p className="text-[10px] font-black">{group.title}</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {group.items.map(([label, href]) => href.startsWith("/") && !href.includes("#")
                ? <Link key={href} to={href} className="text-[10px] text-muted-foreground transition hover:text-primary">{label}</Link>
                : <a key={href} href={href} className="text-[10px] text-muted-foreground transition hover:text-primary">{label}</a>)}
            </div>
          </div>)}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 px-5 py-6 text-[9px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10">
          <span>© {new Date().getFullYear()} AQRYO.</span><span>{t("footerEnd")}</span>
        </div>
      </div>
    </footer>
  );
}
