import { CreatorNavigation } from "@/components/CreatorNavigation";
import { getCurrentCreator, signOutCreator } from "@/services/auth";
import { savePublishedExperience } from "@/services/experiences";
import { useEffect, useState } from "react";
import { detectLocale, getQuestionConfessionDefaults, useAqryoLocale } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/question-confession-builder")({
  component: QuestionConfessionBuilderPage,
});

type Accent = "violet" | "rose" | "dark";
type Mode = "question" | "confession";

type BuilderState = {
  title: string;
  intro: string;
  questionLabel: string;
  confessionLabel: string;
  placeholder: string;
  accent: Accent;
};

const STORAGE_KEY = "aqry-question-confession-builder";

const DEFAULT_COPY = getQuestionConfessionDefaults(detectLocale());
const DEFAULT_STATE: BuilderState = {
  ...DEFAULT_COPY,
  accent: "violet",
};

function QuestionConfessionBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<BuilderState>(DEFAULT_STATE);
  const [mode, setMode] = useState<Mode>("question");
  const [previewText, setPreviewText] = useState("");
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const { locale } = useAqryoLocale();
  const isTr = locale === "tr";

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const creator = await getCurrentCreator();
      if (!creator) {
        window.location.href = "/creator-auth";
        return;
      }

      if (!cancelled) {
        setCreatorId(creator.id);
      }

      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setState({ ...DEFAULT_STATE, ...(JSON.parse(stored) as Partial<BuilderState>) });
        } catch {
          window.sessionStorage.removeItem(STORAGE_KEY);
        }
      }

      if (!cancelled) setLoading(false);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [loading, state]);

  async function publishExperience() {
    if (!creatorId || publishing) return;

    try {
      setPublishing(true);
      const experienceId = crypto.randomUUID();

      await savePublishedExperience({
        id: experienceId,
        creatorId,
        type: "question_confession",
        status: "published",
        publishedAt: new Date().toISOString(),
        title: state.title.trim() || getQuestionConfessionDefaults(locale).title,
        description: state.intro.trim(),
        cover: {
          style: state.accent === "dark" ? "dark" : state.accent === "rose" ? "pink" : "purple",
          label: getQuestionConfessionDefaults(locale).title,
          imageUrl: "",
        },
        questions: [],
        results: [],
        offer: {
          enabled: false,
          title: "",
          description: "",
          price: 0,
        },
        questionConfession: {
          intro: state.intro.trim(),
          questionLabel: state.questionLabel.trim() || getQuestionConfessionDefaults(locale).questionLabel,
          confessionLabel: state.confessionLabel.trim() || getQuestionConfessionDefaults(locale).confessionLabel,
          placeholder: state.placeholder.trim() || getQuestionConfessionDefaults(locale).placeholder,
          accent: state.accent,
        },
      });

      window.location.href = `/publish-success/${experienceId}`;
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : "Yayınlanamadı.");
    } finally {
      setPublishing(false);
    }
  }

  function applyCurrentLanguage() {
    const copy = getQuestionConfessionDefaults(locale);
    setState((current) => ({ ...current, ...copy }));
  }

  if (loading) return <LoadingScreen />;

  const accent =
    state.accent === "rose"
      ? "from-rose-500 via-pink-500 to-fuchsia-600"
      : state.accent === "dark"
        ? "from-zinc-950 via-violet-950 to-black"
        : "from-violet-700 via-purple-600 to-fuchsia-600";

  return (
    <main className="min-h-screen bg-[#f7f5fb] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href = "/creator-auth";
        }}
      />

      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[13px] font-black uppercase tracking-[0.16em] text-primary">
              {isTr ? "Ana format" : "Main format"}
            </p>
            <h1 className="mt-1 text-[28px] font-black tracking-[-0.045em]">
              {state.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={applyCurrentLanguage}
              className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-[12px] font-black text-violet-700"
            >
              {isTr ? "Seçili dile uygula" : "Apply selected language"}
            </button>
            <Link
              to="/creator-studio"
              className="rounded-full border border-border bg-white px-4 py-2 text-[13px] font-black text-muted-foreground"
            >
              {isTr ? "Studio’ya dön" : "Back to Studio"}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-9">
        <section className="space-y-5">
          <div className="rounded-[28px] border border-border bg-white p-5 shadow-[0_16px_45px_rgba(33,21,53,0.04)] sm:p-7">
            <p className="text-[12px] font-black uppercase tracking-[0.15em] text-primary">
              1 · Giriş
            </p>
            <h2 className="mt-2 text-[25px] font-black tracking-[-0.045em]">
              {isTr ? "Takipçine ne söyleyeceksin?" : "What will your followers see?"}
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
              {isTr ? "Başlık kısa kalsın. İnsan ne yapacağını ilk bakışta anlamalı." : "Keep it short. People should understand it at a glance."}
            </p>

            <Field label={isTr ? "Başlık" : "Title"}>
              <input
                value={state.title}
                onChange={(event) => setState((current) => ({ ...current, title: event.target.value }))}
                className={inputClass}
              />
            </Field>

            <Field label={isTr ? "Kısa açıklama" : "Short description"}>
              <textarea
                rows={3}
                value={state.intro}
                onChange={(event) => setState((current) => ({ ...current, intro: event.target.value }))}
                className={textareaClass}
              />
            </Field>
          </div>

          <div className="rounded-[28px] border border-border bg-white p-5 shadow-[0_16px_45px_rgba(33,21,53,0.04)] sm:p-7">
            <p className="text-[12px] font-black uppercase tracking-[0.15em] text-primary">
              2 · Seçim
            </p>
            <h2 className="mt-2 text-[25px] font-black tracking-[-0.045em]">
              {isTr ? "İki kapı. Fazlası yok." : "Two choices. Nothing more."}
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={isTr ? "Soru butonu" : "Question button"}>
                <input
                  value={state.questionLabel}
                  onChange={(event) => setState((current) => ({ ...current, questionLabel: event.target.value }))}
                  className={inputClass}
                />
              </Field>
              <Field label={isTr ? "İtiraf butonu" : "Confession button"}>
                <input
                  value={state.confessionLabel}
                  onChange={(event) => setState((current) => ({ ...current, confessionLabel: event.target.value }))}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label={isTr ? "Yazı alanı" : "Input placeholder"}>
              <input
                value={state.placeholder}
                onChange={(event) => setState((current) => ({ ...current, placeholder: event.target.value }))}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="rounded-[28px] border border-border bg-white p-5 sm:p-7">
            <p className="text-[12px] font-black uppercase tracking-[0.15em] text-primary">
              3 · Görünüm
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {([
                ["violet", "Mor"],
                ["rose", "Pembe"],
                ["dark", "Gece"],
              ] as Array<[Accent, string]>).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setState((current) => ({ ...current, accent: value }))}
                  className={`rounded-full px-4 py-2 text-[14px] font-black transition ${
                    state.accent === value
                      ? "bg-black text-white"
                      : "border border-border bg-white text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-violet-200 bg-violet-50/70 p-5">
            <p className="text-[13px] font-black text-violet-950">{isTr ? "Hazırsa yayınla ve paylaş." : "Publish and share when ready."}</p>
            <p className="mt-1 text-[14px] leading-5 text-violet-900/65">
              {isTr
                ? "Yayınlandıktan sonra paylaşılabilir AQRYO linkini alacaksın. Takipçilerin anonim soru veya itiraf bırakabilecek."
                : "After publishing, you’ll get a shareable AQRYO link for anonymous questions and confessions."}
            </p>
            <button
              type="button"
              disabled={publishing}
              onClick={() => void publishExperience()}
              className="mt-4 h-11 w-full rounded-full bg-violet-700 px-5 text-[14px] font-black text-white disabled:opacity-50 sm:w-auto"
            >
              {publishing
                ? isTr ? "Yayınlanıyor..." : "Publishing..."
                : isTr ? "Yayınla ve paylaş →" : "Publish and share →"}
            </button>
          </div>
        </section>

        <aside className="lg:sticky lg:top-[92px] lg:self-start">
          <p className="mb-3 text-[13px] font-black uppercase tracking-[0.16em] text-muted-foreground">
            {isTr ? "Canlı önizleme" : "Live preview"}
          </p>

          <div className={`overflow-hidden rounded-[32px] bg-gradient-to-br ${accent} p-3 shadow-[0_24px_70px_rgba(56,27,90,0.22)]`}>
            <div className="rounded-[26px] bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#74f0de] text-[19px] font-black">
                  Q
                </div>
                <div>
                  <p className="text-[13px] font-black">Anonim kutu</p>
                  <p className="text-[13px] text-muted-foreground">AQRYO</p>
                </div>
              </div>

              <h3 className="mt-6 text-[27px] font-black leading-[0.98] tracking-[-0.055em]">
                {state.title || "Soru mu İtiraf mı?"}
              </h3>
              <p className="mt-3 text-[13px] leading-5 text-muted-foreground">
                {state.intro}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("question");
                    setPreviewText("");
                  }}
                  className={`rounded-[18px] px-3 py-4 text-left transition ${
                    mode === "question"
                      ? "bg-violet-600 text-white"
                      : "bg-violet-50 text-violet-950"
                  }`}
                >
                  <span className="text-[19px] font-black">?</span>
                  <p className="mt-3 text-[13px] font-black">{state.questionLabel}</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("confession");
                    setPreviewText("");
                  }}
                  className={`rounded-[18px] px-3 py-4 text-left transition ${
                    mode === "confession"
                      ? "bg-rose-500 text-white"
                      : "bg-rose-50 text-rose-950"
                  }`}
                >
                  <span className="text-[19px]">♡</span>
                  <p className="mt-3 text-[13px] font-black">{state.confessionLabel}</p>
                </button>
              </div>

              <textarea
                rows={5}
                value={previewText}
                onChange={(event) => setPreviewText(event.target.value)}
                className="mt-3 w-full resize-none rounded-[18px] border border-border bg-background px-4 py-4 text-[13px] font-semibold leading-5 outline-none focus:border-primary"
                placeholder={state.placeholder}
              />

              <button
                type="button"
                className="mt-3 h-11 w-full rounded-full bg-black text-[14px] font-black text-white"
              >
                {isTr ? "Anonim gönder" : "Send anonymously"}
              </button>

              <p className="mt-3 text-center text-[8px] font-bold text-muted-foreground">
                {isTr ? "Kimliğin creator ile paylaşılmaz." : "Your identity is never shared with the creator."}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-5 block">
      <span className="text-[14px] font-black">{label}</span>
      {children}
    </label>
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#f7f5fb]">
      <div className="mx-auto max-w-[1280px] px-4 py-10">
        <div className="h-[360px] animate-pulse rounded-[30px] bg-white" />
      </div>
    </main>
  );
}

const inputClass =
  "mt-2 h-12 w-full rounded-[16px] border border-border bg-background px-4 text-[14px] font-bold outline-none focus:border-primary";

const textareaClass =
  "mt-2 w-full resize-none rounded-[16px] border border-border bg-background px-4 py-3 text-[14px] font-semibold leading-6 outline-none focus:border-primary";
