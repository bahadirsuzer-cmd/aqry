import type {
  CreatorAvatarBackground,
  CreatorAvatarStyle,
} from "@/services/creatorAvatar";

interface CreatorAvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  username?: string | null;
  avatarStyle?: CreatorAvatarStyle | null;
  avatarBg?: CreatorAvatarBackground | null;
  avatarZoom?: number | null;
  avatarX?: number | null;
  avatarY?: number | null;
  avatarFrame?: boolean | null;
  size?: number;
  className?: string;
  alt?: string;
}

const BACKGROUND_CLASSES: Record<
  CreatorAvatarBackground,
  string
> = {
  violet:
    "from-violet-500 to-fuchsia-500",
  pink:
    "from-pink-500 to-rose-500",
  blue:
    "from-blue-500 to-cyan-500",
  mint:
    "from-emerald-400 to-teal-500",
  orange:
    "from-orange-400 to-amber-500",
  dark:
    "from-slate-800 to-slate-950",
};

function getFrameClass(
  style: CreatorAvatarStyle,
) {
  if (style === "soft") {
    return "ring-4 ring-white/70 shadow-[0_12px_28px_rgba(15,23,42,0.16)]";
  }

  if (style === "glow") {
    return "ring-4 ring-white/80 shadow-[0_0_0_8px_rgba(168,85,247,0.12),0_16px_34px_rgba(168,85,247,0.28)]";
  }

  if (style === "outline") {
    return "ring-4 ring-foreground/15 shadow-[0_12px_28px_rgba(15,23,42,0.15)]";
  }

  if (style === "aqryo") {
    return "ring-4 ring-cyan-300/80 shadow-[0_0_0_8px_rgba(34,211,238,0.10),0_16px_34px_rgba(124,58,237,0.24)]";
  }

  if (style === "card") {
    return "ring-4 ring-white shadow-[0_16px_34px_rgba(15,23,42,0.18)]";
  }

  return "ring-2 ring-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]";
}

function getInitials(
  displayName?: string | null,
  username?: string | null,
) {
  const source =
    displayName?.trim() ||
    username?.trim() ||
    "AQ";

  return source
    .replace(/^@/, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part
        .slice(0, 1)
        .toLocaleUpperCase(
          "tr-TR",
        ),
    )
    .join("");
}

function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(
    Math.max(value, min),
    max,
  );
}

export function CreatorAvatar({
  avatarUrl,
  displayName,
  username,
  avatarStyle = "classic",
  avatarBg = "violet",
  avatarZoom = 1,
  avatarX = 50,
  avatarY = 50,
  avatarFrame = true,
  size = 88,
  className = "",
  alt = "",
}: CreatorAvatarProps) {
  const safeStyle =
    avatarStyle ??
    "classic";

  const safeBg =
    avatarBg ??
    "violet";

  const safeZoom =
    clamp(
      Number(
        avatarZoom ?? 1,
      ),
      0.8,
      2.6,
    );

  const safeX =
    clamp(
      Number(
        avatarX ?? 50,
      ),
      10,
      90,
    );

  const safeY =
    clamp(
      Number(
        avatarY ?? 50,
      ),
      10,
      90,
    );

  const backgroundClass =
    BACKGROUND_CLASSES[
      safeBg
    ] ??
    BACKGROUND_CLASSES.violet;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br ${backgroundClass} ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_46%)]" />

      {avatarUrl?.trim() ? (
        <div
          className={`absolute inset-[3px] overflow-hidden rounded-full ${
            avatarFrame
              ? getFrameClass(
                  safeStyle,
                )
              : ""
          }`}
        >
          <img
            src={avatarUrl.trim()}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition:
                `${safeX}% ${safeY}%`,
              transform:
                `scale(${safeZoom})`,
              transformOrigin:
                "center center",
            }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[28%] font-black text-white">
          {getInitials(
            displayName,
            username,
          )}
        </div>
      )}
    </div>
  );
}