import type { ReactNode } from "react";
import { PublicNavigation } from "@/components/home/PublicNavigation";
import { HomeFooter } from "@/components/home/HomeFooter";

interface PublicPageShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function PublicPageShell({
  eyebrow,
  title,
  description,
  children,
}: PublicPageShellProps) {
  return (
    <div className="min-h-screen bg-white text-foreground">
      <PublicNavigation />

      <main>
        <section className="border-b border-border bg-gradient-to-b from-violet-50/70 via-white to-white">
          <div className="mx-auto w-full max-w-[1180px] px-5 pb-12 pt-12 sm:px-7 sm:pb-16 sm:pt-16 lg:px-10">
            {eyebrow ? (
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                {eyebrow}
              </p>
            ) : null}

            <h1 className="mt-3 max-w-[820px] text-[38px] font-black leading-[1] tracking-[-0.055em] sm:text-[52px]">
              {title}
            </h1>

            {description ? (
              <p className="mt-5 max-w-[720px] text-[15px] leading-7 text-muted-foreground sm:text-[16px]">
                {description}
              </p>
            ) : null}
          </div>
        </section>

        {children}
      </main>

      <HomeFooter />
    </div>
  );
}