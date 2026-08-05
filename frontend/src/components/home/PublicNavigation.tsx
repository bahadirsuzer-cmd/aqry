import { useState } from "react";
import { Link } from "@tanstack/react-router";

const navItems = [
  { label: "Nasıl çalışır?", href: "#how-it-works" },
  { label: "Örnek deneyimler", href: "#examples" },
  { label: "AI kredileri", href: "#ai-credits" },
  { label: "Fiyatlandırma", href: "#pricing" },
];

export function PublicNavigation() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (
    <header className="relative z-50 border-b border-black/[0.04] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] w-full max-w-[1440px] items-center justify-between px-5 sm:px-7 lg:px-10">
        <Link
          to="/"
          className="text-[28px] font-black tracking-[-0.065em] text-primary sm:text-[30px]"
        >
          AQRYO.
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13px] font-bold text-foreground/75 transition hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/creator-auth"
            className="inline-flex h-11 items-center justify-center rounded-full border border-primary/25 bg-white px-5 text-[12px] font-black text-primary transition hover:border-primary hover:bg-primary/[0.04]"
          >
            Giriş yap
            <span className="ml-2">→</span>
          </Link>

          <button
            type="button"
            aria-label="Menüyü aç"
            aria-expanded={mobileOpen}
            onClick={() =>
              setMobileOpen((value) => !value)
            }
            className="flex h-11 w-11 items-center justify-center rounded-full text-[24px] text-foreground lg:hidden"
          >
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="absolute inset-x-0 top-full border-b border-border bg-white px-5 py-4 shadow-[0_18px_45px_rgba(32,18,54,0.08)] lg:hidden">
          <nav className="mx-auto flex max-w-[720px] flex-col">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() =>
                  setMobileOpen(false)
                }
                className="border-b border-border/70 py-4 text-sm font-black last:border-b-0"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}