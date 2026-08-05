import { Link } from "@tanstack/react-router";
import type { Test } from "@/types";

interface TestCardProps {
  test: Test;
  integrated?: boolean;
}

type ExtendedTest = Test & {
  description?: string;
  subtitle?: string;
  participantCount?: string | number;
  duration?: string | number;
};

export function TestCard({
  test,
  integrated = false,
}: TestCardProps) {
  const displayTest = test as ExtendedTest;

  const description =
    displayTest.description ??
    displayTest.subtitle ??
    "Experience'ı tamamla ve sonucunu ücretsiz gör.";

  const participantCount =
    displayTest.participantCount ?? "48,2B";

  const duration =
    typeof displayTest.duration === "number"
      ? `${displayTest.duration} dakika`
      : displayTest.duration ?? "2 dakika";

  return (
    <article
      className={`flex flex-col overflow-hidden bg-card ${
        integrated
          ? ""
          : "rounded-[32px] border border-border shadow-soft"
      }`}
    >
      <div className="relative h-[170px] flex-shrink-0 overflow-hidden bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-400 px-6 py-5 sm:h-[185px] sm:px-8 sm:py-6">
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/25 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-28 left-[28%] h-56 w-56 rounded-full bg-violet-700/25 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />

        {test.coverImage ? (
          <img
            src={test.coverImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}

        <div className="relative z-10 flex h-full flex-col justify-between">
          <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md sm:text-[11px]">
            AQRY Original
          </span>

          <span className="text-[54px] font-black leading-none tracking-[-0.075em] text-white sm:text-[76px]">
            QUIZ
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 py-5 sm:px-8 sm:py-6">
        <div>
          <h2 className="max-w-[720px] text-[22px] font-black leading-[1.08] tracking-[-0.045em] text-foreground sm:text-[28px]">
            {test.title}
          </h2>

          <p className="mt-3 max-w-[680px] text-sm leading-6 text-muted-foreground sm:text-[15px]">
            {description}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-sm">
              {test.creator.avatar ? (
                <img
                  src={test.creator.avatar}
                  alt={test.creator.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>
                  {test.creator.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-bold text-foreground">
                  {test.creator.name}
                </p>

                <span
                  aria-label="Doğrulanmış creator"
                  className="text-xs text-fuchsia-500"
                >
                  ✿
                </span>
              </div>

              <p className="truncate text-xs text-muted-foreground">
                {participantCount} katılımcı · {duration}
              </p>
            </div>
          </div>

          <Link
            to="/test/$slug/quiz"
            params={{ slug: test.slug }}
            className="inline-flex h-11 flex-shrink-0 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-black/85 hover:shadow-lg sm:h-12 sm:gap-3 sm:px-6"
          >
            Başla

            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}