import type { ReactNode } from "react";
import { AqryLogo } from "./AqryLogo";

interface PageShellProps {
  children: ReactNode;
  narrow?: boolean;
}

export function PageShell({
  children,
  narrow = false,
}: PageShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background lg:h-screen lg:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
      >
        <span className="absolute -left-20 top-[220px] text-[150px] font-black tracking-[-0.08em] text-primary/[0.018] sm:text-[180px] lg:-left-24 lg:bottom-0 lg:top-auto">
          AQRY.
        </span>

        <span className="absolute right-[-120px] top-[120px] hidden text-[220px] font-black tracking-[-0.08em] text-primary/[0.018] lg:block">
          AQRY.
        </span>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col lg:h-full lg:min-h-0">
        <header
          className={`mx-auto flex h-[88px] w-full flex-shrink-0 items-center px-6 sm:px-8 lg:h-[72px] ${
            narrow ? "max-w-[560px]" : "max-w-[1200px]"
          }`}
        >
          <AqryLogo />
        </header>

        <main
          className={`mx-auto w-full flex-1 px-6 pb-10 sm:px-8 lg:min-h-0 lg:pb-5 ${
            narrow ? "max-w-[560px]" : "max-w-[1200px]"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}