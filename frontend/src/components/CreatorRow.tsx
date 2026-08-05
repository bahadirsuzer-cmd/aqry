import type { Creator } from "@/types";
import { formatParticipants } from "@/utils/format";

interface CreatorRowProps {
  creator: Creator;
  participants?: number;
  duration?: string;
}

function VerifiedBadge() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-label="Doğrulanmış creator" role="img">
      <path
        fill="url(#aqry-verified)"
        d="M12 1.6l2.4 2.1 3.2-.3.9 3.1 2.8 1.6-1.3 2.9 1.3 2.9-2.8 1.6-.9 3.1-3.2-.3L12 22.4l-2.4-2.1-3.2.3-.9-3.1-2.8-1.6L4 12.9 2.7 10l2.8-1.6.9-3.1 3.2.3L12 1.6z"
      />
      <path fill="#fff" d="M10.9 15.3l-3-3 1.3-1.3 1.7 1.7 4-4L16.2 10z" />
      <defs>
        <linearGradient id="aqry-verified" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.55 0.24 300)" />
          <stop offset="100%" stopColor="oklch(0.68 0.22 350)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function CreatorRow({ creator, participants, duration }: CreatorRowProps) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={creator.avatar}
        alt={`${creator.name} avatarı`}
        className="h-9 w-9 rounded-full border border-border object-cover"
        loading="lazy"
      />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-foreground">{creator.name}</span>
          {creator.verified ? <VerifiedBadge /> : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {participants !== undefined ? `${formatParticipants(participants)} katılımcı` : null}
          {participants !== undefined && duration ? " · " : null}
          {duration ?? null}
        </p>
      </div>
    </div>
  );
}
