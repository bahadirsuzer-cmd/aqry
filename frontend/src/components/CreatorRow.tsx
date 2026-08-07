import { CreatorAvatar } from "@/components/creator/CreatorAvatar";
import type {
  CreatorAvatarBackground,
  CreatorAvatarStyle,
} from "@/services/creatorAvatar";
import type { Creator } from "@/types";
import { formatParticipants } from "@/utils/format";

type CreatorWithAvatarSettings = Creator & {
  avatarStyle?: CreatorAvatarStyle | null;
  avatarBg?: CreatorAvatarBackground | null;
  avatarZoom?: number | null;
  avatarX?: number | null;
  avatarY?: number | null;
  avatarFrame?: boolean | null;
};

interface CreatorRowProps {
  creator: CreatorWithAvatarSettings;
  participants?: number;
  duration?: string;
}

function VerifiedBadge() {
  return (
    <span
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-black leading-none text-white"
      aria-label="Doğrulanmış hesap"
      title="Doğrulanmış hesap"
    >
      ✓
    </span>
  );
}

export function CreatorRow({
  creator,
  participants,
  duration,
}: CreatorRowProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <CreatorAvatar
        avatarUrl={creator.avatar}
        displayName={creator.name}
        avatarStyle={creator.avatarStyle}
        avatarBg={creator.avatarBg}
        avatarZoom={creator.avatarZoom}
        avatarX={creator.avatarX}
        avatarY={creator.avatarY}
        avatarFrame={creator.avatarFrame}
        size={36}
        alt={`${creator.name} avatarı`}
        className="border border-border"
      />

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[13px] font-black text-foreground">
            {creator.name}
          </span>

          {creator.verified ? <VerifiedBadge /> : null}
        </div>

        {participants !== undefined || duration ? (
          <p className="mt-0.5 truncate text-[12px] font-medium text-muted-foreground">
            {participants !== undefined
              ? `${formatParticipants(participants)} katılımcı`
              : null}
            {participants !== undefined && duration ? " · " : null}
            {duration ?? null}
          </p>
        ) : null}
      </div>
    </div>
  );
}