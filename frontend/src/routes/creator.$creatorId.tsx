import { useEffect, useState } from "react";
import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import { supabase } from "@/services/supabase";
import { getCurrentCreator } from "@/services/auth";

type CreatorProfile = {
  id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
};

type CreatorExperience = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  cover_style: string | null;
  cover_label: string | null;
  cover_image_url: string | null;
  published_at: string | null;
};

export const Route = createFileRoute(
  "/creator/$creatorId",
)({
  component: PublicCreatorPage,
});

function PublicCreatorPage() {
  const { creatorId } = Route.useParams();

  const [creator, setCreator] =
    useState<CreatorProfile | null>(null);

  const [experiences, setExperiences] =
    useState<CreatorExperience[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [viewerId, setViewerId] =
    useState<string | null>(null);

  const [isFollowing, setIsFollowing] =
    useState(false);

  const [followLoading, setFollowLoading] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCreatorPage() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const [
          profileResult,
          experiencesResult,
        ] = await Promise.all([
          supabase
            .from("creator_profiles")
            .select(
              `
                id,
                display_name,
                username,
                avatar_url,
                bio
              `,
            )
            .eq("id", creatorId)
            .maybeSingle(),

          supabase
            .from("experiences")
            .select(
              `
                id,
                type,
                title,
                description,
                cover_style,
                cover_label,
                cover_image_url,
                published_at
              `,
            )
            .eq("creator_id", creatorId)
            .eq("status", "published")
            .order("published_at", {
              ascending: false,
            }),
        ]);

        if (profileResult.error) {
          throw new Error(
            profileResult.error.message,
          );
        }

        if (experiencesResult.error) {
          throw new Error(
            experiencesResult.error.message,
          );
        }

        if (cancelled) {
          return;
        }

        setCreator(
          profileResult.data as CreatorProfile | null,
        );

        setExperiences(
          (experiencesResult.data ??
            []) as CreatorExperience[],
        );

        const viewer =
          await getCurrentCreator();

        if (!cancelled && viewer) {
          setViewerId(viewer.id);

          if (viewer.id !== creatorId) {
            const {
              data: followingData,
              error: followingError,
            } = await supabase.rpc(
              "is_following_creator",
              {
                p_creator_id:
                  creatorId,
              },
            );

            if (followingError) {
              console.error(
                "Takip durumu yüklenemedi:",
                followingError,
              );
            } else {
              setIsFollowing(
                followingData === true,
              );
            }
          }
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Creator sayfası yüklenemedi.";

        console.error(
          "Public creator sayfası yüklenemedi:",
          error,
        );

        if (!cancelled) {
          setErrorMessage(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCreatorPage();

    return () => {
      cancelled = true;
    };
  }, [creatorId]);

  async function handleFollowToggle() {
    if (followLoading) {
      return;
    }

    const viewer =
      await getCurrentCreator();

    if (!viewer) {
      window.location.href =
        "/creator-auth";
      return;
    }

    if (viewer.id === creatorId) {
      return;
    }

    try {
      setFollowLoading(true);

      const rpcName =
        isFollowing
          ? "unfollow_creator"
          : "follow_creator";

      const { error } =
        await supabase.rpc(
          rpcName,
          {
            p_creator_id:
              creatorId,
          },
        );

      if (error) {
        throw new Error(
          error.message,
        );
      }

      setViewerId(viewer.id);
      setIsFollowing(
        (current) => !current,
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Takip işlemi tamamlanamadı.",
      );
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-xs font-bold text-muted-foreground">
            Creator yükleniyor...
          </p>
        </div>
      </PageShell>
    );
  }

  if (errorMessage) {
    return (
      <PageShell>
        <div className="mx-auto mt-16 max-w-md rounded-[28px] border border-red-200 bg-white p-7 text-center shadow-[0_24px_70px_rgba(35,16,55,0.10)]">
          <p className="text-sm font-black">
            Creator sayfası açılamadı
          </p>

          <p className="mt-2 text-[10px] leading-5 text-red-600">
            {errorMessage}
          </p>

          <Link
            to="/"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-[10px] font-black text-white"
          >
            AQRY’ye dön
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!creator) {
    return (
      <PageShell>
        <div className="mx-auto mt-16 max-w-md rounded-[28px] border border-border bg-white p-7 text-center shadow-[0_24px_70px_rgba(35,16,55,0.10)]">
          <p className="text-sm font-black">
            Creator bulunamadı
          </p>

          <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
            Bu profil kaldırılmış veya bağlantı yanlış olabilir.
          </p>

          <Link
            to="/"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-[10px] font-black text-white"
          >
            AQRY’ye dön
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="mx-auto w-full max-w-[1120px] px-4 pb-14 pt-8 sm:px-6 sm:pt-12">
        <section className="mx-auto max-w-[760px] text-center">
          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 scale-[1.18] rounded-full bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-pink-500/15 blur-xl" />

            <div className="relative mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[5px] border-white bg-primary/[0.08] text-[24px] font-black text-primary shadow-[0_18px_50px_rgba(35,16,55,0.16)]">
              {creator.avatar_url ? (
                <img
                  src={creator.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                getCreatorInitials(
                  creator.display_name,
                )
              )}
            </div>

            <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-primary text-[9px] font-black text-white shadow-sm">
              ◆
            </span>
          </div>

          <h1 className="mt-5 text-[32px] font-black leading-none tracking-[-0.055em] sm:text-[40px]">
            {creator.display_name}
          </h1>

          <p className="mt-2 text-[11px] font-bold text-muted-foreground">
            {creator.username
              ? `@${creator.username}`
              : "AQRY Creator"}
          </p>

          {creator.bio && (
            <p className="mx-auto mt-4 max-w-[560px] text-[12px] leading-6 text-muted-foreground">
              {creator.bio}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-[9px] font-black shadow-[0_8px_24px_rgba(35,16,55,0.05)]">
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/[0.10] px-1.5 text-primary">
                {experiences.length}
              </span>

              <span>
                yayındaki Experience
              </span>
            </div>

            {viewerId !== creatorId ? (
              <button
                type="button"
                onClick={() =>
                  void handleFollowToggle()
                }
                disabled={followLoading}
                className={`inline-flex h-10 items-center justify-center rounded-full px-5 text-[11px] font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isFollowing
                    ? "border border-border bg-white text-foreground hover:border-red-200 hover:text-red-600"
                    : "bg-primary text-white hover:opacity-90"
                }`}
              >
                {followLoading
                  ? "..."
                  : isFollowing
                    ? "Takibi bırak"
                    : "Takip et"}
              </button>
            ) : null}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.13em] text-primary">
                Creator’ın yayınları
              </p>

              <h2 className="mt-1 text-[20px] font-black tracking-[-0.04em]">
                Diğer AQRY’ler
              </h2>
            </div>

            <span className="hidden text-[9px] font-bold text-muted-foreground sm:block">
              {experiences.length} Experience
            </span>
          </div>

          {experiences.length === 0 ? (
            <div className="mt-5 rounded-[24px] border border-border bg-white p-10 text-center">
              <p className="text-sm font-black">
                Henüz başka yayın yok
              </p>

              <p className="mt-2 text-[10px] text-muted-foreground">
                Bu creator’ın yayındaki başka bir AQRY’si bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {experiences.map(
                (experience) => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                  />
                ),
              )}
            </div>
          )}
        </section>
      </main>
    </PageShell>
  );
}

function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_85%,rgba(124,58,237,0.06),transparent_28%),radial-gradient(circle_at_85%_85%,rgba(236,72,153,0.05),transparent_28%),#fbfafd] text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1240px] items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="text-[28px] font-black tracking-[-0.065em] text-primary"
          >
            AQRY.
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/creator-auth"
              className="hidden h-10 items-center justify-center rounded-full px-4 text-[10px] font-black text-foreground transition hover:bg-background sm:flex"
            >
              Giriş yap
            </Link>

            <Link
              to="/create"
              className="flex h-10 items-center justify-center rounded-full bg-black px-4 text-[10px] font-black text-white transition hover:bg-primary sm:px-5"
            >
              + Sen de oluştur
            </Link>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}

function ExperienceCard({
  experience,
}: {
  experience: CreatorExperience;
}) {
  const coverClass =
    getCoverClass(experience.cover_style);

  return (
    <article className="group overflow-hidden rounded-[26px] border border-border bg-white shadow-[0_14px_40px_rgba(35,16,55,0.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(35,16,55,0.11)]">
      <a
        href={`/experience/${experience.id}`}
        className="block"
      >
        <div
          className={`relative h-40 overflow-hidden bg-gradient-to-br ${coverClass}`}
        >
          {experience.cover_image_url && (
            <img
              src={experience.cover_image_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          )}

          <div className="absolute inset-0 bg-black/[0.06]" />

          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "15px 15px",
            }}
          />

          <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <span className="w-fit rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[7px] font-black uppercase tracking-[0.11em] backdrop-blur-md">
                {experience.cover_label ||
                  formatExperienceType(
                    experience.type,
                  )}
              </span>

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-[12px] font-black backdrop-blur-md transition group-hover:bg-white group-hover:text-foreground">
                →
              </span>
            </div>

            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.13em] text-white/75">
                AQRY Experience
              </p>

              <p className="mt-2 line-clamp-2 text-[20px] font-black leading-[1.02] tracking-[-0.045em]">
                {experience.title}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[8px] font-black uppercase tracking-[0.10em] text-primary">
              {formatExperienceType(
                experience.type,
              )}
            </span>

            <span className="text-[8px] font-bold text-muted-foreground">
              Ücretsiz
            </span>
          </div>

          {experience.description && (
            <p className="mt-3 line-clamp-2 min-h-8 text-[10px] leading-4 text-muted-foreground">
              {experience.description}
            </p>
          )}

          <div className="mt-5 flex h-10 w-full items-center justify-center rounded-full bg-black text-[9px] font-black text-white transition group-hover:bg-primary">
            Başla →
          </div>
        </div>
      </a>
    </article>
  );
}

function getCreatorInitials(
  displayName: string,
) {
  const words = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "AQ";
  }

  return words
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase(),
    )
    .join("");
}

function formatExperienceType(
  type: string,
) {
  return type
    .replace(/[-_]/g, " ")
    .trim();
}

function getCoverClass(
  style: string | null,
) {
  if (style === "purple") {
    return "from-violet-600 via-purple-600 to-fuchsia-500";
  }

  if (style === "blue") {
    return "from-cyan-500 via-blue-500 to-indigo-600";
  }

  if (style === "dark") {
    return "from-slate-900 via-zinc-800 to-black";
  }

  return "from-fuchsia-500 via-pink-500 to-rose-500";
}