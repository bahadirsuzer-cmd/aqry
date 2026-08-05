interface CreatorProfileCardProps {
  name: string;
  username: string;
  avatar?: string;
  integrated?: boolean;
}

export function CreatorProfileCard({
  name,
  username,
  avatar,
  integrated = false,
}: CreatorProfileCardProps) {
  return (
    <aside
      className={`flex min-h-[390px] flex-col bg-card ${
        integrated
          ? "border-t border-border lg:border-l lg:border-t-0"
          : "rounded-[32px] border border-border shadow-soft"
      }`}
    >
      <div className="px-7 pb-5 pt-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Bu Experience&apos;ı hazırlayan
        </p>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl font-medium text-white shadow-md ring-4 ring-violet-50">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-xl font-black tracking-[-0.035em] text-foreground">
              {name}
            </h2>

            <p className="mt-1 truncate text-sm text-muted-foreground">
              @{username.replace(/^@/, "")}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-7 py-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[22px] bg-muted/55 px-4 py-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Experience
            </p>

            <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-foreground">
              18
            </p>
          </div>

          <div className="rounded-[22px] bg-muted/55 px-4 py-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Verified
            </p>

            <p className="mt-3 text-lg font-black tracking-[-0.04em] text-foreground">
              ✓ AQRY
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          Quiz, personality ve interaktif experience&apos;lar hazırlıyor.
        </p>
      </div>

      <div className="mt-auto px-7 pb-7">
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-black px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-black/85 hover:shadow-lg"
        >
          Tüm Experience&apos;ları Gör

          <span aria-hidden="true">→</span>
        </button>
      </div>
    </aside>
  );
}