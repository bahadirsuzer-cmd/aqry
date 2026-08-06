import {
  Link,
  useRouterState,
} from "@tanstack/react-router";

interface CreatorNavigationProps {
  onSignOut: () =>
    | void
    | Promise<void>;
}

const navigationItems = [
  {
    label: "Studio",
    mobileLabel: "Studio",
    to: "/creator-studio",
    enabled: true,
  },
  {
    label: "Experience’larım",
    mobileLabel: "Experience",
    to: "/creator-experiences",
    enabled: true,
  },
  {
    label: "Kazançlar",
    mobileLabel: "Kazanç",
    to: "/creator-earnings",
    enabled: true,
  },
  {
    label: "Hediyeler",
    mobileLabel: "Hediye",
    to: "/creator-gifts",
    enabled: true,
  },
  {
    label: "Ödemeler",
    mobileLabel: "Ödeme",
    to: "/creator-payments",
    enabled: true,
  },
  {
    label: "Hesap",
    mobileLabel: "Hesap",
    to: "/creator-account",
    enabled: true,
  },
] as const;

export function CreatorNavigation({
  onSignOut,
}: CreatorNavigationProps) {
  const pathname =
    useRouterState({
      select: (state) =>
        state.location.pathname,
    });

  return (
    <header className="sticky top-0 z-[100] isolate border-b border-border bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[1320px] px-3 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between gap-3">
          <Link
            to="/"
            aria-label="AQRYO ana sayfa"
            className="flex shrink-0 items-center"
          >
            <img
              src="/aqryo-logo.png"
              alt="AQRYO"
              className="h-[34px] w-auto object-contain sm:h-[38px]"
            />
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center gap-1 sm:flex">
            {navigationItems.map(
              (item) => {
                const active =
                  pathname === item.to;

                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-[13px] font-bold transition ${
                      active
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:bg-background hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              },
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onSignOut}
              className="hidden h-10 items-center justify-center rounded-full border border-border bg-white px-4 text-[13px] font-bold text-muted-foreground transition hover:border-primary hover:text-primary sm:flex"
            >
              Çıkış yap
            </button>

            <Link
              to="/creator-studio"
              className="flex h-11 items-center justify-center whitespace-nowrap rounded-full bg-black px-4 text-[12px] font-bold text-white transition hover:bg-primary sm:px-5 sm:text-[13px]"
            >
              Yeni Experience
            </Link>
          </div>
        </div>

        <div className="border-t border-border sm:hidden">
          <nav className="-mx-3 flex items-center gap-2 overflow-x-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navigationItems.map(
              (item) => {
                const active =
                  pathname === item.to;

                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-[12px] font-bold transition ${
                      active
                        ? "bg-primary text-white"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    {
                      item.mobileLabel
                    }
                  </Link>
                );
              },
            )}

            <button
              type="button"
              onClick={onSignOut}
              className="flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-background px-4 text-[12px] font-bold text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
            >
              Çıkış
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}