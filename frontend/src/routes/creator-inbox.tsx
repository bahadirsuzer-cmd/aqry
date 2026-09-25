import { CreatorNavigation } from "@/components/CreatorNavigation";
import { getCurrentCreator, signOutCreator } from "@/services/auth";
import {
  loadAnonymousInbox,
  markAnonymousMessagesRead,
  type AnonymousInboxItem,
} from "@/services/anonymousInbox";
import { useAqryoLocale } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/creator-inbox")({
  component: CreatorInboxPage,
});

type InboxFilter = "all" | "question" | "confession";
type InboxItem = AnonymousInboxItem;

function CreatorInboxPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InboxItem[]>([]);
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const { locale } = useAqryoLocale();

  const isTr = locale === "tr";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const creator = await getCurrentCreator();
        if (!creator) {
          window.location.href = "/creator-auth";
          return;
        }

        const parsed = await loadAnonymousInbox(creator.id);

        if (!cancelled) {
          setItems(parsed);
          markAnonymousMessagesRead(parsed.map((item) => item.id));
        }
      } catch (loadError) {
        console.error("Anonim gelen kutusu yüklenemedi:", loadError);
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : isTr
                ? "Mesajlar yüklenemedi."
                : "Messages could not be loaded.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isTr]);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? items
        : items.filter((item) => item.mode === filter),
    [filter, items],
  );

  const questionCount = items.filter((item) => item.mode === "question").length;
  const confessionCount = items.filter((item) => item.mode === "confession").length;

  async function copyMessage(item: InboxItem) {
    await navigator.clipboard.writeText(item.message);
    setCopiedId(item.id);
    window.setTimeout(() => setCopiedId(null), 1200);
  }

  function wrapText(
    context: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ) {
    const words = text.replace(/\s+/g, " ").trim().split(" ");
    const lines: string[] = [];
    let line = "";

    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (context.measureText(test).width <= maxWidth) {
        line = test;
        continue;
      }
      if (line) lines.push(line);
      line = word;
    }

    if (line) lines.push(line);
    return lines;
  }

  async function createAnswerCard(item: InboxItem) {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 900;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Paylaşım kartı oluşturulamadı.");

    const gradient = context.createLinearGradient(0, 0, 1200, 260);
    if (item.mode === "question") {
      gradient.addColorStop(0, "#6d28d9");
      gradient.addColorStop(0.55, "#8b5cf6");
      gradient.addColorStop(1, "#36d7c4");
    } else {
      gradient.addColorStop(0, "#7c3aed");
      gradient.addColorStop(0.55, "#ec4899");
      gradient.addColorStop(1, "#fb7185");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, 240);

    context.fillStyle = "rgba(255,255,255,0.16)";
    context.beginPath();
    context.arc(1080, 35, 170, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#ffffff";
    context.font = "900 68px Arial, sans-serif";
    context.textAlign = "center";
    context.fillText(
      item.mode === "question"
        ? isTr
          ? "Bana anonim bir soru sor"
          : "Ask me anonymously"
        : isTr
          ? "Bana anonim bir itiraf bırak"
          : "Leave an anonymous confession",
      600,
      112,
    );

    context.font = "800 34px Arial, sans-serif";
    context.fillStyle = "rgba(255,255,255,0.9)";
    context.fillText(
      isTr ? "Soru mu İtiraf mı? · AQRYO" : "Question or Confession? · AQRYO",
      600,
      178,
    );

    const badgeText =
      item.mode === "question"
        ? isTr ? "SORU" : "QUESTION"
        : isTr ? "İTİRAF" : "CONFESSION";

    context.font = "900 30px Arial, sans-serif";
    const badgeWidth = context.measureText(badgeText).width + 68;
    roundedRect(context, 92, 300, badgeWidth, 62, 27);
    context.fillStyle = item.mode === "question" ? "#ede9fe" : "#ffe4e6";
    context.fill();

    context.fillStyle = item.mode === "question" ? "#6d28d9" : "#e11d48";
    context.textAlign = "left";
    context.fillText(badgeText, 126, 342);

    const cleanMessage = item.message.trim();
    let fontSize = 66;
    if (cleanMessage.length > 180) fontSize = 50;
    else if (cleanMessage.length > 110) fontSize = 56;

    context.fillStyle = "#17101f";
    context.font = `900 ${fontSize}px Arial, sans-serif`;
    const lines = wrapText(context, cleanMessage, 1016);
    const lineHeight = fontSize * 1.22;
    const visibleLines = lines.slice(0, 7);

    if (lines.length > 7) {
      const last = visibleLines[6];
      visibleLines[6] = last.length > 3 ? `${last.slice(0, -3)}...` : `${last}...`;
    }

    visibleLines.forEach((line, index) => {
      context.fillText(line, 92, 425 + index * lineHeight);
    });

    roundedRect(context, 82, 790, 1036, 74, 26);
    context.fillStyle = "#f4f0fb";
    context.fill();

    context.fillStyle = "#6b6475";
    context.font = "800 30px Arial, sans-serif";
    context.textAlign = "left";
    context.fillText(
      isTr ? "Anonim mesajlar için aqryo.com" : "Anonymous messages at aqryo.com",
      112,
      838,
    );

    context.fillStyle = "#4f2a84";
    context.font = "900 42px Arial, sans-serif";
    context.textAlign = "right";
    context.fillText("AQRYO", 1083, 841);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result
            ? resolve(result)
            : reject(new Error("PNG oluşturulamadı.")),
        "image/png",
        0.96,
      );
    });

    return new File([blob], `aqryo-${item.mode}-${item.id}.png`, {
      type: "image/png",
    });
  }

  async function answerOnX(item: InboxItem) {
    if (sharingId) return;

    try {
      setSharingId(item.id);
      const file = await createAnswerCard(item);

      if (
        navigator.share &&
        (!navigator.canShare || navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          files: [file],
          title: "AQRYO",
          text: isTr ? "Cevabım:" : "My answer:",
        });
        return;
      }

      const fileUrl = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = fileUrl;
      anchor.download = file.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(fileUrl);

      const url = new URL("https://twitter.com/intent/tweet");
      url.searchParams.set("text", isTr ? "Cevabım:" : "My answer:");
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") return;
      console.error("AQRYO cevap kartı paylaşılamadı:", shareError);
      window.alert(
        shareError instanceof Error
          ? shareError.message
          : isTr
            ? "Paylaşım kartı hazırlanamadı."
            : "Share card could not be prepared.",
      );
    } finally {
      setSharingId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f5fb]">
        <CreatorNavigation
          onSignOut={async () => {
            await signOutCreator();
            window.location.href = "/creator-auth";
          }}
        />
        <div className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6">
          <div className="h-[320px] animate-pulse rounded-[30px] bg-white" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5fb] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href = "/creator-auth";
        }}
      />

      <section className="mx-auto max-w-[1120px] px-4 pb-16 pt-8 sm:px-6 sm:pt-11">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.18em] text-primary">
              {isTr ? "Soru mu İtiraf mı?" : "Question or Confession?"}
            </p>
            <h1 className="mt-2 text-[36px] font-black tracking-[-0.055em] sm:text-[48px]">
              {isTr ? "Anonim Gelen Kutusu" : "Anonymous Inbox"}
            </h1>
            <p className="mt-3 max-w-[650px] text-[16px] font-medium leading-7 text-muted-foreground">
              {isTr
                ? "Takipçilerin sana anonim soru veya itiraf bırakır. İstediğini seç, X’te cevapla."
                : "Followers leave anonymous questions or confessions. Pick one and answer it on X."}
            </p>
          </div>

          <Link
            to="/question-confession-builder"
            className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-[14px] font-black text-white"
          >
            {isTr ? "Anonim link oluştur +" : "Create anonymous link +"}
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:max-w-[430px]">
          <StatCard label={isTr ? "Sorular" : "Questions"} value={questionCount} />
          <StatCard label={isTr ? "İtiraflar" : "Confessions"} value={confessionCount} />
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
            {isTr ? "Tümü" : "All"} · {items.length}
          </FilterButton>
          <FilterButton active={filter === "question"} onClick={() => setFilter("question")}>
            {isTr ? "Sorular" : "Questions"} · {questionCount}
          </FilterButton>
          <FilterButton active={filter === "confession"} onClick={() => setFilter("confession")}>
            {isTr ? "İtiraflar" : "Confessions"} · {confessionCount}
          </FilterButton>
        </div>

        {error ? (
          <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 p-5">
            <p className="text-[14px] font-black text-rose-800">
              {isTr ? "Gelen kutusu açılamadı" : "Inbox could not be opened"}
            </p>
            <p className="mt-2 text-[14px] leading-6 text-rose-700">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasExperiences={items.length > 0} isTr={isTr} />
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="rounded-[28px] border border-border bg-white p-5 shadow-[0_16px_45px_rgba(33,21,53,0.05)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-[12px] font-black ${
                        item.mode === "question"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {item.mode === "question"
                        ? isTr ? "SORU" : "QUESTION"
                        : isTr ? "İTİRAF" : "CONFESSION"}
                    </span>
                    <p className="mt-2 text-[13px] font-bold text-muted-foreground">
                      {item.experienceTitle}
                    </p>
                  </div>

                  <time className="text-[12px] font-bold text-muted-foreground">
                    {formatTime(item.createdAt, locale)}
                  </time>
                </div>

                <p className="mt-5 whitespace-pre-wrap text-[22px] font-black leading-8 tracking-[-0.03em]">
                  {item.message}
                </p>

                <div className="mt-6 flex gap-2">
                  <button
                    type="button"
                    disabled={sharingId === item.id}
                    onClick={() => void answerOnX(item)}
                    className="h-12 flex-1 rounded-full bg-black px-5 text-[14px] font-black text-white disabled:opacity-50"
                  >
                    {sharingId === item.id
                      ? isTr ? "Kart hazırlanıyor..." : "Preparing..."
                      : isTr ? "X’te cevapla →" : "Answer on X →"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyMessage(item)}
                    className="h-12 rounded-full border border-border bg-white px-4 text-[14px] font-black"
                  >
                    {copiedId === item.id ? "✓" : isTr ? "Kopyala" : "Copy"}
                  </button>
                </div>

                <p className="mt-3 text-[13px] font-semibold leading-5 text-muted-foreground">
                  {isTr
                    ? "Gönderenin kimliği creator’a gösterilmez."
                    : "The sender’s identity is never shown to the creator."}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[22px] border border-border bg-white p-5">
      <p className="text-[12px] font-black uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-[32px] font-black tracking-[-0.05em]">{value}</p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 shrink-0 rounded-full px-4 text-[14px] font-black transition ${
        active
          ? "bg-primary text-white"
          : "border border-border bg-white text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({
  hasExperiences,
  isTr,
}: {
  hasExperiences: boolean;
  isTr: boolean;
}) {
  return (
    <div className="mt-5 rounded-[30px] border border-dashed border-violet-200 bg-white px-5 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-[24px]">
        ?
      </div>
      <h2 className="mt-5 text-[24px] font-black tracking-[-0.04em]">
        {hasExperiences
          ? isTr ? "Bu filtrede mesaj yok." : "No messages in this filter."
          : isTr ? "Henüz anonim mesaj yok." : "No anonymous messages yet."}
      </h2>
      <p className="mx-auto mt-3 max-w-[440px] text-[14px] leading-6 text-muted-foreground">
        {isTr
          ? "Anonim linkini paylaş. İlk soru veya itiraf geldiğinde burada görünecek."
          : "Share your anonymous link. New questions and confessions will appear here."}
      </p>
      <Link
        to="/question-confession-builder"
        className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-violet-600 px-6 text-[14px] font-black text-white"
      >
        {isTr ? "Anonim link oluştur →" : "Create anonymous link →"}
      </Link>
    </div>
  );
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function formatTime(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
