import {
  getCurrentCreator,
  signOutCreator,
} from "@/services/auth";
import { useEffect, useMemo, useState } from "react";
import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import { savePublishedExperience } from "@/services/experiences";
import { CreatorNavigation } from "@/components/CreatorNavigation";
import { ImageUploader } from "@/components/creator/ImageUploader";

export const Route = createFileRoute(
  "/recommendation-builder",
)({
  component: RecommendationBuilderPage,
});

type BuilderPanel =
  | "content"
  | "answers"
  | "result"
  | "offer";

type TestMode =
  | "score"
  | "profile";

type CoverStyle =
  | "pink"
  | "purple"
  | "blue"
  | "dark";

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

const MAX_OFFER_PRICE = 499;
const BUILDER_STORAGE_KEY =
  "aqry-recommendation-builder";

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

const initialCorrectAnswers: Record<
  number,
  number
> = {};

const QUESTION_EXAMPLES: Record<
  TestMode,
  string[]
> = {
  score: [
    "Örn. Hangi tür seni daha çok içine çeker?",
    "Örn. Bir içerikte en çok ne ararsın?",
    "Örn. Ne kadar zaman ayırmak istersin?",
  ],
  profile: [
    "Örn. Bu akşam nasıl bir ruh hâlindesin?",
    "Örn. Tempo olarak hangisini tercih edersin?",
    "Örn. Seni en çok hangi özellik etkiler?",
  ],
};

const TOPIC_IDEAS: Record<
  TestMode,
  string[]
> = {
  score: [
    "Film",
    "Dizi",
    "Kitap",
    "Ürün",
    "Kurs",
    "Mekân",
  ],
  profile: [
    "Film / dizi",
    "Ürün",
    "Eğitim / kurs",
    "Şehir / tatil",
    "Restoran / mekân",
    "Kitap / müzik",
  ],
};

const initialResults: ResultDefinition[] = [
  {
    id: "recommendation_1",
    range: "",
    title: "",
    description: "",
  },
  {
    id: "recommendation_2",
    range: "",
    title: "",
    description: "",
  },
  {
    id: "recommendation_3",
    range: "",
    title: "",
    description: "",
  },
];

function RecommendationBuilderPage() {
  const [activePanel, setActivePanel] =
    useState<BuilderPanel>("content");

  const [testMode, setTestMode] =
    useState<TestMode>("profile");

  const [
    profileAssignments,
    setProfileAssignments,
  ] = useState<
    Record<
      number,
      Record<number, string>
    >
  >({});

  const [title, setTitle] = useState("");

  const [description, setDescription] =
    useState("");

  const [questions, setQuestions] =
    useState<Question[]>(
      initialQuestions,
    );

  const [
    correctAnswers,
    setCorrectAnswers,
  ] = useState<
    Record<number, number>
  >(initialCorrectAnswers);

  const [
    answersLocked,
    setAnswersLocked,
  ] = useState(false);

  const [coverStyle, setCoverStyle] =
    useState<CoverStyle>("purple");

  const [
    coverImageUrl,
    setCoverImageUrl,
  ] = useState("");

  const [coverLabel, setCoverLabel] =
    useState("Öneri");

  const [results, setResults] =
    useState<ResultDefinition[]>(
      initialResults,
    );

  const [
    offerEnabled,
    setOfferEnabled,
  ] = useState(false);

  const [offerTitle, setOfferTitle] =
    useState(
      "Alternatif önerileri de gör",
    );

  const [
    offerDescription,
    setOfferDescription,
  ] = useState(
    "Sana uyan diğer seçenekleri ve nedenlerini de gör.",
  );

  const [offerPrice, setOfferPrice] =
    useState(19);

  const [
    builderLoaded,
    setBuilderLoaded,
  ] = useState(false);

  const [
    sourceExperienceId,
    setSourceExperienceId,
  ] = useState<string | null>(null);

  useEffect(() => {
    const stored =
      window.sessionStorage.getItem(
        BUILDER_STORAGE_KEY,
      );

    if (!stored) {
      setBuilderLoaded(true);
      return;
    }

    try {
      const saved = JSON.parse(
        stored,
      ) as {
        title?: string;
        description?: string;
        questions?: Question[];
        correctAnswers?: Record<
          number,
          number
        >;
        testMode?: TestMode;
        profileAssignments?: Record<
          number,
          Record<number, string>
        >;
        answersLocked?: boolean;
        coverStyle?: CoverStyle;
        coverImageUrl?: string;
        coverLabel?: string;
        results?: ResultDefinition[];
        offerEnabled?: boolean;
        offerTitle?: string;
        offerDescription?: string;
        offerPrice?: number;
        sourceExperienceId?: string | null;
      };

      if (
        typeof saved.title === "string"
      ) {
        setTitle(saved.title);
      }

      if (
        typeof saved.description ===
        "string"
      ) {
        setDescription(
          saved.description,
        );
      }

      if (
        Array.isArray(
          saved.questions,
        ) &&
        saved.questions.length >= 2
      ) {
        setQuestions(
          saved.questions,
        );
      }

      if (
        saved.correctAnswers &&
        typeof saved.correctAnswers ===
          "object"
      ) {
        setCorrectAnswers(
          saved.correctAnswers,
        );
      }

      setTestMode("profile");

      if (
        saved.profileAssignments &&
        typeof saved.profileAssignments ===
          "object"
      ) {
        setProfileAssignments(
          saved.profileAssignments,
        );
      }

      if (
        typeof saved.answersLocked ===
        "boolean"
      ) {
        setAnswersLocked(
          saved.answersLocked,
        );
      }

      if (
        saved.coverStyle === "pink" ||
        saved.coverStyle === "purple" ||
        saved.coverStyle === "blue" ||
        saved.coverStyle === "dark"
      ) {
        setCoverStyle(
          saved.coverStyle,
        );
      }

      if (
        typeof saved.coverImageUrl ===
        "string"
      ) {
        setCoverImageUrl(
          saved.coverImageUrl,
        );
      }

      if (
        typeof saved.coverLabel ===
        "string"
      ) {
        setCoverLabel(
          saved.coverLabel,
        );
      }

      if (
        Array.isArray(saved.results) &&
        saved.results.length > 0
      ) {
        setResults(saved.results);
      }

      if (
        typeof saved.offerEnabled ===
        "boolean"
      ) {
        setOfferEnabled(
          saved.offerEnabled,
        );
      }

      if (
        typeof saved.offerTitle ===
        "string"
      ) {
        setOfferTitle(
          saved.offerTitle,
        );
      }

      if (
        typeof saved.offerDescription ===
        "string"
      ) {
        setOfferDescription(
          saved.offerDescription,
        );
      }

      if (
        typeof saved.offerPrice ===
          "number" &&
        saved.offerPrice >= 1 &&
        saved.offerPrice <=
          MAX_OFFER_PRICE
      ) {
        setOfferPrice(
          saved.offerPrice,
        );
      }

      if (
        typeof saved.sourceExperienceId ===
          "string" &&
        saved.sourceExperienceId
      ) {
        setSourceExperienceId(
          saved.sourceExperienceId,
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
      const creator =
        await getCurrentCreator();

      if (
        !creator &&
        !cancelled
      ) {
        window.location.href =
          "/creator-auth";
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

    window.sessionStorage.setItem(
      BUILDER_STORAGE_KEY,
      JSON.stringify({
        title,
        description,
        questions,
        correctAnswers,
        testMode,
        profileAssignments,
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
      }),
    );
  }, [
    builderLoaded,
    title,
    description,
    questions,
    correctAnswers,
    testMode,
    profileAssignments,
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

  const answeredCount =
    questions.filter(
      (question) =>
        correctAnswers[
          question.id
        ] !== undefined,
    ).length;

  const allAnswersSelected =
    questions.length > 0 &&
    answeredCount ===
      questions.length;

  const profileAssignmentCount =
    questions.reduce(
      (total, question) =>
        total +
        question.options.filter(
          (_, optionIndex) =>
            Boolean(
              profileAssignments[
                question.id
              ]?.[optionIndex],
            ),
        ).length,
      0,
    );

  const totalOptionCount =
    questions.reduce(
      (total, question) =>
        total +
        question.options.length,
      0,
    );

  const allProfileAssignmentsSelected =
    totalOptionCount > 0 &&
    profileAssignmentCount ===
      totalOptionCount;

  const questionsAreValid =
    questions.every(
      (question) =>
        question.text.trim().length >
          0 &&
        question.options.length >= 2 &&
        question.options.every(
          (option) =>
            option.trim().length > 0,
        ),
    );

  const resultsAreValid =
    results.every(
      (result) =>
        result.title.trim().length >
          0 &&
        result.description
          .trim().length > 0,
    );

  const offerIsValid =
    !offerEnabled ||
    (offerTitle.trim().length > 0 &&
      offerDescription
        .trim().length > 0 &&
      offerPrice >= 1 &&
      offerPrice <=
        MAX_OFFER_PRICE);

  const canPublish = useMemo(
    () =>
      title.trim().length > 0 &&
      description.trim().length >
        0 &&
      questions.length >= 2 &&
      questionsAreValid &&
      (
        testMode === "score"
          ? allAnswersSelected &&
            answersLocked
          : allProfileAssignmentsSelected
      ) &&
      resultsAreValid &&
      offerIsValid,
    [
      title,
      description,
      questions.length,
      questionsAreValid,
      allAnswersSelected,
      allProfileAssignmentsSelected,
      answersLocked,
      testMode,
      resultsAreValid,
      offerIsValid,
    ],
  );

  function invalidateAnswerKey() {
    setAnswersLocked(false);
  }

  function changeTestMode(
    mode: TestMode,
  ) {
    setTestMode(mode);
    setAnswersLocked(false);
    setActivePanel("content");
  }

  function updateQuestionText(
    questionId: number,
    value: string,
  ) {
    setQuestions(
      (currentQuestions) =>
        currentQuestions.map(
          (question) =>
            question.id ===
            questionId
              ? {
                  ...question,
                  text: value,
                }
              : question,
        ),
    );

    invalidateAnswerKey();
  }

  function updateOption(
    questionId: number,
    optionIndex: number,
    value: string,
  ) {
    setQuestions(
      (currentQuestions) =>
        currentQuestions.map(
          (question) =>
            question.id ===
            questionId
              ? {
                  ...question,
                  options:
                    question.options.map(
                      (
                        option,
                        currentIndex,
                      ) =>
                        currentIndex ===
                        optionIndex
                          ? value
                          : option,
                    ),
                }
              : question,
        ),
    );

    setCorrectAnswers(
      (currentAnswers) => {
        const next = {
          ...currentAnswers,
        };
        delete next[questionId];
        return next;
      },
    );

    setProfileAssignments(
      (currentAssignments) => {
        const next = {
          ...currentAssignments,
        };
        delete next[questionId];
        return next;
      },
    );

    invalidateAnswerKey();
  }

  function addQuestion() {
    const nextId =
      questions.length === 0
        ? 1
        : Math.max(
            ...questions.map(
              (question) =>
                question.id,
            ),
          ) + 1;

    setQuestions(
      (currentQuestions) => [
        ...currentQuestions,
        {
          id: nextId,
          text: "",
          options: ["", "", "", ""],
        },
      ],
    );

    invalidateAnswerKey();

    window.setTimeout(() => {
      document
        .getElementById(
          `test-question-${nextId}`,
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 100);
  }

  function removeQuestion(
    questionId: number,
  ) {
    if (
      questions.length <= 2
    ) {
      return;
    }

    setQuestions(
      (currentQuestions) =>
        currentQuestions.filter(
          (question) =>
            question.id !==
            questionId,
        ),
    );

    setCorrectAnswers(
      (currentAnswers) => {
        const next = {
          ...currentAnswers,
        };
        delete next[questionId];
        return next;
      },
    );

    setProfileAssignments(
      (currentAssignments) => {
        const next = {
          ...currentAssignments,
        };
        delete next[questionId];
        return next;
      },
    );

    invalidateAnswerKey();
  }

  function selectCorrectAnswer(
    questionId: number,
    optionIndex: number,
  ) {
    if (answersLocked) {
      return;
    }

    setCorrectAnswers(
      (currentAnswers) => ({
        ...currentAnswers,
        [questionId]:
          optionIndex,
      }),
    );
  }

  function assignProfileToOption(
    questionId: number,
    optionIndex: number,
    profileId: string,
  ) {
    setProfileAssignments(
      (currentAssignments) => ({
        ...currentAssignments,
        [questionId]: {
          ...currentAssignments[
            questionId
          ],
          [optionIndex]:
            profileId,
        },
      }),
    );
  }

  function updateResult(
    resultId: string,
    field:
      | "title"
      | "description",
    value: string,
  ) {
    setResults(
      (currentResults) =>
        currentResults.map(
          (result) =>
            result.id === resultId
              ? {
                  ...result,
                  [field]: value,
                }
              : result,
        ),
    );
  }

  function updateOfferPrice(
    value: number,
  ) {
    if (
      !Number.isFinite(value)
    ) {
      setOfferPrice(1);
      return;
    }

    setOfferPrice(
      Math.min(
        MAX_OFFER_PRICE,
        Math.max(
          1,
          Math.round(value),
        ),
      ),
    );
  }

  async function handlePublish() {
    if (!canPublish) {
      return;
    }

    const creator =
      await getCurrentCreator();

    if (!creator) {
      window.location.href =
        "/creator-auth";
      return;
    }

    const experienceId =
      sourceExperienceId ??
      crypto.randomUUID();

    const publishedExperience = {
      id: experienceId,
      creatorId: creator.id,
      type: "test",
      status: "published",
      publishedAt:
        new Date().toISOString(),
      title,
      description,
      testMode,
      resultModel: {
        mode: testMode,
      },
      cover: {
        style: coverStyle,
        imageUrl: coverImageUrl,
        label: coverLabel,
      },
      questions,

      // Şemayı değiştirmeden mevcut yayınlama
      // katmanını tekrar kullanıyoruz.
      // Test tarafında bu alan cevap anahtarıdır.
      creatorAnswers:
        testMode === "score"
          ? correctAnswers
          : {},

      profileAssignments:
        testMode === "profile"
          ? profileAssignments
          : {},

      results,
      offer: {
        enabled: offerEnabled,
        title: offerTitle,
        description:
          offerDescription,
        price: offerPrice,
      },
    };

    try {
      await savePublishedExperience(
        publishedExperience,
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

      console.error(error);
      window.alert(message);
    }
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
        <div className="mx-auto flex h-[58px] max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-7">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary">
              {sourceExperienceId
                ? "Testi düzenliyorsun"
                : testMode === "score"
                  ? "Bilgi testi"
                  : "Kişilik / profil testi"}
            </p>

            <p className="truncate text-[11px] font-bold">
              {title}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/creator-studio"
              className="hidden h-9 items-center justify-center rounded-full border border-border bg-white px-4 text-[9px] font-bold text-muted-foreground transition hover:border-primary hover:text-primary sm:inline-flex"
            >
              Studio’ya dön
            </Link>

            <button
              type="button"
              disabled
              className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-white px-4 text-[9px] font-bold text-muted-foreground opacity-40"
            >
              Ön izle
            </button>

            <button
              type="button"
              disabled={!canPublish}
              onClick={() => {
                void handlePublish();
              }}
              className="inline-flex h-9 items-center justify-center rounded-full bg-black px-5 text-[9px] font-bold text-white transition enabled:hover:bg-primary disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-muted-foreground"
            >
              {sourceExperienceId
                ? "Güncelle"
                : "Yayınla"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[190px_minmax(0,1fr)_330px]">
        <aside className="sticky top-[58px] z-40 border-b border-border bg-[#faf8fb]/95 px-3 py-3 backdrop-blur-xl lg:h-[calc(100vh-58px)] lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r lg:bg-white/60 lg:py-5">
          <nav className="grid grid-cols-4 gap-1.5 lg:grid-cols-1">
            <BuilderTab
              active={
                activePanel ===
                "content"
              }
              label="İçerik"
              icon="✎"
              onClick={() =>
                setActivePanel(
                  "content",
                )
              }
            />

            <BuilderTab
              active={
                activePanel ===
                "answers"
              }
              label={
                testMode === "score"
                  ? "Cevap anahtarı"
                  : "Sonuç eşleştirme"
              }
              icon={
                testMode === "score"
                  ? "✓"
                  : "↗"
              }
              status={
                testMode === "score"
                  ? answersLocked
                    ? "Kilitli"
                    : `${answeredCount}/${questions.length}`
                  : `${profileAssignmentCount}/${totalOptionCount}`
              }
              completed={
                testMode === "score"
                  ? answersLocked
                  : allProfileAssignmentsSelected
              }
              onClick={() =>
                setActivePanel(
                  "answers",
                )
              }
            />

            <BuilderTab
              active={
                activePanel ===
                "result"
              }
              label="Sonuç"
              icon="%"
              onClick={() =>
                setActivePanel(
                  "result",
                )
              }
            />

            <BuilderTab
              active={
                activePanel ===
                "offer"
              }
              label="Teklif"
              icon="₺"
              status={
                offerEnabled
                  ? "Açık"
                  : "Kapalı"
              }
              onClick={() =>
                setActivePanel(
                  "offer",
                )
              }
            />
          </nav>

          <div className="mt-5 hidden rounded-[18px] border border-border bg-white p-4 lg:block">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary">
              Yayınlama durumu
            </p>

            <div className="mt-3 space-y-2">
              <StatusRow
                completed={
                  title.trim().length >
                    0 &&
                  description
                    .trim().length > 0
                }
                label="Başlık ve açıklama"
              />

              <StatusRow
                completed={
                  questions.length >=
                    2 &&
                  questionsAreValid
                }
                label={`${questions.length} soru`}
              />

              <StatusRow
                completed={
                  testMode === "score"
                    ? answersLocked
                    : allProfileAssignmentsSelected
                }
                label={
                  testMode === "score"
                    ? answersLocked
                      ? "Cevap anahtarı kilitli"
                      : `Cevap anahtarı ${answeredCount}/${questions.length}`
                    : `Sonuç eşleştirme ${profileAssignmentCount}/${totalOptionCount}`
                }
              />

              <StatusRow
                completed={
                  resultsAreValid
                }
                label="Sonuç ayarları"
              />

              <StatusRow
                completed={
                  offerIsValid
                }
                label="Teklif ayarları"
              />
            </div>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          {activePanel ===
            "content" && (
            <ContentEditor
              testMode={testMode}
              changeTestMode={
                changeTestMode
              }
              title={title}
              description={
                description
              }
              questions={
                questions
              }
              coverStyle={
                coverStyle
              }
              coverImageUrl={
                coverImageUrl
              }
              coverLabel={
                coverLabel
              }
              setTitle={
                setTitle
              }
              setDescription={
                setDescription
              }
              setCoverStyle={
                setCoverStyle
              }
              setCoverImageUrl={
                setCoverImageUrl
              }
              setCoverLabel={
                setCoverLabel
              }
              updateQuestionText={
                updateQuestionText
              }
              updateOption={
                updateOption
              }
              addQuestion={
                addQuestion
              }
              removeQuestion={
                removeQuestion
              }
            />
          )}

          {activePanel ===
            "answers" &&
            (testMode === "score" ? (
              <AnswerKeyEditor
                questions={
                  questions
                }
                correctAnswers={
                  correctAnswers
                }
                answeredCount={
                  answeredCount
                }
                answersLocked={
                  answersLocked
                }
                selectCorrectAnswer={
                  selectCorrectAnswer
                }
                lockAnswers={() =>
                  setAnswersLocked(
                    true,
                  )
                }
                unlockAnswers={() =>
                  setAnswersLocked(
                    false,
                  )
                }
              />
            ) : (
              <ProfileMappingEditor
                questions={
                  questions
                }
                results={results}
                profileAssignments={
                  profileAssignments
                }
                assignedCount={
                  profileAssignmentCount
                }
                totalOptionCount={
                  totalOptionCount
                }
                assignProfileToOption={
                  assignProfileToOption
                }
              />
            ))}

          {activePanel ===
            "result" && (
            <ResultEditor
              testMode={testMode}
              results={results}
              updateResult={
                updateResult
              }
            />
          )}

          {activePanel ===
            "offer" && (
            <OfferEditor
              enabled={
                offerEnabled
              }
              title={
                offerTitle
              }
              description={
                offerDescription
              }
              price={offerPrice}
              setEnabled={
                setOfferEnabled
              }
              setTitle={
                setOfferTitle
              }
              setDescription={
                setOfferDescription
              }
              setPrice={
                updateOfferPrice
              }
            />
          )}
        </main>

        <aside className="hidden border-l border-border bg-white/60 p-5 lg:block">
          <LivePreview
            title={title}
            description={
              description
            }
            questionCount={
              questions.length
            }
            coverStyle={
              coverStyle
            }
            coverImageUrl={
              coverImageUrl
            }
            coverLabel={
              coverLabel
            }
          />
        </aside>
      </div>
    </div>
  );
}

function BuilderTab({
  active,
  icon,
  label,
  status,
  completed = false,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  status?: string;
  completed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-0 items-center justify-center gap-2 rounded-[13px] px-2 py-2.5 text-[9px] font-bold transition lg:justify-start lg:px-3 ${
        active
          ? "bg-primary text-white shadow-[0_8px_20px_rgba(124,58,237,0.16)]"
          : "border border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-foreground"
      }`}
    >
      <span className="text-xs">
        {completed ? "✓" : icon}
      </span>

      <span className="truncate">
        {label}
      </span>

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
  testMode,
  changeTestMode,
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
  testMode: TestMode;
  changeTestMode: (
    mode: TestMode,
  ) => void;
  title: string;
  description: string;
  questions: Question[];
  coverStyle: CoverStyle;
  coverImageUrl: string;
  coverLabel: string;
  setTitle: (
    value: string,
  ) => void;
  setDescription: (
    value: string,
  ) => void;
  setCoverStyle: (
    value: CoverStyle,
  ) => void;
  setCoverImageUrl: (
    value: string,
  ) => void;
  setCoverLabel: (
    value: string,
  ) => void;
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
  removeQuestion: (
    questionId: number,
  ) => void;
}) {
  const coverClass =
    getCoverClass(coverStyle);

  return (
    <section>
      <SectionHeader
        eyebrow="Öneri"
        title="Öneri içeriğini oluştur"
        description="Önce ne önereceğini belirle. Sonra tercih sorularını ve kullanıcıya göstereceğin önerileri hazırla."
      />

      <div className="mt-5 rounded-[22px] border border-cyan-200 bg-cyan-50/50 p-5">
        <p className="text-sm font-black">
          Nasıl çalışır?
        </p>
        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
          Kullanıcı birkaç tercih sorusunu cevaplar. AQRYO cevaplarına en çok uyan seçeneği önerir ve neden uygun olduğunu sonuçta gösterir.
        </p>
      </div>

      <div className="mt-4 grid gap-4">
        <div className="rounded-[22px] border border-border bg-white p-5">
          <p className="text-sm font-black">
            Kapak
          </p>

          <div className="mt-5 grid gap-5 xl:grid-cols-[230px_minmax(0,1fr)]">
            <div
              className={`relative h-[170px] overflow-hidden rounded-[20px] bg-gradient-to-br ${coverClass}`}
            >
              {coverImageUrl.trim() && (
                <img
                  src={
                    coverImageUrl
                  }
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
                  backgroundSize:
                    "14px 14px",
                }}
              />

              <div className="relative z-10 flex h-full flex-col justify-between p-4 text-white">
                <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-[8px] font-bold uppercase tracking-[0.12em] backdrop-blur-md">
                  {coverLabel ||
                    "Öneri"}
                </span>

                <div>
                  <span className="text-3xl">
                    ✦
                  </span>

                  <p className="mt-2 text-xs font-black">
                    {title ||
                      "AQRY başlığı"}
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
                  ).map(
                    (style) => (
                      <button
                        key={
                          style.id
                        }
                        type="button"
                        onClick={() =>
                          setCoverStyle(
                            style.id,
                          )
                        }
                        className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[9px] font-bold transition ${
                          coverStyle ===
                          style.id
                            ? "border-primary bg-primary/[0.04] text-primary"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`h-4 w-4 rounded-full bg-gradient-to-br ${style.className}`}
                        />

                        {
                          style.label
                        }
                      </button>
                    ),
                  )}
                </div>
              </div>

              <label>
                <span className="text-[10px] font-bold">
                  Kapak etiketi
                </span>

                <input
                  type="text"
                  value={
                    coverLabel
                  }
                  maxLength={30}
                  onChange={(
                    event,
                  ) =>
                    setCoverLabel(
                      event.target
                        .value,
                    )
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
            Ne önerebilirsin?
          </p>

          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
            Bir kategori seçmek zorunda değilsin. Kullanıcıya sonunda somut bir seçenek önerebildiğin her konuda kullanabilirsin.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {TOPIC_IDEAS[testMode].map(
              (topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-primary/15 bg-white px-3 py-2 text-[11px] font-bold text-foreground"
                >
                  {topic}
                </span>
              ),
            )}
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
                onChange={(
                  event,
                ) =>
                  setTitle(
                    event.target
                      .value,
                  )
                }
                placeholder={
                  "Örn. Bu akşam hangi filmi izlemelisin?"
                }
                className="mt-2 h-11 w-full rounded-[15px] border border-border bg-background px-4 text-sm font-bold outline-none focus:border-primary"
              />
            </label>

            <label>
              <span className="text-[10px] font-bold">
                Açıklama
              </span>

              <textarea
                value={
                  description
                }
                maxLength={240}
                rows={3}
                onChange={(
                  event,
                ) =>
                  setDescription(
                    event.target
                      .value,
                  )
                }
                placeholder={
                  "Kullanıcının birkaç tercihini öğren ve sonunda ona en uygun seçeneği öner."
                }
                className="mt-2 w-full resize-none rounded-[15px] border border-border bg-background px-4 py-3 text-xs leading-5 outline-none focus:border-primary"
              />
            </label>
          </div>
        </div>

        <div className="rounded-[22px] border border-border bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black">
                Sorular
              </p>

              <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                {testMode === "score"
                  ? "Her soru için seçenekleri düzenle. Doğru cevabı sonraki sekmede işaretle."
                  : "Her seçeneğin bir anlamı var. Sonraki sekmede seçenekleri sonuç profilleriyle eşleştir."}
              </p>
            </div>

            <button
              type="button"
              onClick={
                addQuestion
              }
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-black px-4 text-[9px] font-bold text-white transition hover:bg-primary"
            >
              + Soru ekle
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            {questions.map(
              (
                question,
                questionIndex,
              ) => (
                <article
                  id={`test-question-${question.id}`}
                  key={
                    question.id
                  }
                  className="rounded-[18px] border border-border bg-background p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white">
                      {questionIndex +
                        1}
                    </span>

                    <input
                      type="text"
                      value={
                        question.text
                      }
                      onChange={(
                        event,
                      ) =>
                        updateQuestionText(
                          question.id,
                          event.target
                            .value,
                        )
                      }
                      placeholder={
                        QUESTION_EXAMPLES[
                          testMode
                        ][
                          questionIndex %
                            QUESTION_EXAMPLES[
                              testMode
                            ].length
                        ]
                      }
                      className="h-9 min-w-0 flex-1 rounded-[12px] border border-border bg-white px-3 text-[11px] font-bold outline-none focus:border-primary"
                    />

                    <button
                      type="button"
                      disabled={
                        questions.length <=
                        2
                      }
                      onClick={() =>
                        removeQuestion(
                          question.id,
                        )
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-white text-[10px] text-muted-foreground disabled:opacity-30"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {question.options.map(
                      (
                        option,
                        optionIndex,
                      ) => (
                        <label
                          key={`${question.id}-${optionIndex}`}
                          className="flex items-center gap-2 rounded-[12px] border border-border bg-white px-3 py-2"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[7px] font-black text-muted-foreground">
                            {String.fromCharCode(
                              65 +
                                optionIndex,
                            )}
                          </span>

                          <input
                            type="text"
                            value={
                              option
                            }
                            onChange={(
                              event,
                            ) =>
                              updateOption(
                                question.id,
                                optionIndex,
                                event
                                  .target
                                  .value,
                              )
                            }
                            placeholder={`Cevap ${String.fromCharCode(
                              65 +
                                optionIndex,
                            )}`}
                            className="min-w-0 flex-1 bg-transparent text-[11px] font-semibold outline-none placeholder:text-muted-foreground/55"
                          />
                        </label>
                      ),
                    )}
                  </div>
                </article>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={
              addQuestion
            }
            className="mt-4 flex h-10 w-full items-center justify-center rounded-[14px] border border-dashed border-primary/30 bg-primary/[0.025] text-[9px] font-bold text-primary"
          >
            + Yeni soru ekle
          </button>
        </div>
      </div>
    </section>
  );
}

function AnswerKeyEditor({
  questions,
  correctAnswers,
  answeredCount,
  answersLocked,
  selectCorrectAnswer,
  lockAnswers,
  unlockAnswers,
}: {
  questions: Question[];
  correctAnswers: Record<
    number,
    number
  >;
  answeredCount: number;
  answersLocked: boolean;
  selectCorrectAnswer: (
    questionId: number,
    optionIndex: number,
  ) => void;
  lockAnswers: () => void;
  unlockAnswers: () => void;
}) {
  const allAnswersSelected =
    questions.length > 0 &&
    answeredCount ===
      questions.length;

  return (
    <section className="pb-28">
      <SectionHeader
        eyebrow="Cevap anahtarı"
        title="Doğru cevapları belirle"
        description="Her sorunun doğru cevabını seç. Katılımcının skoru bu cevap anahtarına göre hesaplanacak."
      />

      <div className="mt-4 grid gap-3">
        {questions.map(
          (
            question,
            questionIndex,
          ) => {
            const selected =
              correctAnswers[
                question.id
              ];

            return (
              <article
                key={
                  question.id
                }
                className={`rounded-[20px] border p-4 ${
                  selected !==
                  undefined
                    ? "border-primary/30 bg-primary/[0.025]"
                    : "border-border bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white">
                    {questionIndex +
                      1}
                  </span>

                  <p className="pt-1 text-[11px] font-black leading-4">
                    {
                      question.text
                    }
                  </p>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {question.options.map(
                    (
                      option,
                      optionIndex,
                    ) => {
                      const isSelected =
                        selected ===
                        optionIndex;

                      return (
                        <button
                          key={`${question.id}-${optionIndex}`}
                          type="button"
                          disabled={
                            answersLocked
                          }
                          onClick={() =>
                            selectCorrectAnswer(
                              question.id,
                              optionIndex,
                            )
                          }
                          className={`rounded-[13px] border px-3 py-2.5 text-left text-[10px] font-bold transition ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-border bg-white text-muted-foreground"
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
          },
        )}
      </div>

      <div className="sticky bottom-4 z-30 mt-5 rounded-[20px] border border-border bg-white/95 p-4 shadow-[0_18px_50px_rgba(28,12,46,0.14)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-black">
              {answersLocked
                ? "Cevap anahtarı hazır"
                : allAnswersSelected
                  ? "Tüm cevaplar seçildi"
                  : `${answeredCount}/${questions.length} doğru cevap seçildi`}
            </p>

            <p className="mt-1 text-[9px] text-muted-foreground">
              Yayınlamak için tüm soruların doğru cevabını seçip cevap anahtarını kilitle.
            </p>
          </div>

          {answersLocked ? (
            <button
              type="button"
              onClick={
                unlockAnswers
              }
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-border bg-white px-5 text-[9px] font-bold transition hover:border-primary hover:text-primary"
            >
              Kilidi aç
            </button>
          ) : (
            <button
              type="button"
              disabled={
                !allAnswersSelected
              }
              onClick={
                lockAnswers
              }
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-black px-6 text-[9px] font-bold text-white transition enabled:hover:bg-primary disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-muted-foreground"
            >
              Cevap anahtarını kilitle →
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ProfileMappingEditor({
  questions,
  results,
  profileAssignments,
  assignedCount,
  totalOptionCount,
  assignProfileToOption,
}: {
  questions: Question[];
  results: ResultDefinition[];
  profileAssignments: Record<
    number,
    Record<number, string>
  >;
  assignedCount: number;
  totalOptionCount: number;
  assignProfileToOption: (
    questionId: number,
    optionIndex: number,
    profileId: string,
  ) => void;
}) {
  return (
    <section className="pb-24">
      <SectionHeader
        eyebrow="Sonuç eşleştirme"
        title="Her cevap neye işaret ediyor?"
        description="Her cevap seçeneğinin hangi öneriye yaklaştırdığını seç. Kullanıcı bu teknik eşleştirmeyi görmez."
      />

      <div className="mt-5 rounded-[18px] border border-primary/15 bg-primary/[0.04] p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black">Eşleştirme durumu</p>
            <p className="mt-1 text-[9px] text-muted-foreground">Her cevap seçeneğini en uygun öneriye bağla.</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-[9px] font-black text-primary shadow-sm">
            {assignedCount}/{totalOptionCount}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {questions.map((question, questionIndex) => (
          <article key={question.id} className="rounded-[20px] border border-border bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white">
                {questionIndex + 1}
              </span>
              <p className="pt-1 text-[11px] font-black leading-4">{question.text}</p>
            </div>

            <div className="mt-4 grid gap-2">
              {question.options.map((option, optionIndex) => (
                <div key={`${question.id}-${optionIndex}`} className="grid gap-2 rounded-[14px] border border-border bg-background p-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
                  <p className="text-[10px] font-bold">
                    {String.fromCharCode(65 + optionIndex)}. {option}
                  </p>
                  <select
                    value={profileAssignments[question.id]?.[optionIndex] ?? ""}
                    onChange={(event) =>
                      assignProfileToOption(question.id, optionIndex, event.target.value)
                    }
                    className="h-9 rounded-[12px] border border-border bg-white px-3 text-[9px] font-bold outline-none focus:border-primary"
                  >
                    <option value="">Sonuç seç</option>
                    {results.map((result) => (
                      <option key={result.id} value={result.id}>
                        {result.title}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResultEditor({
  testMode,
  results,
  updateResult,
}: {
  testMode: TestMode;
  results: ResultDefinition[];
  updateResult: (
    resultId: string,
    field:
      | "title"
      | "description",
    value: string,
  ) => void;
}) {
  return (
    <section>
      <SectionHeader
        eyebrow="Ücretsiz sonuç"
        title={
          testMode === "score"
            ? "Skora göre sonucu belirle"
            : "Önerileri düzenle"
        }
        description={
          testMode === "score"
            ? "Katılımcı ödeme yapmadan skorunu ve tamamlanmış sonucunu görür."
            : "Katılımcının cevaplarına en çok uyan öneri ücretsiz ve tamamlanmış sonuç olarak gösterilir."
        }
      />

      <div className="mt-5 grid gap-3">
        {results.map(
          (result) => (
            <article
              key={result.id}
              className="rounded-[18px] border border-border bg-white p-4"
            >
              <p className="text-[9px] font-bold text-primary">
                {testMode === "score"
                  ? result.range
                  : "Öneri"}
              </p>

              <input
                type="text"
                value={result.title}
                onChange={(
                  event,
                ) =>
                  updateResult(
                    result.id,
                    "title",
                    event.target
                      .value,
                  )
                }
                className="mt-2 h-9 w-full rounded-[12px] border border-border bg-background px-3 text-[10px] font-black outline-none focus:border-primary"
              />

              <textarea
                value={
                  result.description
                }
                rows={2}
                onChange={(
                  event,
                ) =>
                  updateResult(
                    result.id,
                    "description",
                    event.target
                      .value,
                  )
                }
                className="mt-2 w-full resize-none rounded-[12px] border border-border bg-background px-3 py-2 text-[9px] leading-4 outline-none focus:border-primary"
              />
            </article>
          ),
        )}
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
  setPrice,
}: {
  enabled: boolean;
  title: string;
  description: string;
  price: number;
  setEnabled: (
    value: boolean,
  ) => void;
  setTitle: (
    value: string,
  ) => void;
  setDescription: (
    value: string,
  ) => void;
  setPrice: (
    value: number,
  ) => void;
}) {
  const presetPrices = [
    9, 19, 29, 49, 99, 199,
  ];

  return (
    <section>
      <SectionHeader
        eyebrow="Teklif"
        title="Sonuçtan sonra teklif ekle"
        description="Ücretsiz sonuç tamamlandıktan sonra ekstra değer sunabilirsin."
      />

      <div className="mt-5 rounded-[22px] border border-border bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black">
              Teklif kullan
            </p>

            <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
              Kapalı olduğunda Experience ücretsiz sonuçtan sonra tamamlanır.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() =>
              setEnabled(!enabled)
            }
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${
              enabled
                ? "bg-primary"
                : "bg-muted-foreground/25"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                enabled
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>
        </div>

        {enabled && (
          <div className="mt-5 grid gap-4">
            <label>
              <span className="text-[10px] font-bold">
                Teklif başlığı
              </span>

              <input
                type="text"
                value={title}
                onChange={(
                  event,
                ) =>
                  setTitle(
                    event.target
                      .value,
                  )
                }
                className="mt-2 h-11 w-full rounded-[15px] border border-border bg-background px-4 text-xs font-bold outline-none focus:border-primary"
              />
            </label>

            <label>
              <span className="text-[10px] font-bold">
                Açıklama
              </span>

              <textarea
                value={
                  description
                }
                rows={3}
                onChange={(
                  event,
                ) =>
                  setDescription(
                    event.target
                      .value,
                  )
                }
                className="mt-2 w-full resize-none rounded-[15px] border border-border bg-background px-4 py-3 text-xs leading-5 outline-none focus:border-primary"
              />
            </label>

            <div>
              <p className="text-[10px] font-bold">
                Fiyat
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {presetPrices.map(
                  (
                    priceOption,
                  ) => (
                    <button
                      key={
                        priceOption
                      }
                      type="button"
                      onClick={() =>
                        setPrice(
                          priceOption,
                        )
                      }
                      className={`rounded-full border px-4 py-2 text-[9px] font-bold transition ${
                        price ===
                        priceOption
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {
                        priceOption
                      }{" "}
                      TL
                    </button>
                  ),
                )}

                <label className="flex h-9 items-center rounded-full border border-border bg-background px-3">
                  <input
                    type="number"
                    min={1}
                    max={
                      MAX_OFFER_PRICE
                    }
                    value={price}
                    onChange={(
                      event,
                    ) =>
                      setPrice(
                        Number(
                          event
                            .target
                            .value,
                        ),
                      )
                    }
                    className="w-16 bg-transparent text-[9px] font-bold outline-none"
                  />

                  <span className="text-[9px] font-bold text-muted-foreground">
                    TL
                  </span>
                </label>
              </div>
            </div>
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
  const coverClass =
    getCoverClass(coverStyle);

  return (
    <div className="sticky top-[78px]">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary">
        Canlı ön izleme
      </p>

      <h2 className="mt-1 text-sm font-black">
        Katılımcı ekranı
      </h2>

      <div className="mx-auto mt-4 max-w-[285px] overflow-hidden rounded-[32px] border-[7px] border-black bg-white shadow-[0_20px_50px_rgba(22,12,34,0.12)]">
        <div
          className={`relative h-40 bg-gradient-to-br ${coverClass}`}
        >
          {coverImageUrl.trim() && (
            <img
              src={coverImageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-black/10" />

          <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white">
            <span className="text-[8px] font-black uppercase tracking-[0.12em]">
              {coverLabel ||
                "Öneri"}
            </span>

            <span className="text-3xl">
              ✦
            </span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-black leading-[1.05] tracking-[-0.04em]">
            {title ||
              "AQRY başlığı"}
          </h3>

          <p className="mt-3 text-[9px] leading-4 text-muted-foreground">
            {description ||
              "Açıklama"}
          </p>

          <div className="mt-4 rounded-[14px] border border-border bg-background px-3 py-3 text-center">
            <p className="text-[8px] font-black">
              {questionCount} soru
            </p>
          </div>

          <div className="mt-4 flex h-10 items-center justify-center rounded-full bg-black text-[9px] font-black text-white">
            Başla →
          </div>
        </div>
      </div>
    </div>
  );
}

function getCoverClass(
  style: CoverStyle,
) {
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