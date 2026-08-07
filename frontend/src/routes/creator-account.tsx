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
  "/creator-account",
)({
  component: CreatorAccountHubPage,
});

type AccountProfile = {
  displayName: string;
  username: string;
  avatarUrl: string;
  avatarStyle: CreatorAvatarStyle;
  avatarBg: CreatorAvatarBackground;
  avatarZoom: number;
  avatarX: number;
  avatarY: number;
  avatarFrame: boolean;
  bio: string;
  email: string;
};

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  kind: "purchase" | "gift" | "profile";
};

const accountItems = [
  {
    href: "/creator-profile",
    title: "Profili düzenle",
    description:
      "Fotoğrafını, adını, kullanıcı adını ve bio bilgini güncelle.",
    icon: "profile",
  },
  {
    href: "/creator-purchases",
    title: "Satın aldıklarım",
    description:
      "Satın aldığın Offer ve ücretli içerik geçmişini gör.",
    icon: "purchase",
  },
  {
    href: "/creator-sent-gifts",
    title: "Gönderdiğim hediyeler",
    description:
      "Hangi creator'a hangi hediyeyi gönderdiğini takip et.",
    icon: "gift",
  },
  {
    href: "/creator-following",
    title: "Takip ettiklerim",
    description:
      "Takip ettiğin creator'ları tek yerde gör ve yönet.",
    icon: "heart",
  },
  {
    href: "/creator-privacy",
    title: "Gizlilik ve izinler",
    description:
      "Bildirim, e-posta, veri ve çerez tercihlerini düzenle.",
    icon: "privacy",
  },
  {
    href: "/creator-security",
    title: "Güvenlik",
    description:
      "Şifre, oturumlar ve hesap güvenliğini yönet.",
    icon: "security",
  },
  {
    href: "/creator-legal",
    title: "Yasal",
    description:
      "Kullanım koşulları, gizlilik politikası ve diğer belgeler.",
    icon: "legal",
  },
] as const;

function CreatorAccountHubPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] =
    useState<AccountProfile | null>(null);
  const [activities, setActivities] =
    useState<ActivityItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadAccountHub() {
      try {
        setLoading(true);

        const creator =
          await getCurrentCreator();

        if (!creator) {
          window.location.href =
            "/creator-auth";
          return;
        }

        const displayName =
          typeof creator.user_metadata
            ?.display_name === "string"
            ? creator.user_metadata.display_name.trim()
            : "";

        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("creator_profiles")
          .select(
            `
              username,
              avatar_url,
              avatar_style,
              avatar_bg,
              avatar_zoom,
              avatar_x,
              avatar_y,
              avatar_frame,
              bio,
              updated_at
            `,
          )
          .eq("id", creator.id)
          .maybeSingle();

        if (profileError) {
          throw new Error(
            profileError.message,
          );
        }

        if (cancelled) {
          return;
        }

        setProfile({
          displayName:
            displayName || "AQRYO kullanıcısı",
          username:
            profileData?.username ?? "",
          avatarUrl:
            profileData?.avatar_url ?? "",
          avatarStyle:
            (profileData?.avatar_style ??
              "classic") as CreatorAvatarStyle,
          avatarBg:
            (profileData?.avatar_bg ??
              "violet") as CreatorAvatarBackground,
          avatarZoom:
            Number(
              profileData?.avatar_zoom ??
                1,
            ),
          avatarX:
            Number(
              profileData?.avatar_x ??
                50,
            ),
          avatarY:
            Number(
              profileData?.avatar_y ??
                50,
            ),
          avatarFrame:
            profileData?.avatar_frame ??
            true,
          bio:
            profileData?.bio ?? "",
          email: creator.email ?? "",
        });

        const nextActivities: ActivityItem[] =
          [];

        if (profileData?.updated_at) {
          nextActivities.push({
            id: "profile-update",
            title: "Profil güncellendi",
            detail:
              "Profil bilgilerin güncellendi.",
            createdAt:
              profileData.updated_at,
            kind: "profile",
          });
        }

        setActivities(nextActivities);
      } catch (error) {
        console.error(
          "Hesap merkezi yüklenemedi:",
          error,
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAccountHub();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#fbfbfd] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href =
            "/creator-auth";
        }}
      />

      <div className="mx-auto max-w-[1380px] px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        <header>
          <p className="text-[12px] font-black uppercase tracking-[0.14em] text-primary">
            Hesabım
          </p>

          <h1 className="mt-2 text-[38px] font-black tracking-[-0.055em] sm:text-[46px]">
            Hesabım
          </h1>

          <p className="mt-2 max-w-[720px] text-[15px] leading-6 text-muted-foreground">
            Profilin, satın aldıkların,
            hediyelerin, takiplerin ve hesap
            ayarların burada.
          </p>
        </header>

        {loading ? (
          <section className="mt-7 rounded-[26px] border border-border bg-white p-12 text-center">
            <p className="text-[14px] font-bold text-muted-foreground">
              Hesabın hazırlanıyor...
            </p>
          </section>
        ) : (
          <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            <section className="overflow-hidden rounded-[26px] border border-border bg-white shadow-[0_18px_50px_rgba(18,10,40,0.04)]">
              {accountItems.map(
                (item, index) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`group flex min-h-[102px] items-center gap-4 px-5 py-4 transition hover:bg-primary/[0.025] sm:px-6 ${
                      index > 0
                        ? "border-t border-border"
                        : ""
                    }`}
                  >
                    <AccountIcon
                      type={item.icon}
                    />

                    <div className="min-w-0 flex-1">
                      <h2 className="text-[16px] font-black tracking-[-0.015em]">
                        {item.title}
                      </h2>

                      <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>

                    <span className="shrink-0 text-[25px] font-light text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary">
                      ›
                    </span>
                  </a>
                ),
              )}

              <a
                href="/creator-delete-account"
                className="group flex min-h-[102px] items-center gap-4 border-t border-border px-5 py-4 transition hover:bg-red-50/50 sm:px-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-red-100 bg-red-50 text-red-600">
                  <TrashIcon />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-[16px] font-black tracking-[-0.015em] text-red-700">
                    Hesabı sil
                  </h2>

                  <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                    Hesap silme talebi
                    oluştur ve verilerini
                    yönet.
                  </p>
                </div>

                <span className="shrink-0 text-[25px] font-light text-red-500 transition group-hover:translate-x-1">
                  ›
                </span>
              </a>
            </section>

            <aside className="space-y-5">
              <section className="rounded-[26px] border border-border bg-white p-6 shadow-[0_18px_50px_rgba(18,10,40,0.04)]">
                <div className="flex items-start gap-4">
                  <CreatorAvatar
                    avatarUrl={
                      profile?.avatarUrl
                    }
                    displayName={
                      profile?.displayName
                    }
                    username={
                      profile?.username
                    }
                    avatarStyle={
                      profile?.avatarStyle
                    }
                    avatarBg={
                      profile?.avatarBg
                    }
                    avatarZoom={
                      profile?.avatarZoom
                    }
                    avatarX={
                      profile?.avatarX
                    }
                    avatarY={
                      profile?.avatarY
                    }
                    avatarFrame={
                      profile?.avatarFrame
                    }
                    size={88}
                  />

                  <div className="min-w-0 pt-1">
                    <h2 className="truncate text-[20px] font-black tracking-[-0.03em]">
                      {profile?.displayName ??
                        "AQRYO kullanıcısı"}
                    </h2>

                    {profile?.username ? (
                      <p className="mt-1 text-[13px] font-semibold text-muted-foreground">
                        @{profile.username}
                      </p>
                    ) : null}

                    <p className="mt-3 text-[13px] leading-5 text-muted-foreground">
                      {profile?.bio ||
                        "Profilini tamamlayarak AQRYO'daki görünümünü kişiselleştirebilirsin."}
                    </p>
                  </div>
                </div>

                <a
                  href="/creator-profile"
                  className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full border border-primary/15 bg-primary/[0.045] px-4 text-[13px] font-black text-primary transition hover:bg-primary/[0.08]"
                >
                  Profili düzenle
                </a>
              </section>

              <section className="rounded-[26px] border border-border bg-white p-6 shadow-[0_18px_50px_rgba(18,10,40,0.04)]">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-[17px] font-black tracking-[-0.02em]">
                    Son hareketler
                  </h2>

                  <span className="text-[12px] font-bold text-primary">
                    Hesap özeti
                  </span>
                </div>

                {activities.length === 0 ? (
                  <div className="mt-5 rounded-[18px] bg-background p-5">
                    <p className="text-[13px] font-bold">
                      Henüz hareket yok.
                    </p>

                    <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                      Gerçek hesap hareketlerin
                      oldukça burada görünecek.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {activities.map(
                      (activity) => (
                        <div
                          key={activity.id}
                          className="flex gap-3 rounded-[18px] bg-background p-4"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-primary/[0.07] text-primary">
                            <ActivityIcon
                              kind={
                                activity.kind
                              }
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-black">
                              {
                                activity.title
                              }
                            </p>

                            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                              {
                                activity.detail
                              }
                            </p>

                            <p className="mt-2 text-[10px] font-semibold text-muted-foreground/80">
                              {formatDate(
                                activity.createdAt,
                              )}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </section>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function AccountIcon({
  type,
}: {
  type:
    | "profile"
    | "purchase"
    | "gift"
    | "heart"
    | "privacy"
    | "security"
    | "legal";
}) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-primary/10 bg-primary/[0.055] text-primary">
      {type === "profile" ? (
        <UserIcon />
      ) : type === "purchase" ? (
        <BagIcon />
      ) : type === "gift" ? (
        <GiftIcon />
      ) : type === "heart" ? (
        <HeartIcon />
      ) : type === "privacy" ? (
        <ShieldIcon />
      ) : type === "security" ? (
        <LockIcon />
      ) : (
        <DocumentIcon />
      )}
    </div>
  );
}

function ActivityIcon({
  kind,
}: {
  kind: ActivityItem["kind"];
}) {
  if (kind === "gift") {
    return <GiftIcon />;
  }

  if (kind === "purchase") {
    return <BagIcon />;
  }

  return <UserIcon />;
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.6-4 3-6 7-6s6.4 2 7 6" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 10h16v10H4z" />
      <path d="M3 7h18v3H3z" />
      <path d="M12 7v13" />
      <path d="M12 7H8.5A2.5 2.5 0 1 1 11 4.5V7Zm0 0h3.5A2.5 2.5 0 1 0 13 4.5V7Z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20.5 5.5c-2-2-5.2-2-7.2 0L12 6.8l-1.3-1.3c-2-2-5.2-2-7.2 0s-2 5.2 0 7.2L12 21l8.5-8.3c2-2 2-5.2 0-7.2Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 3 19 6v5c0 4.6-2.7 8-7 10-4.3-2-7-5.4-7-10V6l7-3Z" />
      <path d="M9.5 12 11 13.5l3.8-4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v5h5" />
      <path d="M10 13h5M10 17h5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
    </svg>
  );
}

function formatDate(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}