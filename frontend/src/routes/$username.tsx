import { createFileRoute, Link } from "@tanstack/react-router";
import { CreatorExperienceCard } from "@/components/CreatorExperienceCard";
import { tests } from "@/data/testData";

export const Route = createFileRoute("/$username")({
  component: CreatorProfilePage,
});

function CreatorProfilePage() {
  const { username } = Route.useParams();

  const normalizedUsername = username.replace(/^@/, "").toLowerCase();

  const creatorTests = tests.filter((test) => {
    const testCreatorUsername = test.creator.username
      .replace(/^@/, "")
      .toLowerCase();

    const isPublished =
      test.status === "active" || test.status === "published";

    return (
      testCreatorUsername === normalizedUsername &&
      isPublished
    );
  });

  const creator = creatorTests[0]?.creator;

  if (!creator) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-lg text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Creator bulunamadı
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-[-0.055em] text-foreground">
            Bu profil mevcut değil
          </h1>

          <p className="mt-4 leading-7 text-muted-foreground">
            Bağlantı hatalı olabilir veya creator profili henüz
            yayınlanmamış olabilir.
          </p>

          <Link
            to="/"
            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-7 text-sm font-bold text-white"
          >
            Ana sayfaya dön
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    );
  }

  const totalParticipants = creatorTests.reduce(
    (total, test) => total + test.totalParticipants,
    0,
  );

  const formattedParticipants =
    totalParticipants >= 1000
      ? `${(totalParticipants / 1000)
          .toFixed(1)
          .replace(".", ",")}B`
      : String(totalParticipants);

  const creatorInitials = creator.name.slice(0, 2).toUpperCase();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <span className="absolute -right-28 top-10 select-none text-[260px] font-black tracking-[-0.08em] text-primary/[0.018]">
          AQRY.
        </span>

        <span className="absolute -left-24 bottom-0 select-none text-[220px] font-black tracking-[-0.08em] text-primary/[0.018]">
          AQRY.
        </span>
      </div>

      <main className="relative z-10 pb-12">
        <section className="mx-auto w-full max-w-[1540px] px-4 pt-3 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between md:hidden">
            <Link
              to="/"
              className="text-[28px] font-black tracking-[-0.065em] text-primary"
            >
              AQRY.
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
            >
              <span aria-hidden="true">←</span>
              Ana sayfa
            </Link>
          </div>

          <div className="md:grid md:grid-cols-[130px_minmax(0,1fr)_130px] md:items-center md:gap-5 lg:grid-cols-[150px_minmax(0,1fr)_150px]">
            <Link
              to="/"
              className="hidden text-[31px] font-black tracking-[-0.065em] text-primary md:block"
            >
              AQRY.
            </Link>

            <div className="relative h-[188px] overflow-hidden rounded-[26px] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-400 md:h-[150px] md:rounded-[28px]">
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl"
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

              <section className="absolute inset-x-3 bottom-3 rounded-[20px] border border-white/60 bg-white/95 p-4 shadow-[0_16px_38px_rgba(38,16,65,0.12)] backdrop-blur-md md:inset-x-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:px-6 md:py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3 md:gap-4">
                    <div className="relative flex h-[62px] w-[62px] shrink-0 items-center justify-center overflow-hidden rounded-[18px] border-4 border-white bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-bold text-white shadow-lg md:h-[78px] md:w-[78px] md:rounded-[22px]">
                      {creator.avatar ? (
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{creatorInitials}</span>
                      )}

                      {creator.verified ? (
                        <span className="absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-primary text-[9px] font-black text-primary-foreground">
                          ✓
                        </span>
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <h1 className="truncate text-[19px] font-black leading-none tracking-[-0.045em] text-foreground sm:text-[22px] md:text-[30px]">
                          {creator.name}
                        </h1>

                        {creator.verified ? (
                          <span className="hidden rounded-full bg-primary/[0.07] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-primary sm:inline-flex">
                            Doğrulanmış
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 truncate text-[11px] font-medium text-muted-foreground md:text-sm">
                        @{creator.username.replace(/^@/, "")}
                      </p>

                      <p className="mt-1 line-clamp-1 text-[10px] leading-4 text-muted-foreground md:text-xs">
                        {creator.bio ??
                          "Quiz, personality ve interaktif Experience’lar hazırlıyor."}
                      </p>
                    </div>
                  </div>

                  <div className="hidden shrink-0 items-center gap-3 sm:flex">
                    <div className="rounded-[16px] border border-border bg-white px-5 py-3 text-xs shadow-sm">
                      <span className="font-black text-primary">
                        {creatorTests.length}
                      </span>

                      <span className="ml-2 text-muted-foreground">
                        Experience
                      </span>
                    </div>

                    <div className="rounded-[16px] border border-border bg-white px-5 py-3 text-xs shadow-sm">
                      <span className="font-black text-primary">
                        {formattedParticipants}
                      </span>

                      <span className="ml-2 text-muted-foreground">
                        katılımcı
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
                  <div className="rounded-full bg-muted/60 px-2 py-1.5 text-center text-[10px]">
                    <span className="font-black text-foreground">
                      {creatorTests.length}
                    </span>

                    <span className="ml-1 text-muted-foreground">
                      Experience
                    </span>
                  </div>

                  <div className="rounded-full bg-muted/60 px-2 py-1.5 text-center text-[10px]">
                    <span className="font-black text-foreground">
                      {formattedParticipants}
                    </span>

                    <span className="ml-1 text-muted-foreground">
                      katılımcı
                    </span>
                  </div>
                </div>
              </section>
            </div>

            <Link
              to="/"
              className="hidden items-center justify-end gap-2 whitespace-nowrap text-sm font-semibold text-muted-foreground transition hover:text-foreground md:inline-flex"
            >
              <span aria-hidden="true">←</span>
              Ana sayfa
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-5 w-full max-w-[1180px] px-4 sm:px-6 md:mt-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary sm:text-[10px]">
                Yayındaki Experience&apos;lar
              </p>

              <h2 className="mt-2 text-[20px] font-black leading-tight tracking-[-0.04em] text-foreground sm:text-[24px]">
                {creator.name} tarafından hazırlandı
              </h2>
            </div>

            <span className="hidden rounded-[16px] border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground sm:inline-flex">
              {creatorTests.length} Experience
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {creatorTests.map((test) => (
              <CreatorExperienceCard
                key={test.id}
                test={test}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}