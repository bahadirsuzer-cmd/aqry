import type {
  HomeExperienceCard,
} from "./homeData";

interface ExperiencePreviewCardProps {
  experience: HomeExperienceCard;
  className?: string;
  compact?: boolean;
}

function typeClass(type: HomeExperienceCard["type"]) {
  if (type === "TEST") {
    return "bg-pink-500 text-white";
  }

  if (type === "HİKAYE") {
    return "bg-violet-600 text-white";
  }

  return "bg-amber-500 text-white";
}

export function ExperiencePreviewCard({
  experience,
  className = "",
  compact = false,
}: ExperiencePreviewCardProps) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[26px] border border-black/5 bg-gradient-to-br ${experience.accent} shadow-[0_18px_48px_rgba(35,16,55,0.14)] ${className}`}
    >
      {experience.coverImage ? (
        <img
          src={experience.coverImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading={compact ? "lazy" : "eager"}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[72px] font-black tracking-[-0.08em] text-white/20">
          {experience.fallbackSymbol}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/5" />

      <div className="relative flex h-full flex-col justify-between p-4 text-white sm:p-5">
        <div>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black tracking-[0.05em] ${typeClass(experience.type)}`}
          >
            {experience.type}
          </span>
        </div>

        <div>
          <h3
            className={`font-black leading-[1.02] tracking-[-0.045em] ${
              compact
                ? "text-[20px]"
                : "text-[25px] sm:text-[29px]"
            }`}
          >
            {experience.title}
          </h3>

          <div className="mt-3 flex items-center justify-between gap-3 text-[10px] font-bold text-white/80">
            <span>{experience.meta}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm backdrop-blur">
              →
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}