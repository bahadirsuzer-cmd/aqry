import { Link } from "@tanstack/react-router";
import type { Test } from "@/types";
import { PageShell } from "@/components/PageShell";
import { CreatorRow } from "@/components/CreatorRow";

interface TestIntroPageProps {
  test: Test;
}

export function TestIntroPage({ test }: TestIntroPageProps) {
  return (
    <PageShell>
      <main className="mx-auto w-full max-w-2xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden="true">←</span>
          Ana sayfaya dön
        </Link>

        <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <div className="relative aspect-[16/9] w-full bg-gradient-brand">
            {test.coverImage ? (
              <img
                src={test.coverImage}
                alt={test.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-end p-6 sm:p-8">
                <span className="rounded-full bg-background/15 px-3 py-1.5 text-xs font-bold tracking-[0.16em] text-primary-foreground backdrop-blur-sm">
                  {test.category}
                </span>
              </div>
            )}

            {test.coverImage ? (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-16 sm:p-8 sm:pt-20">
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold tracking-[0.16em] text-white backdrop-blur-sm">
                  {test.category}
                </span>
              </div>
            ) : null}
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <header className="space-y-3">
              <h1 className="text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl">
                {test.title}
              </h1>

              <p className="text-lg leading-relaxed text-muted-foreground">
                {test.subtitle}
              </p>
            </header>

            <CreatorRow
              creator={test.creator}
              participants={test.totalParticipants}
              duration={test.estimatedDuration}
            />

            <div className="h-px bg-border" />

            <p className="text-[16px] leading-7 text-muted-foreground">
              {test.description}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Soru
                </p>

                <p className="mt-1 text-lg font-bold text-foreground">
                  {test.questions.length}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Süre
                </p>

                <p className="mt-1 text-lg font-bold text-foreground">
                  {test.estimatedDuration}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-brand-soft p-4">
              <p className="text-sm font-semibold text-foreground">
                Sonucun ücretsiz
              </p>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Soruları tamamladıktan sonra sonucunu ödeme yapmadan görebilirsin.
              </p>
            </div>

            <Link
              to="/test/$slug/play"
              params={{ slug: test.slug }}
              className="btn-primary w-full"
            >
              Teste Başla
            </Link>
          </div>
        </article>
      </main>
    </PageShell>
  );
}