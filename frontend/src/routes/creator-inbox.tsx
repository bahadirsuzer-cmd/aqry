import { CreatorNavigation } from "@/components/CreatorNavigation";
import { getCurrentCreator, signOutCreator } from "@/services/auth";
import { supabase } from "@/services/supabase";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/creator-inbox")({
  component: CreatorInboxPage,
});

type InboxFilter = "all" | "question" | "confession";

type InboxItem = {
  id: string;
  experienceId: string;
  experienceTitle: string;
  mode: "question" | "confession";
  message: string;
  createdAt: string;
};

function CreatorInboxPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InboxItem[]>([]);
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

        const { data: experiences, error: experienceError } =
          await supabase
            .from("experiences")
            .select("id,title")
            .eq("creator_id", creator.id)
            .eq("type", "question_confession");

        if (experienceError) {
          throw new Error(experienceError.message);
        }

        const experienceRows = experiences ?? [];

        if (experienceRows.length === 0) {
          if (!cancelled) setItems([]);
          return;
        }

        const titleById = new Map(
          experienceRows.map((experience) => [
            experience.id,
            experience.title ?? "Soru mu İtiraf mı?",
          ]),
        );

        const { data: events, error: eventError } =
          await supabase
            .from("experience_events")
            .select("id,experience_id,event_type,metadata,created_at")
            .in(
              "experience_id",
              experienceRows.map((experience) => experience.id),
            )
            .eq("event_type", "share")
            .order("created_at", { ascending: false });

        if (eventError) {
          throw new Error(eventError.message);
        }

        const parsed = (events ?? []).flatMap((event) => {
          const metadata =
            event.metadata && typeof event.metadata === "object"
              ? (event.metadata as Record<string, unknown>)
              : null;

          if (
            metadata?.kind !== "anonymous_message" ||
            typeof metadata.message !== "string" ||
            (metadata.mode !== "question" &&
              metadata.mode !== "confession")
          ) {
            return [];
          }

          return [
            {
              id: event.id,
              experienceId: event.experience_id,
              experienceTitle:
                titleById.get(event.experience_id) ??
                "Soru mu İtiraf mı?",
              mode: metadata.mode,
              message: metadata.message,
              createdAt: event.created_at,
            } satisfies InboxItem,
          ];
        });

        if (!cancelled) setItems(parsed);
      } catch (loadError) {
        console.error("Anonim gelen kutusu yüklenemedi:", loadError);

        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Mesajlar yüklenemedi.",
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
  }, []);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? items
        : items.filter((item) => item.mode === filter),
    [filter, items],
  );

  const questionCount = items.filter(
    (item) => item.mode === "question",
  ).length;
  const confessionCount = items.filter(
    (item) => item.mode === "confession",
  ).length;

  async function copyMessage(item: InboxItem) {
    await navigator.clipboard.writeText(item.message);
    setCopiedId(item.id);
    window.setTimeout(() => setCopiedId(null), 1400);
  }

  function answerOnX(item: InboxItem) {
    const label =
      item.mode === "question"
        ? "Anonim soru"
        : "Anonim itiraf";

    const text = `${label}: “${item.message}”\n\nCevabım:`;

    const url = new URL("https://twitter.com/intent/tweet");
    url.searchParams.set("text", text);

    window.open(
      url.toString(),
      "_blank",
      "noopener,noreferrer",
    );
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

      <section className="mx-auto max-w-[1120px] px-4 pb-16 pt-7 sm:px-6 sm:pt-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
              Soru mu İtiraf mı?
            </p>
            <h1 className="mt-2 text-[32px] font-black tracking-[-0.055em] sm:text-[42px]">
              Gelen kutusu
            </h1>
            <p className="mt-2 max-w-[620px] text-[12px] leading-6 text-muted-foreground">
              Kimlik yok. Sadece insanların sana bıraktığı soru ve itiraflar var.
              İçlerinden istediğini seçip X’te cevapla.
            </p>
          </div>

          <Link
            to="/question-confession-builder"
            className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-[10px] font-black text-white"
          >
            Yeni link oluştur +
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:max-w-[420px]">
          <StatCard label="Sorular" value={questionCount} />
          <StatCard label="İtiraflar" value={confessionCount} />
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            Tümü · {items.length}
          </FilterButton>
          <FilterButton
            active={filter === "question"}
            onClick={() => setFilter("question")}
          >
            Sorular · {questionCount}
          </FilterButton>
          <FilterButton
            active={filter === "confession"}
            onClick={() => setFilter("confession")}
          >
            İtiraflar · {confessionCount}
          </FilterButton>
        </div>

        {error ? (
          <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 p-5">
            <p className="text-[11px] font-black text-rose-800">
              Gelen kutusu açılamadı
            </p>
            <p className="mt-2 text-[10px] leading-5 text-rose-700">
              {error}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasExperiences={items.length > 0} />
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
                      className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black ${
                        item.mode === "question"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {item.mode === "question" ? "SORU" : "İTİRAF"}
                    </span>
                    <p className="mt-2 text-[9px] font-bold text-muted-foreground">
                      {item.experienceTitle}
                    </p>
                  </div>

                  <time className="text-[9px] font-bold text-muted-foreground">
                    {formatTime(item.createdAt)}
                  </time>
                </div>

                <p className="mt-5 whitespace-pre-wrap text-[18px] font-black leading-7 tracking-[-0.025em]">
                  {item.message}
                </p>

                <div className="mt-6 flex gap-2">
                  <button
                    type="button"
                    onClick={() => answerOnX(item)}
                    className="h-11 flex-1 rounded-full bg-black px-5 text-[10px] font-black text-white"
                  >
                    X’te cevapla →
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyMessage(item)}
                    className="h-11 rounded-full border border-border bg-white px-4 text-[10px] font-black"
                  >
                    {copiedId === item.id ? "✓" : "Kopyala"}
                  </button>
                </div>

                <p className="mt-3 text-[8px] font-semibold text-muted-foreground">
                  Gönderenin kimliği AQRYO tarafından creator’a gösterilmez.
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[22px] border border-border bg-white p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-[28px] font-black tracking-[-0.05em]">
        {value}
      </p>
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
      className={`h-10 shrink-0 rounded-full px-4 text-[10px] font-black transition ${
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
}: {
  hasExperiences: boolean;
}) {
  return (
    <div className="mt-5 rounded-[30px] border border-dashed border-violet-200 bg-white px-5 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-[24px]">
        ?
      </div>
      <h2 className="mt-5 text-[22px] font-black tracking-[-0.04em]">
        {hasExperiences
          ? "Bu filtrede mesaj yok."
          : "Henüz anonim mesaj yok."}
      </h2>
      <p className="mx-auto mt-2 max-w-[420px] text-[11px] leading-5 text-muted-foreground">
        Soru mu İtiraf mı linkini paylaş. İlk mesaj geldiğinde burada görünecek.
      </p>
      <Link
        to="/question-confession-builder"
        className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-violet-600 px-5 text-[10px] font-black text-white"
      >
        Soru mu İtiraf mı oluştur →
      </Link>
    </div>
  );
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
