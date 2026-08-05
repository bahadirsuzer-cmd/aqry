import {
  Link,
  useRouterState,
} from "@tanstack/react-router";

interface CreatorNavigationProps {
  onSignOut: () => void | Promise<void>;
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
  const pathname = useRouterState({
    select: (state) =>
      state.location.pathname,
  });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[1320px] px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link
            to="/"
            className="shrink-0 text-[25px] font-black tracking-[-0.065em] text-primary sm:text-[27px]"
          >
            AQRYO.
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
                    className={`flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-[10px] font-bold transition ${
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
              className="hidden h-10 items-center justify-center rounded-full border border-border bg-white px-4 text-[10px] font-bold text-muted-foreground transition hover:border-primary hover:text-primary sm:flex"
            >
              Çıkış yap
            </button>

            <Link
              to="/creator-studio"
              className="flex h-10 items-center justify-center whitespace-nowrap rounded-full bg-black px-4 text-[9px] font-bold text-white transition hover:bg-primary sm:px-5 sm:text-[10px]"
            >
              Yeni Experience
            </Link>
          </div>
        </div>

        <nav className="grid grid-cols-7 gap-1 border-t border-border py-2 sm:hidden">
          {navigationItems.map(
            (item) => {
              const active =
                pathname === item.to;

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex h-9 min-w-0 items-center justify-center rounded-[10px] px-1 text-center text-[8px] font-bold transition ${
                    active
                      ? "bg-primary text-white"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="truncate">
                    {item.mobileLabel}
                  </span>
                </Link>
              );
            },
          )}

          <button
            type="button"
            onClick={onSignOut}
            className="flex h-9 min-w-0 items-center justify-center rounded-[10px] px-1 text-[8px] font-bold text-muted-foreground transition hover:bg-background hover:text-primary"
          >
            Çıkış
          </button>
        </nav>
      </div>
    </header>
  );
}