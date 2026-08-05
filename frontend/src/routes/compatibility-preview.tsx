import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreatorNavigation } from "@/components/CreatorNavigation";
import { signOutCreator } from "@/services/auth";
export const Route = createFileRoute("/compatibility-preview")({
  component: CompatibilityPreviewPage,
});

type CoverStyle = "pink" | "purple" | "blue" | "dark";

type Question = {
  id: number;
  text: string;
  options: string[];
};

type ResultDefinition = {
  id: string;
  range: string;
  title: string;
  description: string;
};

type PreviewData = {
  title: string;
  description: string;
  cover: {
    style: CoverStyle;
    imageUrl: string;
    label: string;
  };
  questions: Question[];
  creatorAnswers: Record<number, number>;
  results: ResultDefinition[];
  offer: {
    enabled: boolean;
    title: string;
    description: string;
    price: number;
  };
};

type PreviewScreen =
  | "entry"
  | "questions"
  | "result"
  | "offer";

function CompatibilityPreviewPage() {
  const navigate = useNavigate();

  const previewData = useMemo<PreviewData | null>(() => {
    const storedData = window.sessionStorage.getItem(
      "aqry-compatibility-preview",
    );

    if (!storedData) {
      return null;
    }

    try {
      return JSON.parse(storedData) as PreviewData;
    } catch {
      return null;
    }
  }, []);

  const [screen, setScreen] =
    useState<PreviewScreen>("entry");

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [participantAnswers, setParticipantAnswers] =
    useState<Record<number, number>>({});

  if (!previewData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8fb] px-5">
        <div className="w-full max-w-md rounded-[28px] border border-border bg-white p-7 text-center shadow-soft">
          <p className="text-sm font-black">
            Ön izleme verisi bulunamadı
          </p>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Editöre dönüp Ön izle butonuna yeniden bas.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/compatibility-builder",
              })
            }
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-[10px] font-bold text-white"
          >
            Editöre dön
          </button>
        </div>
      </div>
    );
  }

  const question =
    previewData.questions[currentQuestionIndex];

  const answeredCount = Object.keys(
    participantAnswers,
  ).length;

  const progress =
    previewData.questions.length > 0
      ? ((currentQuestionIndex + 1) /
          previewData.questions.length) *
        100
      : 0;

  const compatibilityScore =
    calculateCompatibilityScore(
      previewData.questions,
      previewData.creatorAnswers,
      participantAnswers,
    );

  const result = findResult(
    compatibilityScore,
    previewData.results,
  );

  function selectAnswer(optionIndex: number) {
    if (!question) {
      return;
    }

    setParticipantAnswers((currentAnswers) => ({
      ...currentAnswers,
      [question.id]: optionIndex,
    }));
  }

  function goToNextQuestion() {
    if (!question) {
      return;
    }

    const selectedAnswer =
      participantAnswers[question.id];

    if (selectedAnswer === undefined) {
      return;
    }

    const isLastQuestion =
      currentQuestionIndex ===
       (previewData?.questions.length ?? 0) - 1;

    if (isLastQuestion) {
      setScreen("result");
      return;
    }

    setCurrentQuestionIndex(
      (currentIndex) => currentIndex + 1,
    );
  }

  function goToPreviousQuestion() {
    if (currentQuestionIndex === 0) {
      setScreen("entry");
      return;
    }

    setCurrentQuestionIndex(
      (currentIndex) => currentIndex - 1,
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8fb] text-foreground">
        <CreatorNavigation
  onSignOut={async () => {
    await signOutCreator();

    window.location.href =
      "/creator-auth";
  }}
/>
      <header className="sticky top-16 z-30 border-b border-border/80 bg-[#faf8fb]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[58px] max-w-[1100px] items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/compatibility-builder",
              })
            }
            className="text-[24px] font-black tracking-[-0.065em] text-primary"
          >
            AQRY.
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-primary/[0.08] px-3 py-1.5 text-[8px] font-bold text-primary sm:inline">
              Katılımcı ön izlemesi
            </span>

            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/compatibility-builder",
                })
              }
              className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-white px-4 text-[9px] font-bold"
            >
              Ön izlemeden çık
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-122px)] max-w-[1100px] items-center justify-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-[430px]">
          {screen === "entry" && (
            <EntryScreen
              data={previewData}
              onStart={() => setScreen("questions")}
            />
          )}

          {screen === "questions" && question && (
            <QuestionScreen
              question={question}
              questionIndex={currentQuestionIndex}
              questionCount={previewData.questions.length}
              selectedAnswer={
                participantAnswers[question.id]
              }
              progress={progress}
              onSelectAnswer={selectAnswer}
              onPrevious={goToPreviousQuestion}
              onNext={goToNextQuestion}
            />
          )}

          {screen === "result" && (
            <ResultScreen
              score={compatibilityScore}
              result={result}
              offerEnabled={previewData.offer.enabled}
              onContinue={() => {
                if (previewData.offer.enabled) {
                  setScreen("offer");
                }
              }}
              onRestart={() => {
                setParticipantAnswers({});
                setCurrentQuestionIndex(0);
                setScreen("entry");
              }}
            />
          )}

          {screen === "offer" && (
            <OfferScreen
              offer={previewData.offer}
              onBack={() => setScreen("result")}
            />
          )}

          {screen === "questions" && (
            <p className="mt-4 text-center text-[9px] text-muted-foreground">
              {answeredCount}/{previewData.questions.length} cevaplandı
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function EntryScreen({
  data,
  onStart,
}: {
  data: PreviewData;
  onStart: () => void;
}) {
  const coverClass = getCoverClass(data.cover.style);

  return (
    <article className="overflow-hidden rounded-[30px] border border-border bg-white shadow-[0_24px_70px_rgba(35,16,55,0.13)]">
      <div
        className={`relative h-[210px] overflow-hidden bg-gradient-to-br ${coverClass}`}
      >
        {data.cover.imageUrl.trim() && (
          <img
            src={data.cover.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-black/10" />

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "15px 15px",
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
          <span className="w-fit rounded-full bg-white/15 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] backdrop-blur-md">
            {data.cover.label || "Uyumluluk"}
          </span>

          <div>
            <span className="text-5xl">♥</span>

            <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.13em] text-white/70">
              AQRY Experience
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h1 className="text-[30px] font-black leading-[0.98] tracking-[-0.055em]">
          {data.title}
        </h1>

        <p className="mt-4 text-[12px] leading-5 text-muted-foreground">
          {data.description}
        </p>

        <div className="mt-5 flex items-center justify-between rounded-[17px] border border-border bg-background px-4 py-3">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-primary">
              Deneyim
            </p>

            <p className="mt-1 text-[10px] font-black">
              {data.questions.length} soru
            </p>
          </div>

          <span className="text-xl">♥</span>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-black text-[10px] font-bold text-white transition hover:bg-primary"
        >
          Başla →
        </button>
      </div>
    </article>
  );
}

function QuestionScreen({
  question,
  questionIndex,
  questionCount,
  selectedAnswer,
  progress,
  onSelectAnswer,
  onPrevious,
  onNext,
}: {
  question: Question;
  questionIndex: number;
  questionCount: number;
  selectedAnswer?: number;
  progress: number;
  onSelectAnswer: (optionIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <article className="rounded-[30px] border border-border bg-white p-5 shadow-[0_24px_70px_rgba(35,16,55,0.12)] sm:p-6">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-primary">
          {questionIndex + 1}/{questionCount}
        </span>

        <span className="text-[8px] font-semibold text-muted-foreground">
          Uyum deneyimi
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <h2 className="mt-7 text-[23px] font-black leading-[1.08] tracking-[-0.045em]">
        {question.text}
      </h2>

      <div className="mt-6 grid gap-2.5">
        {question.options.map((option, optionIndex) => {
          const isSelected =
            selectedAnswer === optionIndex;

          return (
            <button
              key={`${question.id}-${optionIndex}`}
              type="button"
              onClick={() =>
                onSelectAnswer(optionIndex)
              }
              className={`flex min-h-12 items-center gap-3 rounded-[16px] border px-4 py-3 text-left text-[11px] font-bold transition ${
                isSelected
                  ? "border-primary bg-primary text-white shadow-[0_10px_25px_rgba(124,58,237,0.18)]"
                  : "border-border bg-background text-foreground hover:border-primary/35"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-black ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-white text-muted-foreground"
                }`}
              >
                {String.fromCharCode(65 + optionIndex)}
              </span>

              <span>{option}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrevious}
          className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-white px-5 text-[9px] font-bold"
        >
          ← Geri
        </button>

        <button
          type="button"
          disabled={selectedAnswer === undefined}
          onClick={onNext}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-black px-6 text-[9px] font-bold text-white transition enabled:hover:bg-primary disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-muted-foreground"
        >
          {questionIndex === questionCount - 1
            ? "Sonucumu gör →"
            : "Devam et →"}
        </button>
      </div>
    </article>
  );
}

function ResultScreen({
  score,
  result,
  offerEnabled,
  onContinue,
  onRestart,
}: {
  score: number;
  result: ResultDefinition;
  offerEnabled: boolean;
  onContinue: () => void;
  onRestart: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-[30px] border border-border bg-white shadow-[0_24px_70px_rgba(35,16,55,0.13)]">
      <div className="bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 p-7 text-white">
        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/70">
          Uyum sonucun
        </p>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[64px] font-black leading-none tracking-[-0.08em]">
              %{score}
            </p>

            <h2 className="mt-3 text-[22px] font-black tracking-[-0.04em]">
              {result.title}
            </h2>
          </div>

          <span className="text-5xl">♥</span>
        </div>

        <p className="mt-5 text-[12px] leading-5 text-white/85">
          {result.description}
        </p>
      </div>

      <div className="p-6">
        <div className="rounded-[17px] border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-[10px] font-black text-emerald-900">
            Ücretsiz sonucun tamamlandı
          </p>

          <p className="mt-1 text-[9px] leading-4 text-emerald-700">
            Bu sonuç için ödeme yapman gerekmez.
          </p>
        </div>

        {offerEnabled && (
          <button
            type="button"
            onClick={onContinue}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-black text-[10px] font-bold text-white transition hover:bg-primary"
          >
            Teklifi gör →
          </button>
        )}

        <button
          type="button"
          onClick={onRestart}
          className="mt-2 flex h-11 w-full items-center justify-center rounded-full border border-border bg-white text-[9px] font-bold text-muted-foreground"
        >
          Baştan çöz
        </button>
      </div>
    </article>
  );
}

function OfferScreen({
  offer,
  onBack,
}: {
  offer: PreviewData["offer"];
  onBack: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-[30px] border border-border bg-white shadow-[0_24px_70px_rgba(35,16,55,0.13)]">
      <div className="bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 p-7 text-white">
        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/70">
          Sonucundan sonra
        </p>

        <div className="mt-10">
          <span className="text-5xl">✦</span>

          <h2 className="mt-5 text-[28px] font-black leading-[1] tracking-[-0.05em]">
            {offer.title}
          </h2>

          <p className="mt-4 text-[12px] leading-5 text-white/80">
            {offer.description}
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between rounded-[18px] border border-border bg-background p-4">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Teklif fiyatı
            </p>

            <p className="mt-1 text-[22px] font-black">
              9 TL
            </p>
          </div>

          <span className="rounded-full bg-primary/[0.08] px-3 py-1.5 text-[8px] font-bold text-primary">
            Tek seferlik
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            window.alert(
              "Bu bir ön izlemedir. Gerçek ödeme alınmayacak.",
            )
          }
          className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-black text-[10px] font-bold text-white transition hover:bg-primary"
        >
          9 TL ile aç
        </button>

        <button
          type="button"
          onClick={onBack}
          className="mt-2 flex h-11 w-full items-center justify-center rounded-full border border-border bg-white text-[9px] font-bold text-muted-foreground"
        >
          Ücretsiz sonucuma dön
        </button>
      </div>
    </article>
  );
}

function calculateCompatibilityScore(
  questions: Question[],
  creatorAnswers: Record<number, number>,
  participantAnswers: Record<number, number>,
) {
  if (questions.length === 0) {
    return 0;
  }

  const comparableQuestions = questions.filter(
    (question) =>
      creatorAnswers[question.id] !== undefined &&
      participantAnswers[question.id] !== undefined,
  );

  if (comparableQuestions.length === 0) {
    return 0;
  }

  const matchingAnswers = comparableQuestions.filter(
    (question) =>
      creatorAnswers[question.id] ===
      participantAnswers[question.id],
  ).length;

  return Math.round(
    (matchingAnswers / comparableQuestions.length) * 100,
  );
}

function findResult(
  score: number,
  results: ResultDefinition[],
) {
  if (score >= 80) {
    return results[0];
  }

  if (score >= 60) {
    return results[1];
  }

  if (score >= 40) {
    return results[2];
  }

  return results[3];
}

function getCoverClass(style: CoverStyle) {
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