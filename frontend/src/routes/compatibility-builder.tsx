import {
  getCurrentCreator,
  signOutCreator,
} from "@/services/auth";
import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { savePublishedExperience } from "@/services/experiences";
import { CreatorNavigation } from "@/components/CreatorNavigation";
import { ImageUploader } from "@/components/creator/ImageUploader";
export const Route = createFileRoute("/compatibility-builder")({
  component: CompatibilityBuilderPage,
});

type BuilderPanel = "content" | "answers" | "result" | "offer" | "preview";
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

const STANDARD_OFFER_PRICE = 9;
const BUILDER_STORAGE_KEY = "aqry-compatibility-builder-v2";
const initialQuestions: Question[] = [
  {
    id: 1,
    text: "",
    options: ["", "", "", ""],
  },
  {
    id: 2,
    text: "",
    options: ["", "", "", ""],
  },
  {
    id: 3,
    text: "",
    options: ["", "", "", ""],
  },
];

const QUESTION_EXAMPLES = [
  "Örn. Bir ilişkide sana en çok ne güven verir?",
  "Örn. Bir tartışma çıktığında nasıl davranırsın?",
  "Örn. Birlikte geçirilen ideal bir gün senin için nasıl olur?",
];

const TOPIC_IDEAS = [
  "Aşk & ilişki",
  "Arkadaşlık",
  "Zevkler",
  "İletişim",
  "Günlük alışkanlıklar",
  "Gelecek beklentileri",
];

const initialResults: ResultDefinition[] = [
  {
    id: "strong",
    range: "%80–100",
    title: "Güçlü uyum",
    description:
      "İletişim ve ilişki beklentileriniz büyük ölçüde uyuşuyor. Ortak bir ritim yakalama ihtimaliniz oldukça yüksek.",
  },
  {
    id: "good",
    range: "%60–79",
    title: "İyi uyum",
    description:
      "Birçok konuda benzer düşünüyorsunuz. Bazı farklılıklarınız ilişkinizi daha ilgi çekici hâle getirebilir.",
  },
  {
    id: "mixed",
    range: "%40–59",
    title: "Karışık uyum",
    description:
      "Bazı güçlü ortak noktalarınız var ancak ilişki beklentileriniz belirli konularda ayrışıyor.",
  },
  {
    id: "different",
    range: "%0–39",
    title: "Farklı dünyalar",
    description:
      "İlişki yaklaşımınız ve beklentileriniz birçok konuda farklı. Birbirinizi anlamak için daha fazla iletişim gerekebilir.",
  },
];

function CompatibilityBuilderPage() {
  const [activePanel, setActivePanel] =
    useState<BuilderPanel>("content");

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [questions, setQuestions] =
    useState<Question[]>(initialQuestions);

  const [creatorAnswers, setCreatorAnswers] = useState<
    Record<number, number>
  >({});

  const [answersLocked, setAnswersLocked] = useState(false);

  const [coverStyle, setCoverStyle] =
    useState<CoverStyle>("pink");

  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverLabel, setCoverLabel] = useState("Uyumluluk");

  const [results, setResults] =
    useState<ResultDefinition[]>(initialResults);

  const [offerEnabled, setOfferEnabled] = useState(true);

  const [offerTitle, setOfferTitle] = useState(
    "Detaylı uyum haritanı gör",
  );

  const [offerDescription, setOfferDescription] = useState(
    "Hangi konularda uyuştuğunuzu ve hangi alanlarda farklılaştığınızı gör.",
  );
  const offerPrice = STANDARD_OFFER_PRICE;

  const [builderLoaded, setBuilderLoaded] = useState(false);

  const [
    sourceExperienceId,
    setSourceExperienceId,
  ] = useState<string | null>(null);

  const builderSteps: BuilderPanel[] = [
    "content",
    "answers",
    "result",
    "offer",
    "preview",
  ];

  const [maxVisitedStep, setMaxVisitedStep] =
    useState(0);
  const [guidance, setGuidance] = useState<
    "answers" | "result" | "offer" | null
  >(null);

  const [previewStarted, setPreviewStarted] =
    useState(false);
  const [previewQuestionIndex, setPreviewQuestionIndex] =
    useState(0);
  const [previewAnswers, setPreviewAnswers] = useState<
    Record<number, number>
  >({});
  const [previewFinished, setPreviewFinished] =
    useState(false);

  useEffect(() => {
    const storedBuilderData = window.sessionStorage.getItem(
      BUILDER_STORAGE_KEY,
    );

    if (!storedBuilderData) {
      setBuilderLoaded(true);
      return;
    }

    try {
      const savedData = JSON.parse(storedBuilderData) as {
        title?: string;
        description?: string;
        questions?: Question[];
        creatorAnswers?: Record<number, number>;
        answersLocked?: boolean;
        coverStyle?: CoverStyle;
        coverImageUrl?: string;
        coverLabel?: string;
        results?: ResultDefinition[];
        offerEnabled?: boolean;
        offerTitle?: string;
        offerDescription?: string;
        sourceExperienceId?: string;
      };

      if (typeof savedData.title === "string") {
        setTitle(savedData.title);
      }

      if (typeof savedData.description === "string") {
        setDescription(savedData.description);
      }

      if (
        Array.isArray(savedData.questions) &&
        savedData.questions.length >= 2
      ) {
        setQuestions(savedData.questions);
      }

      if (
        savedData.creatorAnswers &&
        typeof savedData.creatorAnswers === "object"
      ) {
        setCreatorAnswers(savedData.creatorAnswers);
      }

      if (typeof savedData.answersLocked === "boolean") {
        setAnswersLocked(savedData.answersLocked);
      }

      if (
        savedData.coverStyle === "pink" ||
        savedData.coverStyle === "purple" ||
        savedData.coverStyle === "blue" ||
        savedData.coverStyle === "dark"
      ) {
        setCoverStyle(savedData.coverStyle);
      }

      if (typeof savedData.coverImageUrl === "string") {
        setCoverImageUrl(savedData.coverImageUrl);
      }

      if (typeof savedData.coverLabel === "string") {
        setCoverLabel(savedData.coverLabel);
      }

      if (
        Array.isArray(savedData.results) &&
        savedData.results.length > 0
      ) {
        setResults(savedData.results);
      }

      if (typeof savedData.offerEnabled === "boolean") {
        setOfferEnabled(savedData.offerEnabled);
      }

      if (typeof savedData.offerTitle === "string") {
        setOfferTitle(savedData.offerTitle);
      }

      if (typeof savedData.offerDescription === "string") {
        setOfferDescription(savedData.offerDescription);
      }


      if (
        typeof savedData.sourceExperienceId ===
        "string"
      ) {
        setSourceExperienceId(
          savedData.sourceExperienceId,
        );
      }
    } catch {
      window.sessionStorage.removeItem(
        BUILDER_STORAGE_KEY,
      );
    } finally {
      setBuilderLoaded(true);
    }
  }, []);
useEffect(() => {
  let cancelled = false;

  async function protectBuilder() {
    const creator = await getCurrentCreator();

    if (!creator && !cancelled) {
      window.location.href = "/creator-auth";
    }
  }

  void protectBuilder();

  return () => {
    cancelled = true;
  };
}, []);
  useEffect(() => {
    if (!builderLoaded) {
      return;
    }

    const builderData = {
      title,
      description,
      questions,
      creatorAnswers,
      answersLocked,
      coverStyle,
      coverImageUrl,
      coverLabel,
      results,
      offerEnabled,
      offerTitle,
      offerDescription,
      offerPrice,
      sourceExperienceId,
    };

    window.sessionStorage.setItem(
      BUILDER_STORAGE_KEY,
      JSON.stringify(builderData),
    );
  }, [
    builderLoaded,
    title,
    description,
    questions,
    creatorAnswers,
    answersLocked,
    coverStyle,
    coverImageUrl,
    coverLabel,
    results,
    offerEnabled,
    offerTitle,
    offerDescription,
    offerPrice,
    sourceExperienceId,
  ]);

  const answeredCount = questions.filter(
    (question) => creatorAnswers[question.id] !== undefined,
  ).length;
 
  const allAnswersSelected =
    questions.length > 0 && answeredCount === questions.length;

  const questionsAreValid = questions.every(
    (question) =>
      question.text.trim().length > 0 &&
      question.options.length >= 2 &&
      question.options.every(
        (option) => option.trim().length > 0,
      ),
  );

  const resultsAreValid = results.every(
    (result) =>
      result.title.trim().length > 0 &&
      result.description.trim().length > 0,
  );

  const offerIsValid =
    !offerEnabled ||
    (offerTitle.trim().length > 0 &&
      offerDescription.trim().length > 0);

  const canPublish = useMemo(
    () =>
      title.trim().length > 0 &&
      description.trim().length > 0 &&
      questions.length >= 2 &&
      questionsAreValid &&
      allAnswersSelected &&
      answersLocked &&
      resultsAreValid &&
      offerIsValid,
    [
      allAnswersSelected,
      answersLocked,
      description,
      offerIsValid,
      questions.length,
      questionsAreValid,
      resultsAreValid,
      title,
    ],
  );

  function invalidateLockedAnswers() {
    setAnswersLocked(false);
  }

  function updateQuestionText(
    questionId: number,
    value: string,
  ) {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? { ...question, text: value }
          : question,
      ),
    );

    invalidateLockedAnswers();
  }

  function updateOption(
    questionId: number,
    optionIndex: number,
    value: string,
  ) {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        return {
          ...question,
          options: question.options.map(
            (option, currentOptionIndex) =>
              currentOptionIndex === optionIndex
                ? value
                : option,
          ),
        };
      }),
    );

    setCreatorAnswers((currentAnswers) => {
      const nextAnswers = { ...currentAnswers };
      delete nextAnswers[questionId];
      return nextAnswers;
    });

    invalidateLockedAnswers();
  }

  function addQuestion() {
    const nextId =
      questions.length === 0
        ? 1
        : Math.max(
            ...questions.map((question) => question.id),
          ) + 1;

    setQuestions((currentQuestions) => [
      ...currentQuestions,
      {
        id: nextId,
        text: "",
        options: ["", "", "", ""],
      },
    ]);

    invalidateLockedAnswers();

    window.setTimeout(() => {
      document
        .getElementById(`question-${nextId}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 100);
  }

  function removeQuestion(questionId: number) {
    if (questions.length <= 2) {
      return;
    }

    setQuestions((currentQuestions) =>
      currentQuestions.filter(
        (question) => question.id !== questionId,
      ),
    );

    setCreatorAnswers((currentAnswers) => {
      const nextAnswers = { ...currentAnswers };
      delete nextAnswers[questionId];
      return nextAnswers;
    });

    invalidateLockedAnswers();
  }

  function selectCreatorAnswer(
    questionId: number,
    optionIndex: number,
  ) {
    if (answersLocked) {
      return;
    }

    setCreatorAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: optionIndex,
    }));
  }

  function lockCreatorAnswers() {
    if (!allAnswersSelected) {
      return;
    }

    setAnswersLocked(true);
  }

  function unlockCreatorAnswers() {
    setAnswersLocked(false);
  }

  function updateResult(
    resultId: string,
    field: "title" | "description",
    value: string,
  ) {
    setResults((currentResults) =>
      currentResults.map((result) =>
        result.id === resultId
          ? { ...result, [field]: value }
          : result,
      ),
    );
  }


  const activeStepIndex = builderSteps.indexOf(activePanel);

  function openStep(step: BuilderPanel) {
    const nextIndex = builderSteps.indexOf(step);
    if (nextIndex > maxVisitedStep) {
      return;
    }
    setActivePanel(step);
  }

  function continueFromContent() {
    if (!questionsAreValid || !title.trim() || !description.trim()) {
      window.alert("Devam etmeden önce başlık, açıklama, sorular ve seçenekler eksiksiz olmalı.");
      return;
    }
    setGuidance("answers");
  }

  function continueFromAnswers() {
    if (!allAnswersSelected) {
      window.alert("Devam etmeden önce her soru için kendi cevabını seç.");
      return;
    }
    if (!answersLocked) {
      setAnswersLocked(true);
    }
    setGuidance("result");
  }

  function continueFromResult() {
    if (!resultsAreValid) {
      window.alert("Devam etmeden önce sonuç başlıklarını ve açıklamalarını tamamla.");
      return;
    }
    setGuidance("offer");
  }

  function continueFromOffer() {
    if (!offerIsValid) {
      window.alert("Offer açıksa başlık ve açıklamayı tamamla.");
      return;
    }
    setMaxVisitedStep((current) => Math.max(current, 4));
    setActivePanel("preview");
  }

  function confirmGuidance() {
    if (!guidance) return;
    const target: BuilderPanel = guidance;
    const index = builderSteps.indexOf(target);
    setMaxVisitedStep((current) => Math.max(current, index));
    setActivePanel(target);
    setGuidance(null);
  }

  function goBack() {
    if (activeStepIndex <= 0) return;
    setActivePanel(builderSteps[activeStepIndex - 1]);
  }

  function startSelfPreview() {
    setPreviewStarted(true);
    setPreviewQuestionIndex(0);
    setPreviewAnswers({});
    setPreviewFinished(false);
  }

  function selectPreviewAnswer(optionIndex: number) {
    const question = questions[previewQuestionIndex];
    if (!question) return;

    setPreviewAnswers((current) => ({
      ...current,
      [question.id]: optionIndex,
    }));

    window.setTimeout(() => {
      const isLast = previewQuestionIndex === questions.length - 1;
      if (isLast) {
        setPreviewFinished(true);
        return;
      }
      setPreviewQuestionIndex((current) => current + 1);
    }, 220);
  }

  const previewScore = questions.length
    ? Math.round(
        (questions.filter(
          (question) =>
            previewAnswers[question.id] !== undefined &&
            previewAnswers[question.id] === creatorAnswers[question.id],
        ).length /
          questions.length) *
          100,
      )
    : 0;

  const previewResult =
    results.find((result) => {
      const numbers = result.range.match(/\d+/g)?.map(Number) ?? [];
      const min = numbers[0] ?? 0;
      const max = numbers[1] ?? 100;
      return previewScore >= min && previewScore <= max;
    }) ?? results[0];

  function handlePreview() {
  const previewData = {
    title,
    description,
    cover: {
      style: coverStyle,
      imageUrl: coverImageUrl,
      label: coverLabel,
    },
    questions,
    creatorAnswers,
    results,
    offer: {
      enabled: offerEnabled,
      title: offerTitle,
      description: offerDescription,
      price: offerPrice,
    },
  };

  window.sessionStorage.setItem(
    "aqry-compatibility-preview",
    JSON.stringify(previewData),
  );

  window.location.href = "/compatibility-preview";
}

async function handlePublish() {
  if (!canPublish) {
    return;
  }
const creator = await getCurrentCreator();

if (!creator) {
  window.location.href = "/creator-auth";
  return;
}
  const experienceId = crypto.randomUUID();
const publishedExperience = {
  id: experienceId,
  creatorId: creator.id,
  type: "compatibility",
    status: "published",
    publishedAt: new Date().toISOString(),
    title,
    description,
    cover: {
      style: coverStyle,
      imageUrl: coverImageUrl,
      label: coverLabel,
    },
    questions,
    creatorAnswers,
    results,
    offer: {
      enabled: offerEnabled,
      title: offerTitle,
      description: offerDescription,
      price: offerPrice,
    },
  };

  try {
    await savePublishedExperience(publishedExperience);

    const storageKey = "aqry-published-experiences";

    const storedExperiences =
      window.localStorage.getItem(storageKey);

    let experiences: Record<string, unknown> = {};

    if (storedExperiences) {
      try {
        experiences = JSON.parse(
          storedExperiences,
        ) as Record<string, unknown>;
      } catch {
        experiences = {};
      }
    }

    experiences[experienceId] = publishedExperience;

    window.localStorage.setItem(
      storageKey,
      JSON.stringify(experiences),
    );

    window.sessionStorage.removeItem(
      BUILDER_STORAGE_KEY,
    );

    window.location.href =
      `/publish-success/${experienceId}`;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Experience yayınlanamadı.";

    window.alert(message);
    console.error(error);
  }
}

return (
  <div className="min-h-screen bg-[#faf8fb] text-foreground">
    <CreatorNavigation
      onSignOut={async () => {
        await signOutCreator();
        window.location.href = "/creator-auth";
      }}
    />

    <header className="sticky top-16 z-30 border-b border-border/80 bg-[#faf8fb]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[58px] max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-7">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary">
            {sourceExperienceId
              ? "Yeni sürüm oluşturuluyor"
              : "Bana ne kadar yakınsın?"}
          </p>
          <p className="truncate text-[11px] font-bold">{title}</p>
        </div>

        <Link
          to="/creator-studio"
          className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-white px-4 text-[9px] font-bold text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          Studio’ya dön
        </Link>
      </div>
    </header>

    {sourceExperienceId && (
      <div className="border-b border-amber-200 bg-amber-50">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-2.5 text-[9px] sm:px-7">
          <p className="font-bold text-amber-900">
            Yayındaki Experience değişmeyecek. Bu düzenlemeler yeni bir sürüm olarak yayınlanacak.
          </p>
          <button
            type="button"
            onClick={() => setSourceExperienceId(null)}
            className="shrink-0 font-black text-amber-700"
          >
            Yeni içerik olarak devam et
          </button>
        </div>
      </div>
    )}

    <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[210px_minmax(0,1fr)_330px]">
      <aside className="sticky top-[58px] z-20 border-b border-border bg-[#faf8fb]/95 px-3 py-3 backdrop-blur-xl lg:h-[calc(100vh-58px)] lg:self-start lg:border-b-0 lg:border-r lg:bg-white/60 lg:py-5">
        <p className="mb-3 hidden px-3 text-[8px] font-black uppercase tracking-[0.16em] text-muted-foreground lg:block">
          Oluşturma akışı
        </p>
        <nav className="grid grid-cols-5 gap-1.5 lg:grid-cols-1">
          {builderSteps.map((step, index) => (
            <BuilderTab
              key={step}
              active={activePanel === step}
              label={
                step === "content"
                  ? "İçerik"
                  : step === "answers"
                    ? "Cevapların"
                    : step === "result"
                      ? "Sonuç"
                      : step === "offer"
                        ? "Kazanç"
                        : "Önizleme"
              }
              icon={String(index + 1)}
              completed={index < activeStepIndex}
              disabled={index > maxVisitedStep}
              onClick={() => openStep(step)}
            />
          ))}
        </nav>

        <div className="mt-5 hidden rounded-[18px] border border-border bg-white p-4 lg:block">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary">
            İlerleme
          </p>
          <div className="mt-3 space-y-2">
            <StatusRow completed={questionsAreValid} label={`${questions.length} soru hazır`} />
            <StatusRow completed={allAnswersSelected} label={`Kendi cevapların ${answeredCount}/${questions.length}`} />
            <StatusRow completed={resultsAreValid} label="Sonuçlar hazır" />
            <StatusRow completed={offerIsValid} label="Kazanç ayarı hazır" />
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
        {activePanel === "content" && (
          <>
            <ContentEditor
              title={title}
              description={description}
              questions={questions}
              coverStyle={coverStyle}
              coverImageUrl={coverImageUrl}
              coverLabel={coverLabel}
              setTitle={setTitle}
              setDescription={setDescription}
              setCoverStyle={setCoverStyle}
              setCoverImageUrl={setCoverImageUrl}
              setCoverLabel={setCoverLabel}
              updateQuestionText={updateQuestionText}
              updateOption={updateOption}
              addQuestion={addQuestion}
              removeQuestion={removeQuestion}
            />
            <WizardFooter onNext={continueFromContent} />
          </>
        )}

        {activePanel === "answers" && (
          <>
            <CreatorAnswersEditor
              questions={questions}
              creatorAnswers={creatorAnswers}
              answeredCount={answeredCount}
              answersLocked={answersLocked}
              selectCreatorAnswer={selectCreatorAnswer}
              lockCreatorAnswers={lockCreatorAnswers}
              unlockCreatorAnswers={unlockCreatorAnswers}
            />
            <WizardFooter onBack={goBack} onNext={continueFromAnswers} />
          </>
        )}

        {activePanel === "result" && (
          <>
            <ResultEditor results={results} updateResult={updateResult} />
            <WizardFooter onBack={goBack} onNext={continueFromResult} />
          </>
        )}

        {activePanel === "offer" && (
          <>
            <OfferEditor
              enabled={offerEnabled}
              title={offerTitle}
              description={offerDescription}
              price={offerPrice}
              setEnabled={setOfferEnabled}
              setTitle={setOfferTitle}
              setDescription={setOfferDescription}
            />
            <WizardFooter onBack={goBack} onNext={continueFromOffer} />
          </>
        )}

        {activePanel === "preview" && (
          <SelfPreview
            title={title}
            description={description}
            questions={questions}
            creatorAnswers={creatorAnswers}
            offerEnabled={offerEnabled}
            offerTitle={offerTitle}
            offerDescription={offerDescription}
            offerPrice={offerPrice}
            started={previewStarted}
            questionIndex={previewQuestionIndex}
            answers={previewAnswers}
            finished={previewFinished}
            score={previewScore}
            result={previewResult}
            onStart={startSelfPreview}
            onSelect={selectPreviewAnswer}
            onPrevious={() => {
              if (previewQuestionIndex > 0) {
                setPreviewQuestionIndex((current) => current - 1);
                setPreviewFinished(false);
              }
            }}
            onReset={startSelfPreview}
          />
        )}

        {activePanel === "preview" && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <button type="button" onClick={goBack} className="h-11 rounded-full border border-border bg-white px-5 text-[10px] font-bold">
              ← Geri
            </button>
            <button
              type="button"
              disabled={!canPublish}
              onClick={handlePublish}
              className="h-11 rounded-full bg-black px-7 text-[10px] font-black text-white transition enabled:hover:bg-primary disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-muted-foreground"
            >
              {sourceExperienceId ? "Yeni sürümü yayınla" : "Yayınla"}
            </button>
          </div>
        )}
      </main>

      <aside className="hidden border-l border-border bg-white/60 p-5 lg:block">
        <LivePreview
          title={title}
          description={description}
          questionCount={questions.length}
          coverStyle={coverStyle}
          coverImageUrl={coverImageUrl}
          coverLabel={coverLabel}
        />
      </aside>
    </div>

    {guidance && (
      <GuidanceModal
        step={guidance}
        onClose={() => setGuidance(null)}
        onConfirm={confirmGuidance}
      />
    )}
  </div>
);
}
function BuilderTab({
  active,
  icon,
  label,
  status,
  completed = false,
  disabled = false,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  status?: string;
  completed?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-w-0 items-center justify-center gap-2 rounded-[13px] px-2 py-2.5 text-[9px] font-bold transition lg:justify-start lg:px-3 ${
        active
          ? "bg-primary text-white shadow-[0_8px_20px_rgba(124,58,237,0.16)]"
          : disabled
            ? "cursor-not-allowed border border-border bg-white/60 text-muted-foreground/45"
            : "border border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-foreground"
      }`}
    >
      <span className="text-xs">
        {completed ? "✓" : icon}
      </span>

      <span className="truncate">{label}</span>

      {status && (
        <span
          className={`ml-auto hidden rounded-full px-2 py-0.5 text-[7px] lg:inline ${
            active
              ? "bg-white/15 text-white"
              : completed
                ? "bg-emerald-50 text-emerald-600"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {status}
        </span>
      )}
    </button>
  );
}

function StatusRow({
  completed,
  label,
}: {
  completed: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[9px]">
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full text-[7px] font-black ${
          completed
            ? "bg-emerald-500 text-white"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {completed ? "✓" : "•"}
      </span>

      <span
        className={
          completed
            ? "font-semibold text-foreground"
            : "text-muted-foreground"
        }
      >
        {label}
      </span>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-primary">
        {eyebrow}
      </p>

      <h1 className="mt-1.5 text-[27px] font-black leading-none tracking-[-0.05em]">
        {title}
      </h1>

      <p className="mt-2 max-w-[660px] text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ContentEditor({
  title,
  description,
  questions,
  coverStyle,
  coverImageUrl,
  coverLabel,
  setTitle,
  setDescription,
  setCoverStyle,
  setCoverImageUrl,
  setCoverLabel,
  updateQuestionText,
  updateOption,
  addQuestion,
  removeQuestion,
}: {
  title: string;
  description: string;
  questions: Question[];
  coverStyle: CoverStyle;
  coverImageUrl: string;
  coverLabel: string;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setCoverStyle: (value: CoverStyle) => void;
  setCoverImageUrl: (value: string) => void;
  setCoverLabel: (value: string) => void;
  updateQuestionText: (
    questionId: number,
    value: string,
  ) => void;
  updateOption: (
    questionId: number,
    optionIndex: number,
    value: string,
  ) => void;
  addQuestion: () => void;
  removeQuestion: (questionId: number) => void;
}) {
  const coverClass = getCoverClass(coverStyle);

  return (
    <section>
      <SectionHeader
        eyebrow="İçerik"
        title="Şablonu kendi içeriğine dönüştür"
        description="Kapağı, başlığı, açıklamayı, soruları ve cevap seçeneklerini doğrudan düzenle."
      />

      <div className="mt-5 grid gap-4">
        <div className="rounded-[22px] border border-border bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black">Kapak</p>

              <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                Katılımcının AQRY’ye girdiğinde ilk göreceği
                görsel alanı düzenle.
              </p>
            </div>

            <button
              type="button"
              className="shrink-0 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1.5 text-[8px] font-bold text-primary"
            >
              ✦ AI ile kapak üret
            </button>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[230px_minmax(0,1fr)]">
            <div
              className={`relative h-[170px] overflow-hidden rounded-[20px] bg-gradient-to-br ${coverClass}`}
            >
              {coverImageUrl.trim() && (
                <img
                  src={coverImageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}

              <div className="absolute inset-0 bg-black/10" />

              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "14px 14px",
                }}
              />

              <div className="relative z-10 flex h-full flex-col justify-between p-4 text-white">
                <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-[8px] font-bold uppercase tracking-[0.12em] backdrop-blur-md">
                  {coverLabel || "Uyumluluk"}
                </span>

                <div>
                  <span className="text-3xl">♥</span>

                  <p className="mt-2 text-xs font-black">
                    {title || "AQRY başlığı"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <p className="text-[10px] font-bold">
                  Kapak stili
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      {
                        id: "pink",
                        label: "Pembe",
                        className:
                          "from-fuchsia-500 via-pink-500 to-rose-500",
                      },
                      {
                        id: "purple",
                        label: "Mor",
                        className:
                          "from-violet-600 via-purple-600 to-fuchsia-500",
                      },
                      {
                        id: "blue",
                        label: "Mavi",
                        className:
                          "from-cyan-500 via-blue-500 to-indigo-600",
                      },
                      {
                        id: "dark",
                        label: "Koyu",
                        className:
                          "from-slate-900 via-zinc-800 to-black",
                      },
                    ] as const
                  ).map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() =>
                        setCoverStyle(style.id)
                      }
                      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[9px] font-bold transition ${
                        coverStyle === style.id
                          ? "border-primary bg-primary/[0.04] text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`h-4 w-4 rounded-full bg-gradient-to-br ${style.className}`}
                      />

                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <label>
                <span className="text-[10px] font-bold">
                  Kapak etiketi
                </span>

                <input
                  type="text"
                  value={coverLabel}
                  maxLength={30}
                  onChange={(event) =>
                    setCoverLabel(event.target.value)
                  }
                  className="mt-2 h-10 w-full rounded-[14px] border border-border bg-background px-4 text-[10px] font-bold outline-none focus:border-primary"
                />
              </label>

              <ImageUploader
                value={coverImageUrl}
                onChange={setCoverImageUrl}
                label="Kapak görseli"
                helperText="JPG veya PNG yükle. Görseli 10%–300% arasında boyutlandırabilir, yatay ve dikey konumunu ayarlayabilirsin."
              />
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-primary/15 bg-primary/[0.025] p-5">
          <p className="text-sm font-black">
            Konu fikri lazım mı?
          </p>

          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
            Aşk Metre sadece romantik ilişki için değil. İki kişinin cevaplarını karşılaştırmak istediğin her konuda kullanabilirsin.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {TOPIC_IDEAS.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-primary/15 bg-white px-3 py-2 text-[11px] font-bold text-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] border border-border bg-white p-5">
          <p className="text-sm font-black">
            Genel bilgiler
          </p>

          <div className="mt-5 grid gap-4">
            <label>
              <span className="text-[10px] font-bold">
                Başlık
              </span>

              <input
                type="text"
                value={title}
                maxLength={80}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Örn. Benimle ne kadar uyumlusun?"
                className="mt-2 h-11 w-full rounded-[15px] border border-border bg-background px-4 text-sm font-bold outline-none focus:border-primary"
              />
            </label>

            <label>
              <span className="text-[10px] font-bold">
                Açıklama
              </span>

              <textarea
                value={description}
                maxLength={240}
                rows={3}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="İki kişinin aynı sorulara verdiği cevapların karşılaştırılacağını ve sonunda bir uyum sonucu göreceğini kısaca anlat."
                className="mt-2 w-full resize-none rounded-[15px] border border-border bg-background px-4 py-3 text-xs leading-5 outline-none focus:border-primary"
              />
            </label>
          </div>
        </div>

        <div className="rounded-[22px] border border-border bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black">Sorular</p>

              <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                Katılımcılar ve creator aynı alanları
                cevaplayacak.
              </p>
            </div>

            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-black px-4 text-[9px] font-bold text-white transition hover:bg-primary"
            >
              + Soru ekle
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            {questions.map((question, questionIndex) => (
              <article
                id={`question-${question.id}`}
                key={question.id}
                className="rounded-[18px] border border-border bg-background p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white">
                    {questionIndex + 1}
                  </span>

                  <input
                    type="text"
                    value={question.text}
                    onChange={(event) =>
                      updateQuestionText(
                        question.id,
                        event.target.value,
                      )
                    }
                    placeholder={
                      QUESTION_EXAMPLES[
                        questionIndex %
                          QUESTION_EXAMPLES.length
                      ]
                    }
                    className="h-9 min-w-0 flex-1 rounded-[12px] border border-border bg-white px-3 text-[11px] font-bold outline-none focus:border-primary"
                  />

                  <button
                    type="button"
                    disabled={questions.length <= 2}
                    onClick={() =>
                      removeQuestion(question.id)
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-white text-[10px] text-muted-foreground disabled:opacity-30"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {question.options.map(
                    (option, optionIndex) => (
                      <label
                        key={`${question.id}-${optionIndex}`}
                        className="flex items-center gap-2 rounded-[12px] border border-border bg-white px-3 py-2"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[7px] font-black text-muted-foreground">
                          {String.fromCharCode(
                            65 + optionIndex,
                          )}
                        </span>

                        <input
                          type="text"
                          value={option}
                          onChange={(event) =>
                            updateOption(
                              question.id,
                              optionIndex,
                              event.target.value,
                            )
                          }
                          placeholder={`Cevap ${String.fromCharCode(
                            65 + optionIndex,
                          )}`}
                          className="min-w-0 flex-1 bg-transparent text-[11px] font-semibold outline-none placeholder:text-muted-foreground/55"
                        />
                      </label>
                    ),
                  )}
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="mt-4 flex h-10 w-full items-center justify-center rounded-[14px] border border-dashed border-primary/30 bg-primary/[0.025] text-[9px] font-bold text-primary"
          >
            + Yeni soru ekle
          </button>
        </div>
      </div>
    </section>
  );
}

function CreatorAnswersEditor({
  questions,
  creatorAnswers,
  answeredCount,
  answersLocked,
  selectCreatorAnswer,
  lockCreatorAnswers,
  unlockCreatorAnswers,
}: {
  questions: Question[];
  creatorAnswers: Record<number, number>;
  answeredCount: number;
  answersLocked: boolean;
  selectCreatorAnswer: (
    questionId: number,
    optionIndex: number,
  ) => void;
  lockCreatorAnswers: () => void;
  unlockCreatorAnswers: () => void;
}) {
  const allAnswersSelected =
    questions.length > 0 && answeredCount === questions.length;

  return (
    <section className="pb-28">
      <SectionHeader
        eyebrow="Creator cevapları"
        title="Önce sen cevapla"
        description="Katılımcıların cevapları bu referans cevaplarla karşılaştırılacak."
      />

      <div className="mt-5 rounded-[18px] border border-primary/15 bg-primary/[0.04] p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black">
              Karşılaştırma profilin
            </p>

            <p className="mt-1 text-[9px] text-muted-foreground">
              {answersLocked
                ? "Cevapların kilitlendi ve karşılaştırmaya hazır."
                : allAnswersSelected
                  ? "Tüm cevapların hazır. Şimdi cevaplarını kilitle."
                  : "Devam etmek için tüm alanları cevapla."}
            </p>
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-[9px] font-black text-primary shadow-sm">
            {answeredCount}/{questions.length}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {questions.map((question, questionIndex) => {
          const selectedOption =
            creatorAnswers[question.id];

          return (
            <article
              key={question.id}
              className={`rounded-[20px] border p-4 transition ${
                selectedOption !== undefined
                  ? "border-primary/30 bg-primary/[0.025]"
                  : "border-border bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                    selectedOption !== undefined
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {questionIndex + 1}
                </span>

                <p className="pt-1 text-[11px] font-black leading-4">
                  {question.text}
                </p>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {question.options.map(
                  (option, optionIndex) => {
                    const isSelected =
                      selectedOption === optionIndex;

                    return (
                      <button
                        key={`${question.id}-${optionIndex}`}
                        type="button"
                        disabled={answersLocked}
                        onClick={() =>
                          selectCreatorAnswer(
                            question.id,
                            optionIndex,
                          )
                        }
                        className={`rounded-[13px] border px-3 py-2.5 text-left text-[10px] font-bold transition ${
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-white text-muted-foreground"
                        } ${
                          answersLocked
                            ? "cursor-not-allowed"
                            : "hover:border-primary/35 hover:text-foreground"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  },
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="sticky bottom-4 z-30 mt-5 rounded-[20px] border border-border bg-white/95 p-4 shadow-[0_18px_50px_rgba(28,12,46,0.14)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-black">
              {answersLocked
                ? "Karşılaştırma profilin hazır"
                : allAnswersSelected
                  ? "7/7 cevap tamamlandı"
                  : `${answeredCount}/${questions.length} cevap tamamlandı`}
            </p>

            <p className="mt-1 text-[9px] text-muted-foreground">
              {answersLocked
                ? "Yayınlamadan önce istersen kilidi açıp cevaplarını değiştirebilirsin."
                : allAnswersSelected
                  ? "Bu cevaplar katılımcılarla yapılacak karşılaştırmanın temeli olacak."
                  : "Cevaplarını kilitlemek için tüm alanları tamamla."}
            </p>
          </div>

          {answersLocked ? (
            <button
              type="button"
              onClick={unlockCreatorAnswers}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-border bg-white px-5 text-[9px] font-bold text-foreground transition hover:border-primary hover:text-primary"
            >
              Kilidi aç
            </button>
          ) : (
            <button
              type="button"
              disabled={!allAnswersSelected}
              onClick={lockCreatorAnswers}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-black px-6 text-[9px] font-bold text-white transition enabled:hover:bg-primary disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-muted-foreground"
            >
              Cevaplarımı kilitle →
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ResultEditor({
  results,
  updateResult,
}: {
  results: ResultDefinition[];
  updateResult: (
    resultId: string,
    field: "title" | "description",
    value: string,
  ) => void;
}) {
  return (
    <section>
      <SectionHeader
        eyebrow="Ücretsiz sonuç"
        title="Katılımcı ne görecek?"
        description="Katılımcı ödeme yapmadan genel uyum yüzdesini ve tamamlanmış kısa sonucunu görür."
      />

      <div className="mt-5 grid gap-4">
        <div className="rounded-[22px] border border-border bg-white p-5">
          <div className="rounded-[20px] bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 p-5 text-white">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/70">
              Örnek katılımcı sonucu
            </p>

            <p className="mt-4 text-[42px] font-black leading-none">
              %82
            </p>

            <h3 className="mt-2 text-lg font-black">
              {results[0]?.title}
            </h3>

            <p className="mt-4 text-xs leading-5 text-white/85">
              {results[0]?.description}
            </p>
          </div>
        </div>

        <div className="rounded-[22px] border border-border bg-white p-5">
          <p className="text-sm font-black">
            Sonuç aralıkları
          </p>

          <div className="mt-4 grid gap-3">
            {results.map((result) => (
              <article
                key={result.id}
                className="rounded-[16px] border border-border bg-background p-4"
              >
                <p className="text-[9px] font-bold text-primary">
                  {result.range}
                </p>

                <input
                  type="text"
                  value={result.title}
                  onChange={(event) =>
                    updateResult(
                      result.id,
                      "title",
                      event.target.value,
                    )
                  }
                  className="mt-2 h-9 w-full rounded-[12px] border border-border bg-white px-3 text-[10px] font-black outline-none focus:border-primary"
                />

                <textarea
                  value={result.description}
                  rows={2}
                  onChange={(event) =>
                    updateResult(
                      result.id,
                      "description",
                      event.target.value,
                    )
                  }
                  className="mt-2 w-full resize-none rounded-[12px] border border-border bg-white px-3 py-2 text-[9px] leading-4 outline-none focus:border-primary"
                />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function OfferEditor({
  enabled,
  title,
  description,
  price,
  setEnabled,
  setTitle,
  setDescription,
}: {
  enabled: boolean;
  title: string;
  description: string;
  price: number;
  setEnabled: (value: boolean) => void;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
}) {
  return (
    <section>
      <SectionHeader
        eyebrow="Teklif"
        title="Sonuçtan sonra teklif ekle"
        description="Katılımcı önce ücretsiz ve tamamlanmış sonucunu görür. Teklif daha sonra gösterilir."
      />

      <div className="mt-5 rounded-[22px] border border-border bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black">
              Teklif kullan
            </p>

            <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
              Kapalı olduğunda AQRY ücretsiz sonuçtan sonra
              tamamlanır.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${
              enabled
                ? "bg-primary"
                : "bg-muted-foreground/25"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                enabled ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>

        {enabled ? (
          <div className="mt-5 grid gap-4">
            <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[10px] font-black text-emerald-900">
                Önce ücretsiz sonuç gösterilecek
              </p>

              <p className="mt-1 text-[9px] leading-4 text-emerald-700">
                Bu teklif, katılımcı vaat edilen uyum sonucunu
                aldıktan sonra açılır.
              </p>
            </div>

            <label>
              <span className="text-[10px] font-bold">
                Teklif başlığı
              </span>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                className="mt-2 h-11 w-full rounded-[15px] border border-border bg-background px-4 text-xs font-bold outline-none focus:border-primary"
              />
            </label>

            <label>
              <span className="text-[10px] font-bold">
                Açıklama
              </span>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={3}
                className="mt-2 w-full resize-none rounded-[15px] border border-border bg-background px-4 py-3 text-xs leading-5 outline-none focus:border-primary"
              />
            </label>

            <div className="rounded-[16px] border border-primary/15 bg-primary/[0.04] px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black">
                    AQRYO standart Offer fiyatı
                  </p>
                  <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                    Fiyat tüm standart Offer’larda otomatik belirlenir.
                  </p>
                </div>

                <span className="shrink-0 text-[18px] font-black text-primary">
                  {price} TL
                </span>
              </div>
            </div>

            <div className="rounded-[20px] bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 p-5 text-white">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/70">
                Ücretsiz sonucundan sonra
              </p>

              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black">
                    {title || "Teklif başlığı"}
                  </h3>

                  <p className="mt-2 max-w-[520px] text-[10px] leading-4 text-white/80">
                    {description ||
                      "Teklif açıklaması burada görünür."}
                  </p>
                </div>

                <div className="shrink-0 rounded-[14px] bg-white px-4 py-2 text-center text-black">
                  <p className="text-[7px] font-bold uppercase text-muted-foreground">
                    Aç
                  </p>

                  <p className="mt-0.5 text-base font-black">
                    {price} TL
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[16px] bg-muted/45 p-4">
            <p className="text-[10px] font-black">
              Bu AQRY teklif içermeyecek
            </p>

            <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
              Katılımcı ücretsiz sonucunu gördüğünde AQRY
              tamamlanacak.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function LivePreview({
  title,
  description,
  questionCount,
  coverStyle,
  coverImageUrl,
  coverLabel,
}: {
  title: string;
  description: string;
  questionCount: number;
  coverStyle: CoverStyle;
  coverImageUrl: string;
  coverLabel: string;
}) {
  const coverClass = getCoverClass(coverStyle);

  return (
    <div className="sticky top-[78px]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary">
            Canlı ön izleme
          </p>

          <h2 className="mt-1 text-sm font-black">
            Katılımcı ekranı
          </h2>
        </div>

        <span className="rounded-full bg-primary/[0.08] px-3 py-1 text-[8px] font-bold text-primary">
          Mobil
        </span>
      </div>

      <div className="mx-auto mt-4 max-w-[285px] overflow-hidden rounded-[32px] border-[7px] border-black bg-white shadow-[0_18px_45px_rgba(26,10,46,0.14)]">
        <div className="flex h-[25px] items-center justify-center bg-black">
          <span className="h-1.5 w-14 rounded-full bg-white/25" />
        </div>

        <div className="min-h-[510px] bg-[#fbf8fc]">
          <div
            className={`relative h-[150px] overflow-hidden bg-gradient-to-br ${coverClass} p-5 text-white`}
          >
            {coverImageUrl.trim() && (
              <img
                src={coverImageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}

            <div className="absolute inset-0 bg-black/10" />

            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "14px 14px",
              }}
            />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-[7px] font-bold uppercase tracking-[0.12em] backdrop-blur-md">
                {coverLabel || "Uyumluluk"}
              </span>

              <div>
                <div className="text-3xl">♥</div>

                <p className="mt-2 text-[10px] font-bold text-white/75">
                  AQRY Originals
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <h3 className="text-[22px] font-black leading-[0.98] tracking-[-0.05em]">
              {title || "AQRY başlığı"}
            </h3>

            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
              {description ||
                "AQRY açıklaması burada görünecek."}
            </p>

            <div className="mt-5 rounded-[18px] border border-border bg-white p-4">
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-primary">
                {questionCount} soru
              </p>

              <p className="mt-2 text-[12px] font-black">
                Creator ile uyumunu keşfet
              </p>

              <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                Cevapların creator’ın cevaplarıyla
                karşılaştırılacak.
              </p>
            </div>

            <button
              type="button"
              className="mt-4 flex h-10 w-full items-center justify-center rounded-full bg-black text-[9px] font-bold text-white"
            >
              Başla →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function WizardFooter({
  onBack,
  onNext,
}: {
  onBack?: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-7 flex items-center justify-between gap-3 border-t border-border pt-5">
      <div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="h-11 rounded-full border border-border bg-white px-5 text-[10px] font-bold"
          >
            ← Geri
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onNext}
        className="h-11 rounded-full bg-black px-7 text-[10px] font-black text-white transition hover:bg-primary"
      >
        Sonraki →
      </button>
    </div>
  );
}

function GuidanceModal({
  step,
  onClose,
  onConfirm,
}: {
  step: "answers" | "result" | "offer";
  onClose: () => void;
  onConfirm: () => void;
}) {
  const copy =
    step === "answers"
      ? {
          title: "Şimdi kendi cevaplarını seç",
          description:
            "Katılımcıların sonuçları senin seçimlerinle karşılaştırılacak. Her soruda seni gerçekten anlatan seçeneği işaretle.",
          button: "Tamam, cevaplarımı seç",
        }
      : step === "result"
        ? {
            title: "Katılımcı finalde ne görecek?",
            description:
              "Uyum oranına göre gösterilecek sonuçları kontrol et. Sonuç ücretsiz ve tek başına anlamlı olmalı.",
            button: "Tamam, sonucu düzenle",
          }
        : {
            title: "Bu içerikten ekstra gelir elde etmek ister misin?",
            description:
              "Doğal bir ek değer varsa Offer oluştur. Yoksa kapatıp doğrudan önizlemeye geçebilirsin.",
            button: "Tamam, kazanç adımına geç",
          };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-[430px] rounded-[26px] bg-white p-6 shadow-[0_28px_90px_rgba(0,0,0,0.2)]">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-primary">
          AQRYO yönlendiriyor
        </p>
        <h2 className="mt-2 text-[24px] font-black leading-tight tracking-[-0.04em]">
          {copy.title}
        </h2>
        <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
          {copy.description}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-full px-4 text-[9px] font-bold text-muted-foreground">
            Geri dön
          </button>
          <button type="button" onClick={onConfirm} className="h-10 rounded-full bg-black px-5 text-[9px] font-black text-white">
            {copy.button}
          </button>
        </div>
      </div>
    </div>
  );
}

function SelfPreview({
  title,
  description,
  questions,
  offerEnabled,
  offerTitle,
  offerDescription,
  offerPrice,
  started,
  questionIndex,
  answers,
  finished,
  score,
  result,
  onStart,
  onSelect,
  onPrevious,
  onReset,
}: {
  title: string;
  description: string;
  questions: Question[];
  creatorAnswers: Record<number, number>;
  offerEnabled: boolean;
  offerTitle: string;
  offerDescription: string;
  offerPrice: number;
  started: boolean;
  questionIndex: number;
  answers: Record<number, number>;
  finished: boolean;
  score: number;
  result?: ResultDefinition;
  onStart: () => void;
  onSelect: (optionIndex: number) => void;
  onPrevious: () => void;
  onReset: () => void;
}) {
  const question = questions[questionIndex];

  return (
    <section>
      <SectionHeader
        eyebrow="Önizleme"
        title="Yayınlamadan önce kendin dene"
        description="Katılımcının yaşayacağı akışı bir kez çöz. İstersen testi atlayıp doğrudan yayınlayabilirsin."
      />

      {!started && (
        <div className="mt-5 rounded-[26px] border border-border bg-white p-6">
          <p className="text-[22px] font-black tracking-[-0.04em]">{title}</p>
          <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{description}</p>
          <button type="button" onClick={onStart} className="mt-6 h-11 rounded-full bg-black px-6 text-[10px] font-black text-white">
            Experience’ı dene
          </button>
        </div>
      )}

      {started && !finished && question && (
        <div className="mt-5 rounded-[26px] border border-border bg-white p-6">
          <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground">
            <span>{questionIndex + 1}/{questions.length}</span>
            <span>{Math.round(((questionIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} />
          </div>
          <h3 className="mt-6 text-[21px] font-black leading-tight tracking-[-0.035em]">{question.text}</h3>
          <div className="mt-5 grid gap-2.5">
            {question.options.map((option, optionIndex) => {
              const selected = answers[question.id] === optionIndex;
              return (
                <button
                  key={`${question.id}-${optionIndex}`}
                  type="button"
                  onClick={() => onSelect(optionIndex)}
                  className={`min-h-12 rounded-[16px] border px-4 py-3 text-left text-[11px] font-bold transition ${selected ? "border-primary bg-primary text-white" : "border-border bg-background hover:border-primary/35"}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {questionIndex > 0 && (
            <button type="button" onClick={onPrevious} className="mt-5 text-[10px] font-bold text-muted-foreground">
              ← Önceki soru
            </button>
          )}
        </div>
      )}

      {started && finished && (
        <div className="mt-5 rounded-[26px] border border-border bg-white p-6">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-primary">Sonuç</p>
          <p className="mt-2 text-[44px] font-black tracking-[-0.06em]">%{score}</p>
          <h3 className="mt-1 text-[22px] font-black tracking-[-0.04em]">{result?.title ?? "Sonuç"}</h3>
          <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{result?.description}</p>

          {offerEnabled && (
            <div className="mt-5 rounded-[20px] border border-primary/15 bg-primary/[0.035] p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-primary">Offer</p>
              <p className="mt-1 text-[13px] font-black">{offerTitle}</p>
              <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{offerDescription}</p>
              <p className="mt-3 text-[15px] font-black">{offerPrice} TL</p>
            </div>
          )}

          <button type="button" onClick={onReset} className="mt-5 h-10 rounded-full border border-border bg-white px-5 text-[9px] font-bold">
            Tekrar dene
          </button>
        </div>
      )}
    </section>
  );
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