import { Link, useRouterState } from "@tanstack/react-router";
import { AQRYO_LANGUAGES, useAqryoLocale, type AqryoLocale } from "@/lib/i18n";

interface CreatorNavigationProps {
  onSignOut: () => void | Promise<void>;
}

export function CreatorNavigation({ onSignOut }: CreatorNavigationProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { locale, setLocale, t } = useAqryoLocale();

  const navigationItems = [
    { label: t("studio"), to: "/creator-studio" },
    { label: t("inbox"), to: "/creator-inbox" },
    { label: t("experiences"), to: "/creator-experiences" },
    { label: t("account"), to: "/creator-account" },
  ];

  return (
    <header className="sticky top-0 z-[100] isolate border-b border-border bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[1320px] px-3 sm:px-6 lg:px-8">
        <div className="flex h-[78px] items-center justify-between gap-3">
          <Link to="/" aria-label="AQRYO" className="flex shrink-0 items-center">
            <img
              src="/aqryo-logo.png"
              alt="AQRYO"
              className="h-[38px] w-auto object-contain sm:h-[42px]"
            />
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center gap-1.5 md:flex">
            {navigationItems.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-[14px] font-extrabold transition ${
                    active
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-background hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <label className="hidden sm:block">
              <span className="sr-only">{t("language")}</span>
              <select
                value={locale}
                onChange={(event) => setLocale(event.target.value as AqryoLocale)}
                className="h-11 rounded-full border border-border bg-white px-3 text-[12px] font-extrabold text-foreground outline-none focus:border-primary"
              >
                {AQRYO_LANGUAGES.map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </label>

            <Link
              to="/creator-studio"
              className="flex h-12 items-center justify-center whitespace-nowrap rounded-full bg-black px-5 text-[13px] font-extrabold text-white transition hover:bg-primary"
            >
              {t("newExperience")}
            </Link>
          </div>
        </div>

        <div className="border-t border-border md:hidden">
          <nav className="-mx-3 flex items-center gap-2 overflow-x-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navigationItems.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-[13px] font-extrabold transition ${
                    active
                      ? "bg-primary text-white"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <select
              aria-label={t("language")}
              value={locale}
              onChange={(event) => setLocale(event.target.value as AqryoLocale)}
              className="h-11 shrink-0 rounded-full border border-border bg-white px-3 text-[12px] font-extrabold"
            >
              {AQRYO_LANGUAGES.map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={onSignOut}
              className="flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-background px-4 text-[13px] font-extrabold text-muted-foreground"
            >
              {t("signOut")}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
