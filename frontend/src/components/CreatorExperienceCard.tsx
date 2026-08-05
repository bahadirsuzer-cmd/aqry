import { Link } from "@tanstack/react-router";
import type { Test } from "@/types";

interface CreatorExperienceCardProps {
  test: Test;
}

export function CreatorExperienceCard({
  test,
}: CreatorExperienceCardProps) {
  const formattedParticipants =
    test.totalParticipants >= 1000
      ? `${(test.totalParticipants / 1000)
          .toFixed(1)
          .replace(".", ",")}B`
      : String(test.totalParticipants);

  return (
    <article className="group min-w-0 overflow-hidden rounded-[18px] border border-border bg-card shadow-[0_10px_28px_rgba(38,16,65,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(38,16,65,0.12)] sm:rounded-[22px]">
      <Link
        to="/test/$slug/quiz"
        params={{ slug: test.slug }}
        className="block"
        aria-label={`${test.title} Experience'ını başlat`}
      >
        <div className="relative h-[105px] overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-400 sm:h-[135px] lg:h-[145px]">
          {test.coverImage ? (
            <img
              src={test.coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <>
              <div
                aria-hidden="true"
                className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-white/20 blur-3xl"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.1]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "17px 17px",
                }}
              />
            </>
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5"
          />

          <div className="absolute right-[-34px] top-[14px] z-20 flex h-[28px] w-[118px] rotate-45 items-center justify-center bg-red-600 text-[11px] font-black uppercase tracking-[0.13em] text-white shadow-lg sm:right-[-31px] sm:top-[17px] sm:h-[31px] sm:text-xs">
            Quiz
          </div>
        </div>

        <div className="flex min-h-[118px] flex-col p-3 sm:min-h-[132px] sm:p-4">
          <span className="w-fit rounded-full bg-primary/[0.07] px-2 py-1 text-[7px] font-bold uppercase tracking-[0.13em] text-primary sm:text-[8px]">
            AQRY Original
          </span>

          <h3 className="mt-2 line-clamp-2 text-[13px] font-black leading-[1.12] tracking-[-0.035em] text-foreground sm:text-[17px] sm:leading-[1.08]">
            {test.title}
          </h3>

          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            <span className="flex min-w-0 items-center gap-1.5 truncate text-[9px] font-medium text-muted-foreground sm:text-[11px]">
              <span aria-hidden="true">♙</span>
              {formattedParticipants} katılımcı
            </span>

            <span className="inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-full bg-black px-3 text-[9px] font-bold text-white sm:h-8 sm:px-4 sm:text-[11px]">
              Başla
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}