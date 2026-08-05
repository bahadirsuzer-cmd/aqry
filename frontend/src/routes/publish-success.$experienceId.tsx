import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getExperienceStats,
  type ExperienceStats,
} from "@/services/experienceStats";
import {
  getCurrentCreator,
  signOutCreator,
} from "@/services/auth";
import { supabase } from "@/services/supabase"; 
import { CreatorNavigation } from "@/components/CreatorNavigation";
import {
  downloadShareCard,
  type ShareCardSource,
  type ShareTestMode,
} from "@/services/shareCards";
import {
  ensureExperienceShareAssets,
  getPublicShareUrl,
} from "@/services/shareAssets";

interface PublishedExperience {
  id: string;
  creatorId: string;
  title: string;
  status: string;
  type: string;
  coverImageUrl: string;
  coverLabel: string;
  testMode: ShareTestMode;
}

export const Route = createFileRoute(
  "/publish-success/$experienceId",
)({
  component: PublishSuccessPage,
});

function PublishSuccessPage() {
  const navigate = useNavigate();
  const { experienceId } = Route.useParams();

  const [experience, setExperience] =
    useState<PublishedExperience | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [
    shareAssetsReady,
    setShareAssetsReady,
  ] = useState(false);

  const [
    shareAssetsLoading,
    setShareAssetsLoading,
  ] = useState(false);

  const [
    shareAssetsError,
    setShareAssetsError,
  ] = useState<string | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [
    generatingShare,
    setGeneratingShare,
  ] = useState<
    "square" | "story" | null
  >(null);

const [stats, setStats] =
  useState<ExperienceStats | null>(null);

const [statsLoading, setStatsLoading] =
  useState(true);
  const [accessChecked, setAccessChecked] =
  useState(false);
  useEffect(() => {
    let cancelled = false;

    async function loadExperience() {
      try {
        setLoaded(false);

        const { data, error } =
          await supabase
            .from("experiences")
            .select(
              `
                id,
                creator_id,
                title,
                status,
                type,
                cover_image_url,
                cover_label,
                content
              `,
            )
            .eq("id", experienceId)
            .maybeSingle();

        if (error) {
          throw new Error(
            error.message,
          );
        }

        if (cancelled) {
          return;
        }

        if (!data) {
          setExperience(null);
          return;
        }

        const content =
          data.content as
            | {
                testMode?:
                  | "score"
                  | "profile"
                  | "spectrum"
                  | "archetype";
                blueprint?: {
                  test?: {
                    strategy?:
                      | "score"
                      | "spectrum"
                      | "archetype";
                  };
                } | null;
              }
            | null;

        const rawMode =
          content?.testMode ??
          content?.blueprint
            ?.test
            ?.strategy ??
          null;

        setExperience({
          id: data.id,
          creatorId:
            data.creator_id,
          title: data.title,
          status: data.status,
          type: data.type,
          coverImageUrl:
            data.cover_image_url ?? "",
          coverLabel:
            data.cover_label ?? "",
          testMode:
            rawMode === "score" ||
            rawMode ===
              "profile" ||
            rawMode ===
              "spectrum" ||
            rawMode ===
              "archetype"
              ? rawMode
              : null,
        });
      } catch (error) {
        console.error(
          "Yayınlanan Experience yüklenemedi:",
          error,
        );

        if (!cancelled) {
          setExperience(null);
        }
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    }

    void loadExperience();

    return () => {
      cancelled = true;
    };
  }, [experienceId]);

useEffect(() => {
  if (!experience) {
    setShareAssetsReady(false);
    return;
  }

  const currentExperience =
    experience;

  let cancelled = false;

  async function prepareShareAssets() {
    const source:
      ShareCardSource = {
      id:
        currentExperience.id,
      title:
        currentExperience.title,
      type:
        currentExperience.type,
      coverImageUrl:
        currentExperience.coverImageUrl,
      coverLabel:
        currentExperience.coverLabel,
      testMode:
        currentExperience.testMode,
    };

    try {
      setShareAssetsLoading(
        true,
      );
      setShareAssetsError(
        null,
      );

      await ensureExperienceShareAssets(
        currentExperience.creatorId,
        source,
      );

      if (!cancelled) {
        setShareAssetsReady(
          true,
        );
      }
    } catch (error) {
      console.error(
        "AQRYO paylaşım kartları hazırlanamadı:",
        error,
      );

      if (!cancelled) {
        setShareAssetsReady(
          false,
        );

        setShareAssetsError(
          error instanceof Error
            ? error.message
            : "Paylaşım kartları hazırlanamadı.",
        );
      }
    } finally {
      if (!cancelled) {
        setShareAssetsLoading(
          false,
        );
      }
    }
  }

  void prepareShareAssets();

  return () => {
    cancelled = true;
  };
}, [experience]);

useEffect(() => {
  let cancelled = false;

  async function loadStats() {
    try {
      setStatsLoading(true);

      const experienceStats =
        await getExperienceStats(experienceId);

      if (!cancelled) {
        setStats(experienceStats);
      }
    } catch (error) {
      console.error(
        "İstatistikler yüklenemedi:",
        error,
      );

      if (!cancelled) {
        setStats({
  totalViews: 0,
  totalStarts: 0,
  totalCompletions: 0,
  highestScore: 0,
  averageScore: 0,
  latestCompletionAt: null,
});
      }
    } finally {
      if (!cancelled) {
        setStatsLoading(false);
      }
    }
  }

  void loadStats();

  return () => {
    cancelled = true;
  };
}, [experienceId]);
useEffect(() => {
  let cancelled = false;

  async function protectPublishSuccess() {
    const creator = await getCurrentCreator();

    if (!creator) {
      window.location.href = "/creator-auth";
      return;
    }

    const { data, error } = await supabase
      .from("experiences")
      .select("creator_id")
      .eq("id", experienceId)
      .single();

    if (cancelled) {
      return;
    }

    if (error || !data) {
      window.location.href = "/creator-dashboard";
      return;
    }

    if (data.creator_id !== creator.id) {
      window.location.href = "/creator-dashboard";
      return;
    }

    setAccessChecked(true);
  }

  void protectPublishSuccess();

  return () => {
    cancelled = true;
  };
}, [experienceId]);
  const experienceUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/experience/${experienceId}`;

  const publicShareUrl =
    typeof window === "undefined"
      ? ""
      : getPublicShareUrl(
          experienceId,
        );

  async function copyExperienceLink() {
    try {
      await navigator.clipboard.writeText(
        shareAssetsReady
          ? publicShareUrl
          : experienceUrl,
      );
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      window.alert("Bağlantı kopyalanamadı.");
    }
  }

  function getShareSource():
    ShareCardSource | null {
    if (!experience) {
      return null;
    }

    return {
      id:
        experience.id,
      title:
        experience.title,
      type:
        experience.type,
      coverImageUrl:
        experience.coverImageUrl,
      coverLabel:
        experience.coverLabel,
      testMode:
        experience.testMode,
    };
  }

  async function downloadSocialCard(
    format:
      | "square"
      | "story",
  ) {
    const source =
      getShareSource();

    if (!source) {
      return;
    }

    try {
      setGeneratingShare(
        format,
      );

      await downloadShareCard(
        source,
        format,
      );
    } catch (error) {
      console.error(
        "Paylaşım görseli oluşturulamadı:",
        error,
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Paylaşım görseli oluşturulamadı.",
      );
    } finally {
      setGeneratingShare(
        null,
      );
    }
  }

  function shareOnX() {
    if (!experience) {
      return;
    }

    if (
      !shareAssetsReady
    ) {
      window.alert(
        shareAssetsError ??
          "Paylaşım kartı henüz hazırlanıyor. Birkaç saniye sonra tekrar dene.",
      );
      return;
    }

    const publicShareUrl =
      getPublicShareUrl(
        experience.id,
      );

    const shareText =
      experience.type ===
        "guess"
        ? `${experience.title}\n\nSence cevabı ne? 👀`
        : experience.type ===
            "story"
          ? `${experience.title}\n\nDevamında ne olduğunu gör 👀`
          : experience.type ===
              "compatibility"
            ? `${experience.title}\n\nNe kadar yakınsınız?`
            : `${experience.title}\n\nSenin sonucun ne çıkacak?`;

    const shareUrl =
      new URL(
        "https://twitter.com/intent/tweet",
      );

    shareUrl.searchParams.set(
      "text",
      shareText,
    );

    shareUrl.searchParams.set(
      "url",
      publicShareUrl,
    );

    window.open(
      shareUrl.toString(),
      "_blank",
      "noopener,noreferrer",
    );
  }

  function getShareText() {
    if (!experience) {
      return "";
    }

    return experience.type === "guess"
      ? `${experience.title}\n\nSence cevabı ne? 👀`
      : experience.type === "story"
        ? `${experience.title}\n\nDevamında ne olduğunu gör 👀`
        : experience.type === "compatibility"
          ? `${experience.title}\n\nNe kadar yakınsınız?`
          : `${experience.title}\n\nSenin sonucun ne çıkacak?`;
  }

  function shareOnWhatsApp() {
    if (!experience) {
      return;
    }

    const url =
      shareAssetsReady
        ? publicShareUrl
        : experienceUrl;

    const shareUrl = new URL(
      "https://wa.me/",
    );

    shareUrl.searchParams.set(
      "text",
      `${getShareText()}\n\n${url}`,
    );

    window.open(
      shareUrl.toString(),
      "_blank",
      "noopener,noreferrer",
    );
  }

  function shareOnTelegram() {
    if (!experience) {
      return;
    }

    const url =
      shareAssetsReady
        ? publicShareUrl
        : experienceUrl;

    const shareUrl = new URL(
      "https://t.me/share/url",
    );

    shareUrl.searchParams.set(
      "url",
      url,
    );

    shareUrl.searchParams.set(
      "text",
      getShareText(),
    );

    window.open(
      shareUrl.toString(),
      "_blank",
      "noopener,noreferrer",
    );
  }

  const qrTargetUrl =
    shareAssetsReady
      ? publicShareUrl
      : experienceUrl;

  const qrImageUrl =
    qrTargetUrl
      ? `https://quickchart.io/qr?size=240&margin=2&text=${encodeURIComponent(
          qrTargetUrl,
        )}`
      : "";

  function openExperience() {
    navigate({
      to: "/experience/$experienceId",
      params: {
        experienceId,
      },
    });
  }

  function openCreatorExperiences() {
    navigate({
      to: "/creator-experiences",
    });
  }

  function returnToBuilder() {
    if (
      experience?.type ===
      "test"
    ) {
      navigate({
        to: "/test-builder",
      });
      return;
    }

    if (
      experience?.type ===
      "guess"
    ) {
      navigate({
        to: "/guess-builder",
      });
      return;
    }

    if (
      experience?.type ===
      "story"
    ) {
      navigate({
        to: "/story-builder",
      });
      return;
    }

    navigate({
      to: "/compatibility-builder",
    });
  }

  if (!loaded || !accessChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8fb]">
        <p className="text-sm font-bold text-muted-foreground">
          AQRYO yükleniyor...
        </p>
      </main>
    );
  }

  if (!experience) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8fb] px-5">
        <section className="w-full max-w-md rounded-[30px] border border-border bg-white p-7 text-center shadow-[0_24px_70px_rgba(35,16,55,0.13)]">
          <span className="text-3xl font-black tracking-[-0.06em] text-primary">
            AQRYO.
          </span>

          <h1 className="mt-8 text-2xl font-black">
            Experience bulunamadı
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Yayınlanan Experience veritabanında bulunamadı.
          </p>

          <button
            type="button"
            onClick={returnToBuilder}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-black text-sm font-bold text-white transition hover:bg-primary"
          >
            Builder’a dön
          </button>
        </section>
      </main>
    );
  }

  return (
  <div className="min-h-screen bg-[#faf8fb]">
    <CreatorNavigation
      onSignOut={async () => {
        await signOutCreator();

        window.location.href =
          "/creator-auth";
      }}
    />

    <div className="border-b border-border bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.14em] text-primary">
            Yayın sonucu
          </p>

          <p className="mt-0.5 text-[11px] font-bold">
            {experience.title}
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-bold text-emerald-600">
          Yayında
        </span>
      </div>
    </div>
      <div className="mx-auto flex max-w-6xl justify-center px-4 py-4">
        <article className="w-full max-w-md overflow-hidden rounded-[32px] border border-border bg-white shadow-[0_24px_70px_rgba(35,16,55,0.13)]">
          <div className="bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 px-6 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">
              Yayın başarılı
            </p>

            <div className="mt-8 flex items-center gap-3">
  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-2xl font-black text-white">
    ✓
  </span>

  <h1 className="text-4xl font-black tracking-[-0.05em]">
    AQRYO’n yayında
  </h1>
</div>

            <p className="mt-2 text-xs leading-5 text-white/85">
              Experience bağlantın hazır. Şimdi paylaşarak
              katılımcılarını davet edebilirsin.
            </p>
          </div>

          <div className="px-4 pb-3 pt-4">
            <div className="rounded-[20px] border border-border bg-background p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Experience
              </p>

              <h2 className="mt-1 text-base font-black leading-tight">
                {experience.title}
              </h2>

              <button
                type="button"
                onClick={copyExperienceLink}
                className="mt-3 flex h-11 w-full items-center justify-center rounded-full bg-primary text-xs font-bold text-white transition hover:opacity-90"
              >
                {copied
                  ? "Bağlantı kopyalandı ✓"
                  : "Bağlantıyı kopyala"}
              </button>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                disabled={
                  shareAssetsLoading ||
                  !shareAssetsReady
                }
                onClick={shareOnX}
                className="flex h-11 items-center justify-center rounded-full bg-black text-xs font-bold text-white transition hover:bg-primary disabled:opacity-50"
              >
                {shareAssetsLoading
                  ? "Hazırlanıyor..."
                  : "X’te paylaş"}
              </button>

              <button
                type="button"
                onClick={shareOnWhatsApp}
                className="flex h-11 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700 transition hover:border-emerald-300"
              >
                WhatsApp
              </button>

              <button
                type="button"
                onClick={shareOnTelegram}
                className="flex h-11 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-xs font-bold text-sky-700 transition hover:border-sky-300"
              >
                Telegram
              </button>
            </div>

{shareAssetsError ? (
  <p className="mt-2 text-center text-[9px] font-bold text-red-500">
    {shareAssetsError}
  </p>
) : null}

<div className="mt-3 rounded-[20px] border border-border bg-background p-4">
  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-primary">
        Paylaşım görselleri
      </p>

      <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
        Başlık, Experience türü ve kapak görselinden otomatik hazırlanır.
      </p>
    </div>

    <span className="rounded-full bg-white px-2.5 py-1 text-[8px] font-black text-muted-foreground">
      AQRYO
    </span>
  </div>

  <div className="mt-3 grid grid-cols-2 gap-2">
    <button
      type="button"
      disabled={
        generatingShare !==
        null
      }
      onClick={() => {
        void downloadSocialCard(
          "square",
        );
      }}
      className="rounded-[16px] border border-border bg-white px-3 py-3 text-left transition hover:border-primary/30 disabled:opacity-50"
    >
      <span className="block text-[9px] font-black">
        Kare · 1:1
      </span>

      <span className="mt-1 block text-[8px] leading-4 text-muted-foreground">
        X · Instagram · Facebook
      </span>

      <span className="mt-2 block text-[9px] font-black text-primary">
        {generatingShare ===
        "square"
          ? "Hazırlanıyor..."
          : "PNG indir ↓"}
      </span>
    </button>

    <button
      type="button"
      disabled={
        generatingShare !==
        null
      }
      onClick={() => {
        void downloadSocialCard(
          "story",
        );
      }}
      className="rounded-[16px] border border-border bg-white px-3 py-3 text-left transition hover:border-primary/30 disabled:opacity-50"
    >
      <span className="block text-[9px] font-black">
        Dikey · 9:16
      </span>

      <span className="mt-1 block text-[8px] leading-4 text-muted-foreground">
        Story · TikTok · WhatsApp
      </span>

      <span className="mt-2 block text-[9px] font-black text-primary">
        {generatingShare ===
        "story"
          ? "Hazırlanıyor..."
          : "PNG indir ↓"}
      </span>
    </button>
  </div>
</div>

<div className="mt-3 rounded-[20px] border border-border bg-background p-4">
  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_150px] sm:items-center">
    <div>
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-primary">
        QR kod
      </p>

      <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
        Experience bağlantını afişte, masada, ekranda veya fiziksel bir materyalde kullan.
      </p>

      <a
        href={qrImageUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex h-9 items-center justify-center rounded-full border border-border bg-white px-4 text-[9px] font-black transition hover:border-primary hover:text-primary"
      >
        QR’ı aç ↗
      </a>
    </div>

    <div className="mx-auto flex h-[140px] w-[140px] items-center justify-center rounded-[16px] border border-border bg-white p-2">
      <img
        src={qrImageUrl}
        alt="Experience QR kodu"
        className="h-full w-full object-contain"
      />
    </div>
  </div>
</div>

<div className="mt-3 grid grid-cols-3 gap-2">
  <div className="rounded-[16px] border border-border bg-background px-2 py-3 text-center">
    <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
      Görüntüleme
    </p>

    <p className="mt-1 text-lg font-black">
      {statsLoading
        ? "..."
        : stats?.totalViews ?? 0}
    </p>
  </div>

  <div className="rounded-[16px] border border-border bg-background px-2 py-3 text-center">
    <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
      Başlatma
    </p>

    <p className="mt-1 text-lg font-black">
      {statsLoading
        ? "..."
        : stats?.totalStarts ?? 0}
    </p>
  </div>

  <div className="rounded-[16px] border border-border bg-background px-2 py-3 text-center">
    <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
      Tamamlama
    </p>

    <p className="mt-1 text-lg font-black">
      {statsLoading
        ? "..."
        : stats?.totalCompletions ?? 0}
    </p>
  </div>
</div>

<div className="mt-3 grid gap-2 sm:grid-cols-2">
  <button
    type="button"
    onClick={openExperience}
    className="flex h-10 w-full items-center justify-center rounded-full border border-border bg-white text-xs font-bold transition hover:bg-muted"
  >
    Experience’ı görüntüle
  </button>

  <button
    type="button"
    onClick={openCreatorExperiences}
    className="flex h-10 w-full items-center justify-center rounded-full bg-black text-xs font-bold text-white transition hover:bg-primary"
  >
    Experience’larıma git
  </button>
</div>

            <button
              type="button"
              onClick={returnToBuilder}
              className="mx-auto mt-2 flex h-8 w-[64%] items-center justify-center rounded-full text-[10px] font-bold text-muted-foreground transition hover:bg-muted"
            >
              Düzenlemeye dön
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}