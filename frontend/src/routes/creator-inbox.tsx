import { createAnonymousMessageCard } from "@/lib/anonymousMessageCard";
import { useImageShare } from "@/components/ImageShareDialog";
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
  const { openImageShare, imageShareDialog } = useImageShare();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InboxItem[]>([]);
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const { locale } = useAqryoLocale();

  const isTr = locale === "tr";
  const isDe = locale === "de";
  const ui = isTr ? inboxCopy.tr : isDe ? inboxCopy.de : inboxCopy.en;

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
              : ui.loadError,
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

  async function createAnswerCard(item: InboxItem) {
    return createAnonymousMessageCard(item.message, item.mode, item.id, locale);
  }

  async function shareAnswer(item: InboxItem) {
    if (sharingId) return;

    try {
      setSharingId(item.id);
      const file = await createAnswerCard(item);

      openImageShare(file, "");
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
      {imageShareDialog}
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
              {ui.product}
            </p>
            <h1 className="mt-2 text-[36px] font-black tracking-[-0.055em] sm:text-[48px]">
              {ui.title}
            </h1>
            <p className="mt-3 max-w-[650px] text-[16px] font-medium leading-7 text-muted-foreground">
              {ui.intro}
            </p>
          </div>

          <Link
            to="/question-confession-builder"
            className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-[14px] font-black text-white"
          >
            {ui.createLink} +
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:max-w-[430px]">
          <StatCard label={ui.questions} value={questionCount} />
          <StatCard label={ui.confessions} value={confessionCount} />
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
            {ui.all} · {items.length}
          </FilterButton>
          <FilterButton active={filter === "question"} onClick={() => setFilter("question")}>
            {ui.questions} · {questionCount}
          </FilterButton>
          <FilterButton active={filter === "confession"} onClick={() => setFilter("confession")}>
            {ui.confessions} · {confessionCount}
          </FilterButton>
        </div>

        {error ? (
          <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 p-5">
            <p className="text-[14px] font-black text-rose-800">
              {ui.openError}
            </p>
            <p className="mt-2 text-[14px] leading-6 text-rose-700">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasExperiences={items.length > 0} copy={ui} />
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

                <div className="mt-6">
                  <button
                    type="button"
                    disabled={sharingId === item.id}
                    onClick={() => void shareAnswer(item)}
                    className="h-12 w-full rounded-full bg-black px-5 text-[14px] font-black text-white disabled:opacity-50"
                  >
                    {sharingId === item.id
                      ? isTr ? "Hazırlanıyor..." : "Preparing..."
                      : isTr ? "Cevabı paylaş →" : "Share answer →"}
                  </button>

                  <p className="mt-2 text-center text-[11px] font-bold text-muted-foreground">
                    {isTr
                      ? "Sadece görsel paylaşılır · link ve hazır metin eklenmez"
                      : "Image only · no link or preset text is added"}
                  </p>

                  <button
                    type="button"
                    onClick={() => void copyMessage(item)}
                    className="mt-3 h-10 w-full rounded-full border border-border bg-white px-4 text-[12px] font-black"
                  >
                    {copiedId === item.id ? "✓" : isTr ? "Mesajı kopyala" : "Copy message"}
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

function EmptyState({ hasExperiences, copy }: { hasExperiences: boolean; copy: { [Key in keyof typeof inboxCopy.en]: string } }) {
  return (
    <div className="mt-5 rounded-[30px] border border-dashed border-violet-200 bg-white px-5 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-[24px]">
        ?
      </div>
      <h2 className="mt-5 text-[24px] font-black tracking-[-0.04em]">
        {hasExperiences ? copy.emptyFilter : copy.empty}
      </h2>
      <p className="mx-auto mt-3 max-w-[440px] text-[14px] leading-6 text-muted-foreground">
        {copy.emptyDesc}
      </p>
      <Link
        to="/question-confession-builder"
        className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-violet-600 px-6 text-[14px] font-black text-white"
      >
        {copy.createLink} →
      </Link>
    </div>
  );
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

const inboxCopy = {
  tr: { product:"Soru mu İtiraf mı?", title:"Anonim Gelen Kutusu", intro:"Takipçilerin sana anonim soru veya itiraf bırakır. İstediğini seç, cevabı görsel olarak paylaş.", createLink:"Anonim link oluştur", questions:"Sorular", confessions:"İtiraflar", all:"Tümü", openError:"Gelen kutusu açılamadı", loadError:"Mesajlar yüklenemedi.", emptyFilter:"Bu filtrede mesaj yok.", empty:"Henüz anonim mesaj yok.", emptyDesc:"Anonim linkini paylaş. İlk soru veya itiraf geldiğinde burada görünecek." },
  en: { product:"Question or Confession?", title:"Anonymous Inbox", intro:"Followers can leave anonymous questions or confessions. Pick one and share your answer as an image.", createLink:"Create anonymous link", questions:"Questions", confessions:"Confessions", all:"All", openError:"Inbox could not be opened", loadError:"Messages could not be loaded.", emptyFilter:"No messages in this filter.", empty:"No anonymous messages yet.", emptyDesc:"Share your anonymous link. New questions and confessions will appear here." },
  de: { product:"Frage oder Geständnis?", title:"Anonymer Posteingang", intro:"Deine Follower können dir anonyme Fragen oder Geständnisse schicken. Wähle eine Nachricht aus und teile deine Antwort als Bild.", createLink:"Anonymen Link erstellen", questions:"Fragen", confessions:"Geständnisse", all:"Alle", openError:"Posteingang konnte nicht geöffnet werden", loadError:"Nachrichten konnten nicht geladen werden.", emptyFilter:"Keine Nachrichten in diesem Filter.", empty:"Noch keine anonymen Nachrichten.", emptyDesc:"Teile deinen anonymen Link. Neue Fragen und Geständnisse erscheinen hier." }
} as const;
