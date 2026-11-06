import { LanguageSelector } from "@/components/LanguageSelector";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAqryoLocale } from "@/lib/i18n";

const navItems = [
  {
    labelKey: "howItWorks",
    href: "/#how-it-works",
  },
  {
    labelKey: "createContent",
    href: "/#aqryo-formats",
  },
];

export function PublicNavigation() {
  const { t } = useAqryoLocale();
  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  return (
    <header className="sticky top-0 z-[100] isolate border-b border-black/[0.04] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] w-full max-w-[1440px] items-center justify-between px-5 sm:px-7 lg:px-10">
        <Link
          to="/"
          aria-label="AQRYO"
          className="flex shrink-0 items-center"
        >
          <img
            src="/aqryo-logo.png"
            alt="AQRYO"
            className="h-[25px] w-auto object-contain sm:h-[39px]"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13px] font-bold text-foreground/75 transition hover:text-primary"
            >
              {t(item.labelKey)}
            </a>
          ))}
        </nav>

        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <div className="hidden sm:block"><LanguageSelector compact /></div>
          <Link
            to="/creator-auth"
            className="inline-flex h-11 max-w-[100px] items-center justify-center rounded-full border border-primary/25 bg-white px-2 text-[10px] sm:max-w-none sm:px-5 sm:text-[12px] font-black text-primary transition hover:border-primary hover:bg-primary/[0.04]"
          >
            {t("creatorLogin")}
            <span className="ms-2 hidden sm:inline">
              →
            </span>
          </Link>

          <button
            type="button"
            aria-label={t("menu")}
            aria-expanded={
              mobileOpen
            }
            onClick={() =>
              setMobileOpen(
                (value) => !value,
              )
            }
            className="flex h-11 w-11 items-center justify-center rounded-full text-[24px] text-foreground lg:hidden"
          >
            {mobileOpen
              ? "×"
              : "☰"}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="absolute inset-x-0 top-full z-[110] border-b border-border bg-white px-5 py-4 shadow-[0_18px_45px_rgba(32,18,54,0.08)] lg:hidden">
          <div className="pb-3 sm:hidden"><LanguageSelector /></div>
          <nav className="mx-auto flex max-w-[720px] flex-col">
            {navItems.map(
              (item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setMobileOpen(
                      false,
                    )
                  }
                  className="border-b border-border/70 py-4 text-sm font-black last:border-b-0"
                >
                  {t(item.labelKey)}
                </a>
              ),
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
