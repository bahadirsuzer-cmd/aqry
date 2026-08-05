import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AqryLogo } from "@/components/AqryLogo";

const items = [
  { to: "/creator", label: "Genel Bakış", exact: true },
  { to: "/creator/tests", label: "Testlerim", exact: true },
  { to: "/creator/tests/new", label: "Yeni Test", exact: true },
  { to: "/creator/analytics", label: "Analitik", exact: true },
  { to: "/creator/profile", label: "Profil", exact: true },
] as const;

export function CreatorNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const isActive = (to: string) => (to === "/creator" ? pathname === "/creator" : pathname.startsWith(to));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-center gap-3">
          <AqryLogo to="/creator" />
          <span className="hidden rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground sm:inline">
            Creator Studio
          </span>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                isActive(item.to)
                  ? "bg-gradient-brand-soft text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/"
            className="ml-1 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Public siteye dön
          </Link>
        </nav>

        <button
          type="button"
          aria-expanded={open}
          aria-label="Menüyü aç"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground md:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
            />
          </svg>
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-card px-5 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  isActive(item.to) ? "bg-gradient-brand-soft text-primary" : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-foreground"
            >
              Public siteye dön
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function CreatorShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <CreatorNavigation />
      <main className="mx-auto w-full max-w-5xl px-5 pb-20 pt-6">{children}</main>
    </div>
  );
}
