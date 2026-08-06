import { CreatorNavigation } from "@/components/CreatorNavigation";
import { getCurrentCreator, signOutCreator } from "@/services/auth";
import { savePublishedExperience } from "@/services/experiences";
import { ImageUploader } from "@/components/creator/ImageUploader";
import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/guess-builder")({
  component: GuessBuilderPage,
});

type BuilderStep = "content" | "answer" | "result" | "offer" | "preview";
type PreviewScreen = "entry" | "guess" | "result";

type GuessBuilderState = {
  sourceExperienceId: string | null;
  title: string;
  description: string;
  imageUrl: string;
  prompt: string;
  acceptedAnswers: string[];
  successTitle: string;
  successDescription: string;
  retryEnabled: boolean;
  offerEnabled: boolean;
  offerTitle: string;
  offerDescription: string;
  offerPrice: number;
};

const STANDARD_OFFER_PRICE = 9;
const STORAGE_KEY = "aqry-guess-builder";
const BUILDER_STEPS: BuilderStep[] = ["content", "answer", "result", "offer", "preview"];

const DEFAULT_STATE: GuessBuilderState = {
  sourceExperienceId: null,
  title: "Bu nedir?",
  description: "Görsele bak, cevabını yaz ve doğru bilip bilmediğini hemen öğren.",
  imageUrl: "",
  prompt: "Sence bu nedir?",
  acceptedAnswers: ["", "", ""],
  successTitle: "Bildin! 🎉",
  successDescription: "Doğru cevabı buldun.",
  retryEnabled: true,
  offerEnabled: false,
  offerTitle: "Bu görselin hikâyesini gör",
  offerDescription: "Cevabın arkasındaki ilginç detayı keşfet.",
  offerPrice: STANDARD_OFFER_PRICE,
};

function GuessBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [state, setState] = useState<GuessBuilderState>(DEFAULT_STATE);

  const [activeStep, setActiveStep] = useState<BuilderStep>("content");
  const [maxVisitedStep, setMaxVisitedStep] = useState(0);
  const [guide, setGuide] = useState<BuilderStep | null>(null);

  const [previewScreen, setPreviewScreen] = useState<PreviewScreen>("entry");
  const [previewAnswer, setPreviewAnswer] = useState("");
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const creator = await getCurrentCreator();
      if (!creator) {
        window.location.href = "/creator-auth";
        return;
      }

      if (cancelled) return;
      setCreatorId(creator.id);

      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Partial<GuessBuilderState>;
          const existing = Array.isArray(parsed.acceptedAnswers)
            ? parsed.acceptedAnswers.filter((value): value is string => typeof value === "string")
            : [];

          setState({
            ...DEFAULT_STATE,
            ...parsed,
            sourceExperienceId:
              typeof parsed.sourceExperienceId === "string" && parsed.sourceExperienceId
                ? parsed.sourceExperienceId
                : null,
            acceptedAnswers: [...existing, "", ""].slice(0, Math.max(3, existing.length)),
            offerPrice: STANDARD_OFFER_PRICE,
          });
        } catch {
          window.sessionStorage.removeItem(STORAGE_KEY);
        }
      }

      setLoading(false);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...state,
          offerPrice: STANDARD_OFFER_PRICE,
        }),
      );
    }
  }, [loading, state]);

  const activeIndex = BUILDER_STEPS.indexOf(activeStep);
  const acceptedAnswers = useMemo(
    () => state.acceptedAnswers.map((answer) => answer.trim()).filter(Boolean),
    [state.acceptedAnswers],
  );

  const contentValid =
    state.title.trim().length > 0 &&
    state.description.trim().length > 0 &&
    state.prompt.trim().length > 0;

  const answerValid = Boolean(state.acceptedAnswers[0]?.trim());
  const resultValid =
    state.successTitle.trim().length > 0 && state.successDescription.trim().length > 0;
  const offerValid =
    !state.offerEnabled ||
    (state.offerTitle.trim().length > 0 &&
      state.offerDescription.trim().length > 0);
  const canPublish = contentValid && answerValid && resultValid && offerValid;

  function openStep(step: BuilderStep) {
    const index = BUILDER_STEPS.indexOf(step);
    if (index <= maxVisitedStep) setActiveStep(step);
  }

  function canLeaveCurrentStep() {
    if (activeStep === "content") return contentValid;
    if (activeStep === "answer") return answerValid;
    if (activeStep === "result") return resultValid;
    if (activeStep === "offer") return offerValid;
    return true;
  }

  function goNext() {
    if (!canLeaveCurrentStep()) return;
    const nextIndex = activeIndex + 1;
    if (nextIndex >= BUILDER_STEPS.length) return;
    const nextStep = BUILDER_STEPS[nextIndex];
    setMaxVisitedStep((current) => Math.max(current, nextIndex));
    setGuide(nextStep);
  }

  function acceptGuide() {
    if (!guide) return;
    setActiveStep(guide);
    if (guide === "preview") resetPreview();
    setGuide(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    if (activeIndex <= 0) return;
    setActiveStep(BUILDER_STEPS[activeIndex - 1]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateAnswer(index: number, value: string) {
    setState((current) => ({
      ...current,
      acceptedAnswers: current.acceptedAnswers.map((answer, answerIndex) =>
        answerIndex === index ? value : answer,
      ),
    }));
  }

  function addAnswer() {
    setState((current) => ({
      ...current,
      acceptedAnswers: [...current.acceptedAnswers, ""],
    }));
  }

  function removeAnswer(index: number) {
    if (index === 0) return;
    setState((current) => {
      const next = current.acceptedAnswers.filter((_, answerIndex) => answerIndex !== index);
      return {
        ...current,
        acceptedAnswers: [...next, "", ""].slice(0, Math.max(3, next.length)),
      };
    });
  }

  function normalize(value: string) {
    return value.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, " ");
  }

  function resetPreview() {
    setPreviewScreen("entry");
    setPreviewAnswer("");
    setPreviewError(null);
  }

  function checkPreviewAnswer() {
    const value = normalize(previewAnswer);
    if (!value) return;

    const isCorrect = acceptedAnswers.some((answer) => normalize(answer) === value);
    if (isCorrect) {
      setPreviewError(null);
      setPreviewScreen("result");
      return;
    }

    setPreviewError(
      state.retryEnabled ? "Bu cevap doğru değil. Bir kez daha dene." : "Bu cevap doğru değil.",
    );
  }

  async function publishGuess() {
    if (!creatorId || !canPublish || publishing) return;

    try {
      setPublishing(true);

      // Yayındaki sürüm değişmez. Düzenleme akışında da yeni bir Experience ID üretiyoruz.
      const experienceId = crypto.randomUUID();

      await savePublishedExperience({
        id: experienceId,
        creatorId,
        type: "guess",
        status: "published",
        publishedAt: new Date().toISOString(),
        title: state.title.trim(),
        description: state.description.trim(),
        cover: {
          style: "purple",
          label: "Tahmin et / Bu nedir?",
          imageUrl: state.imageUrl.trim(),
        },
        questions: [],
        results: [
          {
            id: "correct",
            title: state.successTitle.trim(),
            description: state.successDescription.trim(),
          },
        ],
        offer: {
          enabled: state.offerEnabled,
          title: state.offerTitle.trim(),
          description: state.offerDescription.trim(),
          price: STANDARD_OFFER_PRICE,
        },
        guess: {
          prompt: state.prompt.trim(),
          acceptedAnswers,
          successTitle: state.successTitle.trim(),
          successDescription: state.successDescription.trim(),
          retryEnabled: state.retryEnabled,
        },
      });

      window.sessionStorage.removeItem(STORAGE_KEY);
      window.location.href = `/publish-success/${experienceId}`;
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : "Experience yayınlanamadı.");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen bg-[#faf8fb] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href = "/creator-auth";
        }}
      />

      <header className="sticky top-16 z-30 border-b border-border/80 bg-[#faf8fb]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[58px] max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-7">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-orange-600">
              {state.sourceExperienceId ? "Yeni sürüm oluşturuluyor" : "Tahmin et / Bu nedir?"}
            </p>
            <p className="truncate text-[11px] font-bold">{state.title}</p>
          </div>
          <Link
            to="/creator-studio"
            className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-white px-4 text-[9px] font-bold text-muted-foreground transition hover:border-orange-300 hover:text-orange-700"
          >
            Studio’ya dön
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[210px_minmax(0,1fr)_330px]">
        <aside className="sticky top-[122px] z-20 border-b border-border bg-[#faf8fb]/95 px-3 py-3 backdrop-blur-xl lg:h-[calc(100vh-122px)] lg:self-start lg:border-b-0 lg:border-r lg:bg-white/60 lg:py-5">
          <p className="mb-3 hidden px-3 text-[8px] font-black uppercase tracking-[0.16em] text-muted-foreground lg:block">
            Oluşturma akışı
          </p>
          <nav className="grid grid-cols-5 gap-1.5 lg:grid-cols-1">
            {BUILDER_STEPS.map((step, index) => (
              <StepButton
                key={step}
                index={index + 1}
                label={stepLabel(step)}
                active={step === activeStep}
                completed={index < activeIndex}
                disabled={index > maxVisitedStep}
                onClick={() => openStep(step)}
              />
            ))}
          </nav>
        </aside>

        <section className="min-w-0 px-4 py-6 sm:px-7 lg:px-8">
          {state.sourceExperienceId ? (
            <div className="mb-5 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-[10px] font-semibold leading-5 text-amber-900">
              Yayındaki Experience değişmeyecek. Burada yaptığın değişiklikler yeni bir sürüm olarak yayınlanacak.
            </div>
          ) : null}

          {activeStep === "content" ? (
            <ContentStep
              state={state}
              setState={setState}
            />
          ) : null}

          {activeStep === "answer" ? (
            <AnswerStep
              answers={state.acceptedAnswers}
              retryEnabled={state.retryEnabled}
              onUpdate={updateAnswer}
              onAdd={addAnswer}
              onRemove={removeAnswer}
              onRetryChange={(value) => setState((current) => ({ ...current, retryEnabled: value }))}
            />
          ) : null}

          {activeStep === "result" ? (
            <ResultStep state={state} setState={setState} />
          ) : null}

          {activeStep === "offer" ? (
            <OfferStep state={state} setState={setState} />
          ) : null}

          {activeStep === "preview" ? (
            <PreviewStep
              state={state}
              screen={previewScreen}
              answer={previewAnswer}
              error={previewError}
              onAnswer={setPreviewAnswer}
              onStart={() => setPreviewScreen("guess")}
              onCheck={checkPreviewAnswer}
              onReset={resetPreview}
            />
          ) : null}

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={goBack}
              disabled={activeIndex === 0}
              className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-white px-5 text-[10px] font-bold disabled:opacity-30"
            >
              ← Geri
            </button>

            {activeStep !== "preview" ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canLeaveCurrentStep()}
                className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-[10px] font-black text-white transition enabled:hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-25"
              >
                Sonraki →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void publishGuess()}
                disabled={!canPublish || publishing}
                className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-[10px] font-black text-white transition enabled:hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-25"
              >
                {publishing
                  ? "Yayınlanıyor..."
                  : state.sourceExperienceId
                    ? "Yeni sürümü yayınla"
                    : "Yayınla"}
              </button>
            )}
          </div>
        </section>

        <aside className="hidden border-l border-border bg-white/55 px-5 py-6 lg:block">
          <div className="sticky top-[145px]">
            <MiniPreview state={state} />
          </div>
        </aside>
      </div>

      {guide ? <GuideModal step={guide} onContinue={acceptGuide} onClose={() => setGuide(null)} /> : null}
    </main>
  );
}

function ContentStep({
  state,
  setState,
}: {
  state: GuessBuilderState;
  setState: React.Dispatch<React.SetStateAction<GuessBuilderState>>;
}) {
  return (
    <BuilderCard
      eyebrow="1 · İçerik"
      title="Merak uyandıracak tahmini hazırla"
      description="Başlık, görsel veya ipucu ve katılımcıya soracağın tek soruyu düzenle."
    >
      <FieldLabel>Başlık</FieldLabel>
      <input
        value={state.title}
        onChange={(event) => setState((current) => ({ ...current, title: event.target.value }))}
        className={inputClass}
      />

      <FieldLabel className="mt-5">Kısa açıklama</FieldLabel>
      <textarea
        rows={3}
        value={state.description}
        onChange={(event) =>
          setState((current) => ({ ...current, description: event.target.value }))
        }
        className={textareaClass}
      />

      <div className="mt-5">
        <ImageUploader
          value={state.imageUrl}
          onChange={(value) =>
            setState((current) => ({
              ...current,
              imageUrl: value,
            }))
          }
          label="Görsel"
          helperText="JPG veya PNG yükle. Görseli 10%–300% arasında boyutlandırabilir, yatay ve dikey konumunu ayarlayabilirsin."
        />
      </div>

      <FieldLabel className="mt-5">Soru / ipucu</FieldLabel>
      <input
        value={state.prompt}
        onChange={(event) => setState((current) => ({ ...current, prompt: event.target.value }))}
        className={inputClass}
        placeholder="Sence bu nedir?"
      />
    </BuilderCard>
  );
}

function AnswerStep({
  answers,
  retryEnabled,
  onUpdate,
  onAdd,
  onRemove,
  onRetryChange,
}: {
  answers: string[];
  retryEnabled: boolean;
  onUpdate: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onRetryChange: (value: boolean) => void;
}) {
  return (
    <BuilderCard
      eyebrow="2 · Doğru cevap"
      title="AQRYO hangi cevapları doğru kabul etsin?"
      description="İlk alan ana doğru cevaptır. Yazım varyasyonlarını alternatif cevap olarak ekleyebilirsin."
    >
      <div className="space-y-3">
        {answers.map((answer, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={answer}
              onChange={(event) => onUpdate(index, event.target.value)}
              className={`${inputClass} mt-0`}
              placeholder={index === 0 ? "Ana doğru cevap" : `Alternatif cevap ${index}`}
            />
            {index > 0 ? (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="h-12 w-12 shrink-0 rounded-[16px] border border-border bg-white text-[12px] font-black text-muted-foreground"
              >
                ×
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-4 text-[9px] font-bold"
      >
        + Alternatif cevap ekle
      </button>

      <label className="mt-6 flex items-center justify-between gap-4 rounded-[16px] border border-border bg-background p-4">
        <div>
          <p className="text-[11px] font-black">Yanlış cevapta tekrar denesin</p>
          <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
            Açık olduğunda katılımcı doğru cevabı bulana kadar yeniden deneyebilir.
          </p>
        </div>
        <input
          type="checkbox"
          checked={retryEnabled}
          onChange={(event) => onRetryChange(event.target.checked)}
          className="h-5 w-5"
        />
      </label>
    </BuilderCard>
  );
}

function ResultStep({
  state,
  setState,
}: {
  state: GuessBuilderState;
  setState: React.Dispatch<React.SetStateAction<GuessBuilderState>>;
}) {
  return (
    <BuilderCard
      eyebrow="3 · Sonuç"
      title="Doğru bildiğinde ne görecek?"
      description="Bu ücretsiz finaldir. Katılımcı doğru cevabı bulduğunda karşılığını burada alır."
    >
      <FieldLabel>Sonuç başlığı</FieldLabel>
      <input
        value={state.successTitle}
        onChange={(event) =>
          setState((current) => ({ ...current, successTitle: event.target.value }))
        }
        className={inputClass}
      />
      <FieldLabel className="mt-5">Sonuç açıklaması</FieldLabel>
      <textarea
        rows={5}
        value={state.successDescription}
        onChange={(event) =>
          setState((current) => ({ ...current, successDescription: event.target.value }))
        }
        className={textareaClass}
      />
    </BuilderCard>
  );
}

function OfferStep({
  state,
  setState,
}: {
  state: GuessBuilderState;
  setState: React.Dispatch<React.SetStateAction<GuessBuilderState>>;
}) {
  return (
    <BuilderCard
      eyebrow="4 · Kazanç"
      title="Bu içerikten ekstra para kazanmak ister misin?"
      description="Offer zorunlu değil. Doğal bir ekstra değer varsa ekle, yoksa kapalı bırak ve devam et."
    >
      <label className="flex items-center justify-between gap-4 rounded-[16px] border border-border bg-background p-4">
        <div>
          <p className="text-[12px] font-black">Offer oluştur</p>
          <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
            Örn. görselin hikâyesi, bonus bilgi veya devam içeriği.
          </p>
        </div>
        <input
          type="checkbox"
          checked={state.offerEnabled}
          onChange={(event) =>
            setState((current) => ({ ...current, offerEnabled: event.target.checked }))
          }
          className="h-5 w-5"
        />
      </label>

      {state.offerEnabled ? (
        <div className="mt-4 space-y-4">
          <div>
            <FieldLabel>Offer başlığı</FieldLabel>
            <input
              value={state.offerTitle}
              onChange={(event) =>
                setState((current) => ({ ...current, offerTitle: event.target.value }))
              }
              className={inputClass}
            />
          </div>
          <div>
            <FieldLabel>Ne satın alacak?</FieldLabel>
            <textarea
              rows={4}
              value={state.offerDescription}
              onChange={(event) =>
                setState((current) => ({ ...current, offerDescription: event.target.value }))
              }
              className={textareaClass}
            />
          </div>
          <div className="rounded-[16px] border border-orange-100 bg-orange-50 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black">
                  AQRYO standart Offer fiyatı
                </p>
                <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                  Fiyat tüm standart Offer’larda otomatik belirlenir.
                </p>
              </div>

              <span className="shrink-0 text-[18px] font-black text-orange-600">
                {STANDARD_OFFER_PRICE} TL
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-[16px] border border-dashed border-border p-4 text-[10px] leading-5 text-muted-foreground">
          Offer yok. Katılımcı ücretsiz Result’ı görür ve Experience burada tamamlanır.
        </div>
      )}
    </BuilderCard>
  );
}

function PreviewStep({
  state,
  screen,
  answer,
  error,
  onAnswer,
  onStart,
  onCheck,
  onReset,
}: {
  state: GuessBuilderState;
  screen: PreviewScreen;
  answer: string;
  error: string | null;
  onAnswer: (value: string) => void;
  onStart: () => void;
  onCheck: () => void;
  onReset: () => void;
}) {
  return (
    <BuilderCard
      eyebrow="5 · Önizleme"
      title="Yayınlamadan önce kendin dene"
      description="Katılımcının göreceği akışı burada gerçekten yaşa. İstersen doğrudan yayınlayabilirsin."
    >
      <div className="mx-auto max-w-[470px] overflow-hidden rounded-[28px] border border-border bg-white shadow-[0_20px_55px_rgba(35,16,55,0.09)]">
        {screen === "entry" ? (
          <>
            <Cover state={state} />
            <div className="p-5">
              <p className="text-[12px] leading-5 text-muted-foreground">{state.description}</p>
              <button
                type="button"
                onClick={onStart}
                className="mt-5 h-11 w-full rounded-full bg-black text-[10px] font-black text-white"
              >
                Başla
              </button>
            </div>
          </>
        ) : null}

        {screen === "guess" ? (
          <div className="p-5 sm:p-6">
            {state.imageUrl ? (
              <img src={state.imageUrl} alt="" className="mb-5 max-h-[300px] w-full rounded-[18px] object-contain" />
            ) : null}
            <h3 className="text-[22px] font-black tracking-[-0.04em]">{state.prompt}</h3>
            <input
              value={answer}
              onChange={(event) => onAnswer(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onCheck();
              }}
              className={`${inputClass} mt-5`}
              placeholder="Cevabını yaz..."
            />
            {error ? <p className="mt-2 text-[10px] font-bold text-red-600">{error}</p> : null}
            <button
              type="button"
              onClick={onCheck}
              disabled={!answer.trim()}
              className="mt-4 h-11 w-full rounded-full bg-black text-[10px] font-black text-white disabled:opacity-25"
            >
              Cevabımı kontrol et
            </button>
          </div>
        ) : null}

        {screen === "result" ? (
          <div className="p-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-600">Sonuç</p>
            <h3 className="mt-3 text-[26px] font-black tracking-[-0.05em]">{state.successTitle}</h3>
            <p className="mt-3 text-[12px] leading-6 text-muted-foreground">{state.successDescription}</p>

            {state.offerEnabled ? (
              <div className="mt-5 rounded-[18px] border border-orange-100 bg-orange-50 p-4 text-left">
                <p className="text-[11px] font-black">{state.offerTitle}</p>
                <p className="mt-1 text-[10px] leading-5 text-muted-foreground">{state.offerDescription}</p>
                <p className="mt-3 text-[11px] font-black">{STANDARD_OFFER_PRICE} TL</p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={onReset}
              className="mt-5 h-10 rounded-full border border-border bg-white px-5 text-[9px] font-bold"
            >
              Baştan dene
            </button>
          </div>
        ) : null}
      </div>
    </BuilderCard>
  );
}

function MiniPreview({ state }: { state: GuessBuilderState }) {
  return (
    <div>
      <p className="mb-3 text-[8px] font-black uppercase tracking-[0.16em] text-muted-foreground">Canlı görünüm</p>
      <div className="overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_16px_45px_rgba(22,12,34,0.05)]">
        <Cover state={state} compact />
        <div className="p-5">
          <p className="text-[12px] font-black">{state.prompt || "Sence bu nedir?"}</p>
          <div className="mt-3 rounded-[14px] border border-border bg-background px-4 py-3 text-[10px] text-muted-foreground">
            Cevabını yaz...
          </div>
          <div className="mt-3 h-10 rounded-full bg-black text-center text-[9px] font-black leading-10 text-white">
            Cevabımı kontrol et
          </div>
        </div>
      </div>
    </div>
  );
}

function Cover({ state, compact = false }: { state: GuessBuilderState; compact?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-orange-500 via-rose-500 to-pink-500 ${compact ? "aspect-[4/3]" : "aspect-[16/10]"}`}>
      {state.imageUrl ? (
        <img src={state.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <div className="absolute inset-0 bg-black/15" />
      <div className="relative z-10 flex h-full flex-col justify-end p-5 text-white">
        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/75">AQRYO Tahmin</p>
        <h2 className={`${compact ? "text-[23px]" : "text-[30px]"} mt-2 font-black leading-[0.98] tracking-[-0.05em]`}>
          {state.title || "Bu nedir?"}
        </h2>
      </div>
    </div>
  );
}

function GuideModal({
  step,
  onContinue,
  onClose,
}: {
  step: BuilderStep;
  onContinue: () => void;
  onClose: () => void;
}) {
  const copy =
    step === "answer"
      ? {
          title: "Şimdi doğru cevabı tanımlayalım.",
          text: "AQRYO katılımcının yazdığı cevabı senin tanımladığın cevaplarla karşılaştıracak. İlk cevap ana doğru cevap olacak; gerekirse farklı yazılışları da ekleyebilirsin.",
        }
      : step === "result"
        ? {
            title: "Şimdi ücretsiz finali hazırlıyoruz.",
            text: "Katılımcı doğru cevabı bulduğunda ne göreceğini yaz. Result, Experience’ın doğal ve tamamlanmış finalidir.",
          }
        : step === "offer"
          ? {
              title: "Bu içerikten ekstra gelir elde etmek ister misin?",
              text: "Doğal bir ek değer varsa Offer oluşturabilirsin. Yoksa kapalı bırakıp devam et; ücretli içerik zorunlu değildir.",
            }
          : {
              title: "Yayınlamadan önce kendin dene.",
              text: "Experience’ı ziyaretçi gibi baştan sona kontrol et. Akış hoşuna yatarsa yayınla; istersen testi yapmadan da yayınlayabilirsin.",
            };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-[430px] rounded-[28px] bg-white p-6 shadow-2xl">
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-orange-600">Sıradaki adım</p>
        <h3 className="mt-3 text-[24px] font-black leading-tight tracking-[-0.045em]">{copy.title}</h3>
        <p className="mt-3 text-[11px] leading-6 text-muted-foreground">{copy.text}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-full px-4 text-[9px] font-bold text-muted-foreground">
            Geri dön
          </button>
          <button type="button" onClick={onContinue} className="h-10 rounded-full bg-black px-5 text-[9px] font-black text-white">
            Tamam, devam et
          </button>
        </div>
      </div>
    </div>
  );
}

function StepButton({
  index,
  label,
  active,
  completed,
  disabled,
  onClick,
}: {
  index: number;
  label: string;
  active: boolean;
  completed: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-w-0 items-center gap-2 rounded-[14px] px-3 py-2.5 text-left transition ${
        active
          ? "bg-black text-white"
          : completed
            ? "bg-orange-50 text-orange-800"
            : "text-muted-foreground hover:bg-white"
      } disabled:cursor-not-allowed disabled:opacity-30`}
    >
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-black ${active ? "bg-white/15" : "bg-white"}`}>
        {completed ? "✓" : index}
      </span>
      <span className="truncate text-[9px] font-black">{label}</span>
    </button>
  );
}

function BuilderCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-border bg-white p-5 shadow-[0_14px_40px_rgba(22,12,34,0.035)] sm:p-7">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-orange-600">{eyebrow}</p>
      <h1 className="mt-2 text-[28px] font-black tracking-[-0.05em]">{title}</h1>
      <p className="mt-2 max-w-[720px] text-[11px] leading-5 text-muted-foreground">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function FieldLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[10px] font-black ${className}`}>{children}</p>;
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#fbfbfd]">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();
          window.location.href = "/creator-auth";
        }}
      />
      <div className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6">
        <div className="rounded-[26px] border border-border bg-white p-10 text-center">
          <p className="text-sm font-bold text-muted-foreground">Builder hazırlanıyor...</p>
        </div>
      </div>
    </main>
  );
}

function stepLabel(step: BuilderStep) {
  if (step === "content") return "İçerik";
  if (step === "answer") return "Doğru cevap";
  if (step === "result") return "Sonuç";
  if (step === "offer") return "Kazanç";
  return "Önizleme";
}

const inputClass =
  "mt-2 h-12 w-full rounded-[16px] border border-border bg-background px-4 text-[12px] font-bold outline-none transition focus:border-orange-300";
const textareaClass =
  "mt-2 w-full resize-none rounded-[16px] border border-border bg-background px-4 py-3 text-[12px] font-semibold leading-6 outline-none transition focus:border-orange-300";