import type {
  ReactNode,
} from "react";
import {
  Link,
} from "@tanstack/react-router";

export type AdminSection =
  | "overview"
  | "reports"
  | "experiences"
  | "orders"
  | "payouts"
  | "creators"
  | "homepage"
  | "announcements";

interface AdminShellProps {
  activeSection: AdminSection;
  onSectionChange:
    (section: AdminSection) => void;
  onSignOut: () => void;
  children: ReactNode;
}

const ITEMS: Array<{
  key: AdminSection;
  label: string;
}> = [
  {
    key: "overview",
    label: "Genel",
  },
  {
    key: "reports",
    label: "Reportlar",
  },
  {
    key: "experiences",
    label: "Experience",
  },
  {
    key: "orders",
    label: "Siparişler",
  },
  {
    key: "payouts",
    label: "Payout",
  },
  {
    key: "creators",
    label: "Creator’lar",
  },
  {
    key: "homepage",
    label: "Ana Sayfa",
  },
  {
    key: "announcements",
    label: "Duyurular",
  },
];

export function AdminShell({
  activeSection,
  onSectionChange,
  onSignOut,
  children,
}: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[#f7f7f9] text-foreground">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between px-5 sm:px-7">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-[22px] font-black tracking-[-0.06em] text-primary"
            >
              AQRYO.
            </Link>

            <span className="rounded-full bg-black px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-white">
              Admin
            </span>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            className="text-[10px] font-black text-muted-foreground transition hover:text-foreground"
          >
            Çıkış yap
          </button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1500px] gap-5 px-5 py-5 sm:px-7 lg:grid-cols-[210px_1fr]">
        <aside className="rounded-[22px] border border-border bg-white p-3 lg:self-start">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {ITEMS.map((item) => {
              const active =
                activeSection ===
                item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    onSectionChange(
                      item.key,
                    )
                  }
                  className={`shrink-0 rounded-[14px] px-4 py-3 text-left text-[10px] font-black transition ${
                    active
                      ? "bg-black text-white"
                      : "text-muted-foreground hover:bg-[#f6f6f7] hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          {children}
        </section>
      </div>
    </main>
  );
}