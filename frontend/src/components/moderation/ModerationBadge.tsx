interface ModerationBadgeProps {
  status: string;
  pausedBy?: string | null;
}

export function ModerationBadge({
  status,
  pausedBy,
}: ModerationBadgeProps) {
  if (
    status === "paused" &&
    pausedBy === "moderation"
  ) {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.06em] text-red-700">
        Moderasyon
      </span>
    );
  }

  if (
    status === "paused" &&
    pausedBy === "creator"
  ) {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.06em] text-amber-700">
        Creator duraklattı
      </span>
    );
  }

  if (status === "published") {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.06em] text-emerald-700">
        Yayında
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-[#f4f4f5] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.06em] text-muted-foreground">
      {status}
    </span>
  );
}