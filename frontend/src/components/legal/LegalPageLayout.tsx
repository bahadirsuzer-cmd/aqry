import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { PublicNavigation } from "@/components/home/PublicNavigation";
import { HomeFooter } from "@/components/home/HomeFooter";

interface LegalSection {
  title: string;
  content: ReactNode;
}

interface LegalPageLayoutProps {
  title: string;
  description: string;
  sections: LegalSection[];
}

export function LegalPageLayout({
  title,
  description,
  sections,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-foreground">
      <PublicNavigation />

      <main>
        <section className="border-b border-border bg-gradient-to-b from-violet-50/70 via-white to-white">
          <div className="mx-auto w-full max-w-[980px] px-5 pb-10 pt-12 sm:px-7 sm:pb-14 sm:pt-16 lg:px-10">
            <h1 className="text-[36px] font-black leading-[1] tracking-[-0.055em] sm:text-[50px]">
              {title}
            </h1>

            <p className="mt-4 max-w-[760px] text-[14px] leading-7 text-muted-foreground">
              {description}
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[980px] px-5 py-10 sm:px-7 sm:py-14 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-[22px] border border-border bg-white p-4">
                <p className="text-[10px] font-black">
                  Bu sayfada
                </p>

                <nav className="mt-3 flex flex-col gap-2">
                  {sections.map((section, index) => (
                    <a
                      key={section.title}
                      href={`#legal-${index + 1}`}
                      className="text-[10px] leading-5 text-muted-foreground transition hover:text-primary"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <article
                  key={section.title}
                  id={`legal-${index + 1}`}
                  className="scroll-mt-28"
                >
                  <h2 className="text-[21px] font-black tracking-[-0.035em]">
                    {index + 1}. {section.title}
                  </h2>

                  <div className="mt-3 space-y-3 text-[12px] leading-6 text-muted-foreground">
                    {section.content}
                  </div>
                </article>
              ))}

              <div className="rounded-[22px] border border-border bg-background p-5">
                <p className="text-[11px] font-black">
                  İletişim
                </p>

                <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
                  Yasal, ödeme, iade veya hesapla ilgili talepleriniz için
                  {" "}
                  <a
                    href="mailto:hey@buum-e.com"
                    className="font-semibold text-primary"
                  >
                    hey@buum-e.com
                  </a>
                  {" "}
                  adresinden veya
                  {" "}
                  <a
                    href="tel:+905412914935"
                    className="font-semibold text-primary"
                  >
                    0541 291 49 35
                  </a>
                  {" "}
                  numarasından bize ulaşabilirsiniz.
                </p>

                <Link
                  to="/"
                  className="mt-4 inline-flex text-[10px] font-black text-primary"
                >
                  AQRYO ana sayfasına dön →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}