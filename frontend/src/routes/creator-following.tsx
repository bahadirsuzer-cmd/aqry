import { CreatorNavigation } from "@/components/CreatorNavigation";
import { CreatorAvatar } from "@/components/creator/CreatorAvatar";
import type {
  CreatorAvatarBackground,
  CreatorAvatarStyle,
} from "@/services/creatorAvatar";
import {
  getCurrentCreator,
  signOutCreator,
} from "@/services/auth";
import { supabase } from "@/services/supabase";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute(
  "/creator-following",
)({
  component: CreatorFollowingPage,
});

type FollowedCreator = {
  creator_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  avatar_style: CreatorAvatarStyle | null;
  avatar_bg: CreatorAvatarBackground | null;
  avatar_zoom: number | null;
  avatar_x: number | null;
  avatar_y: number | null;
  avatar_frame: boolean | null;
  bio: string | null;
  followed_at: string;
};

function CreatorFollowingPage() {
  const [loading, setLoading] =
    useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [creators, setCreators] =
    useState<FollowedCreator[]>([]);
  const [savingId, setSavingId] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFollowing() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const user =
          await getCurrentCreator();

        if (!user) {
          window.location.href =
            "/creator-auth";
          return;
        }

        const {
          data,
          error,
        } = await supabase.rpc(
          "get_my_following",
        );

        if (error) {
          throw new Error(
            error.message,
          );
        }

        if (!cancelled) {
          setCreators(
            (data ?? []) as FollowedCreator[],
          );
        }
      } catch (error) {
        console.error(
          "Takip edilenler yüklenemedi:",
          error,
        );

        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Takip edilenler yüklenemedi.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadFollowing();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleUnfollow(
    creatorId: string,
  ) {
    if (savingId) {
      return;
    }

    try {
      setSavingId(creatorId);

      const { error } =
        await supabase.rpc(
          "unfollow_creator",
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

      setCreators((current) =>
        current.filter(
          (creator) =>
            creator.creator_id !==
            creatorId,
        ),
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Takip bırakılamadı.",
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfbfd] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href =
            "/creator-auth";
        }}
      />

      <div className="mx-auto max-w-[1080px] px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        <header className="border-b border-border pb-6">
          <a
            href="/creator-account"
            className="text-[12px] font-black text-primary"
          >
            ← Hesabım
          </a>

          <p className="mt-5 text-[12px] font-black uppercase tracking-[0.14em] text-primary">
            Hesabım
          </p>

          <h1 className="mt-2 text-[36px] font-black tracking-[-0.055em] sm:text-[44px]">
            Takip ettiklerim
          </h1>

          <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-muted-foreground">
            Daha sonra kolayca bulmak
            istediğin creator'ları burada
            tutabilirsin.
          </p>
        </header>

        {loading ? (
          <section className="mt-6 rounded-[24px] border border-border bg-white p-12 text-center">
            <p className="text-[14px] font-bold text-muted-foreground">
              Takip ettiklerin yükleniyor...
            </p>
          </section>
        ) : null}

        {errorMessage ? (
          <section className="mt-6 rounded-[24px] border border-red-100 bg-red-50 p-5">
            <p className="text-[13px] font-bold text-red-700">
              {errorMessage}
            </p>
          </section>
        ) : null}

        {!loading &&
        !errorMessage &&
        creators.length === 0 ? (
          <section className="mt-6 rounded-[26px] border border-border bg-white p-10 text-center shadow-[0_18px_50px_rgba(18,10,40,0.04)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-primary/[0.06] text-primary">
              <HeartIcon />
            </div>

            <h2 className="mt-5 text-[19px] font-black">
              Henüz kimseyi takip etmiyorsun
            </h2>

            <p className="mx-auto mt-2 max-w-[500px] text-[13px] leading-6 text-muted-foreground">
              Bir creator'ın profilinde
              “Takip et” dediğinde burada
              görünecek. AQRYO bunu bir
              keşfet akışına dönüştürmez;
              sadece daha sonra bulmanı
              kolaylaştırır.
            </p>
          </section>
        ) : null}

        {!loading &&
        !errorMessage &&
        creators.length > 0 ? (
          <section className="mt-6 overflow-hidden rounded-[26px] border border-border bg-white shadow-[0_18px_50px_rgba(18,10,40,0.04)]">
            {creators.map(
              (creator, index) => (
                <article
                  key={
                    creator.creator_id
                  }
                  className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6 ${
                    index > 0
                      ? "border-t border-border"
                      : ""
                  }`}
                >
                  <CreatorAvatar
                    avatarUrl={creator.avatar_url}
                    displayName={creator.display_name}
                    username={creator.username}
                    avatarStyle={creator.avatar_style}
                    avatarBg={creator.avatar_bg}
                    avatarZoom={creator.avatar_zoom}
                    avatarX={creator.avatar_x}
                    avatarY={creator.avatar_y}
                    avatarFrame={creator.avatar_frame}
                    size={64}
                  />

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[17px] font-black tracking-[-0.02em]">
                      {
                        creator.display_name
                      }
                    </h2>

                    {creator.username ? (
                      <p className="mt-1 text-[12px] font-semibold text-muted-foreground">
                        @{creator.username}
                      </p>
                    ) : null}

                    {creator.bio ? (
                      <p className="mt-2 line-clamp-2 max-w-[620px] text-[12px] leading-5 text-muted-foreground">
                        {creator.bio}
                      </p>
                    ) : null}

                    <p className="mt-2 text-[10px] font-semibold text-muted-foreground/75">
                      {formatDate(
                        creator.followed_at,
                      )}{" "}
                      tarihinde takip edildi
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <a
                      href={`/creator/${creator.creator_id}`}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-[12px] font-black text-white transition hover:opacity-85"
                    >
                      Profile git
                    </a>

                    <button
                      type="button"
                      disabled={
                        savingId ===
                        creator.creator_id
                      }
                      onClick={() =>
                        void handleUnfollow(
                          creator.creator_id,
                        )
                      }
                      className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-white px-5 text-[12px] font-black transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingId ===
                      creator.creator_id
                        ? "..."
                        : "Takibi bırak"}
                    </button>
                  </div>
                </article>
              ),
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}


function formatDate(
  value: string | null,
) {
  if (!value) {
    return "Yakın zamanda";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Yakın zamanda";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}


function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20.5 5.5c-2-2-5.2-2-7.2 0L12 6.8l-1.3-1.3c-2-2-5.2-2-7.2 0s-2 5.2 0 7.2L12 21l8.5-8.3c2-2 2-5.2 0-7.2Z" />
    </svg>
  );
}
