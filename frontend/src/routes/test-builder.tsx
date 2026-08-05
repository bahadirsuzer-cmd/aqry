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
import type { ExperienceBlueprint } from "@/types/experienceBlueprint";
import { CreatorNavigation } from "@/components/CreatorNavigation";

export const Route = createFileRoute(
  "/test-builder",
)({
  component: TestBuilderPage,
});

type BuilderPanel =
  | "content"
  | "answers"
  | "result"
  | "offer"
  | "preview";

type TestMode =
  | "score"
  | "spectrum"
  | "archetype";

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

const STANDARD_OFFER_PRICE = 9;
const BUILDER_STORAGE_KEY =
  "aqry-test-builder";
const GENERATED_BLUEPRINT_STORAGE_KEY =
  "aqry-generated-blueprint";

const initialQuestions: Question[] = [
  {
    id: 1,
    text: "Kulübün kuruluş yılı hangisidir?",
    options: [
      "1905",
      "1907",
      "1910",
      "1923",
    ],
  },
  {
    id: 2,
    text: "Bir derbi günü seni en iyi hangisi anlatır?",
    options: [
      "Maç saatini beklerim",
      "Sabah formayı giyerim",
      "Tüm gün takım konuşurum",
      "Sonucu sonradan öğrenirim",
    ],
  },
  {
    id: 3,
    text: "Takımın geriye düştüğünde ne yaparsın?",
    options: [
      "Umudumu korurum",
      "Sinirlenirim ama izlerim",
      "Taktik konuşmaya başlarım",
      "Maçı kapatırım",
    ],
  },
  {
    id: 4,
    text: "Stadyum atmosferinde en sevdiğin şey nedir?",
    options: [
      "Tribün sesi",
      "Gol anı",
      "Koreografi",
      "Maç öncesi heyecan",
    ],
  },
  {
    id: 5,
    text: "Takımını ne sıklıkta takip edersin?",
    options: [
      "Her gün",
      "Maç günleri",
      "Önemli maçlarda",
      "Arada sırada",
    ],
  },
  {
    id: 6,
    text: "Bir futbol sohbetinde seni en çok ne heyecanlandırır?",
    options: [
      "Tarih",
      "Taktik",
      "Transfer",
      "Rekabet",
    ],
  },
];

const initialCorrectAnswers: Record<
  number,
  number
> = {
  1: 1,
};

const initialResults: ResultDefinition[] =
  [
    {
      id: "expert",
      range: "%80–100",
      title: "Kusursuz",
      description:
        "Harika sonuç. Soruların büyük bölümünü doğru cevapladın.",
    },
    {
      id: "strong",
      range: "%60–79",
      title: "Çok iyi",
      description:
        "Güçlü bir skor. Birkaç soruda daha dikkatli olsan kusursuza çok yakınsın.",
    },
    {
      id: "casual",
      range: "%40–59",
      title: "İyi başlangıç",
      description:
        "İyi gidiyorsun. Birkaç doğru cevap daha skorunu hızla yükseltir.",
    },
    {
      id: "rookie",
      range: "%0–39",
      title: "Bir tur daha?",
      description:
        "Bu tur biraz zorladı. Tekrar denersen skorunu yükseltebilirsin.",
    },
  ];


function parseResultRange(
  range: string,
) {
  const numbers =
    range.match(/\d+/g)?.map(
      Number,
    ) ?? [];

  if (numbers.length >= 2) {
    return {
      minScore: Math.max(
        0,
        Math.min(
          100,
          numbers[0],
        ),
      ),
      maxScore: Math.max(
        0,
        Math.min(
          100,
          numbers[1],
        ),
      ),
    };
  }

  return {
    minScore: 0,
    maxScore: 100,
  };
}

function buildManualSpectrumBlueprint({
  title,
  description,
  questions,
  results,
  offerEnabled,
  offerTitle,
  offerDescription,
  offerPrice,
}: {
  title: string;
  description: string;
  questions: Question[];
  results: ResultDefinition[];
  offerEnabled: boolean;
  offerTitle: string;
  offerDescription: string;
  offerPrice: number;
}): ExperienceBlueprint {
  const spectrumKey =
    "spectrum_value";

  return {
    version: 1,
    type: "test",
    title,
    description,
    tone: "fun",
    questions:
      questions.map(
        (question) => ({
          id: `q${question.id}`,
          text: question.text,
          options:
            question.options.map(
              (
                option,
                optionIndex,
              ) => {
                const denominator =
                  Math.max(
                    1,
                    question.options
                      .length - 1,
                  );

                const weight =
                  optionIndex /
                  denominator;

                return {
                  id: `q${question.id}_${optionIndex}`,
                  text: option,
                  signals: [
                    {
                      key:
                        spectrumKey,
                      weight,
                    },
                  ],
                  meaning:
                    `Bu cevap ölçülen özelliğe ${Math.round(
                      weight * 100,
                    )}% düzeyinde işaret eder.`,
                };
              },
            ),
        }),
      ),
    resultModel: {
      mode: "spectrum",
      profiles:
        results.map(
          (result) => {
            const {
              minScore,
              maxScore,
            } =
              parseResultRange(
                result.range,
              );

            return {
              id: result.id,
              title:
                result.title,
              description:
                result.description,
              minScore,
              maxScore,
            };
          },
        ),
    },
    offer: {
      enabled:
        offerEnabled,
      title: offerTitle,
      description:
        offerDescription,
      suggestedPrice:
        offerPrice,
    },
    test: {
      strategy:
        "spectrum",
      spectrumKey,
    },
  };
}


function TestBuilderPage() {
  const [activePanel, setActivePanel] =
    useState<BuilderPanel>("content");

  const [guide, setGuide] = useState<
    "answers" | "result" | "offer" | null
  >(null);

  const [maxVisitedStep, setMaxVisitedStep] = useState(0);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewScreen, setPreviewScreen] = useState<
    "entry" | "questions" | "result"
  >("entry");
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState<Record<number, number>>({});
  const [previewTested, setPreviewTested] = useState(false);

  const [testMode, setTestMode] =
    useState<TestMode>("score");


  const [title, setTitle] = useState(
    "Ne kadar biliyorsun?",
  );

  const [description, setDescription] =
    useState(
      "Soruları cevapla, skorunu hemen ve ücretsiz gör.",
    );

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
    useState("Test");

  const [results, setResults] =
    useState<ResultDefinition[]>(
      initialResults,
    );

  const [
    offerEnabled,
    setOfferEnabled,
  ] = useState(true);

  const [offerTitle, setOfferTitle] =
    useState(
      "Detaylı performans raporunu gör",
    );

  const [
    offerDescription,
    setOfferDescription,
  ] = useState(
    "Hangi konularda güçlü olduğunu ve hangi başlıklarda zorlandığını ayrıntılı gör.",
  );

  const offerPrice =
    STANDARD_OFFER_PRICE;

  const [
    builderLoaded,
    setBuilderLoaded,
  ] = useState(false);

  const [
    sourceExperienceId,
    setSourceExperienceId,
  ] = useState<string | null>(null);

  const [
    sourceBlueprint,
    setSourceBlueprint,
  ] = useState<ExperienceBlueprint | null>(
    null,
  );

  useEffect(() => {
    const generatedBlueprintRaw =
      window.sessionStorage.getItem(
        GENERATED_BLUEPRINT_STORAGE_KEY,
      );

    if (generatedBlueprintRaw) {
      try {
        const generatedBlueprint =
          JSON.parse(
            generatedBlueprintRaw,
          ) as ExperienceBlueprint;

        if (
          generatedBlueprint.type ===
          "test"
        ) {
          setSourceBlueprint(
            generatedBlueprint,
          );

          const strategy =
            generatedBlueprint.test
              ?.strategy;

          if (
            strategy === "score" ||
            strategy === "spectrum" ||
            strategy === "archetype"
          ) {
            setTestMode(strategy);
          }
        }
      } catch {
        window.sessionStorage.removeItem(
          GENERATED_BLUEPRINT_STORAGE_KEY,
        );
      }
    }

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
        testMode?: TestMode | "profile";
        answersLocked?: boolean;
        coverStyle?: CoverStyle;
        coverImageUrl?: string;
        coverLabel?: string;
        results?: ResultDefinition[];
        offerEnabled?: boolean;
        offerTitle?: string;
        offerDescription?: string;
        sourceExperienceId?: string | null;
        sourceBlueprint?: ExperienceBlueprint | null;
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

      if (
        saved.testMode === "score" ||
        saved.testMode ===
          "spectrum" ||
        saved.testMode ===
          "archetype"
      ) {
        setTestMode(saved.testMode);
      } else if (
        saved.testMode === "profile"
      ) {
        // Legacy profile builder state:
        // profile tests were closest to
        // today's archetype strategy.
        setTestMode("archetype");
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
        typeof saved.sourceExperienceId ===
          "string" &&
        saved.sourceExperienceId
      ) {
        setSourceExperienceId(
          saved.sourceExperienceId,
        );
      }

      if (
        saved.sourceBlueprint &&
        typeof saved.sourceBlueprint ===
          "object"
      ) {
        setSourceBlueprint(
          saved.sourceBlueprint,
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
        sourceBlueprint,
      }),
    );
  }, [
    builderLoaded,
    title,
    description,
    questions,
    correctAnswers,
    testMode,
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
    sourceBlueprint,
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
      offerDescription.trim().length > 0);

  const canPublish = useMemo(
  () =>
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    questions.length >= 2 &&
    questionsAreValid &&
    (testMode === "score"
      ? allAnswersSelected && answersLocked
      : true) &&
    resultsAreValid &&
    offerIsValid,
  [
    title,
    description,
    questions.length,
    questionsAreValid,
    allAnswersSelected,
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
          text: "Yeni sorunu buraya yaz",
          options: [
            "Birinci seçenek",
            "İkinci seçenek",
            "Üçüncü seçenek",
            "Dördüncü seçenek",
          ],
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


  const builderSteps: BuilderPanel[] =
    testMode === "score"
      ? ["content", "answers", "result", "offer", "preview"]
      : ["content", "result", "offer", "preview"];

  const activeStepIndex = Math.max(
    0,
    builderSteps.indexOf(activePanel),
  );

  function openStep(step: BuilderPanel) {
    const index = builderSteps.indexOf(step);
    if (index >= 0 && index <= maxVisitedStep) {
      setActivePanel(step);
    }
  }

  function showNextStep(step: BuilderPanel) {
    const index = builderSteps.indexOf(step);
    if (index >= 0) {
      setMaxVisitedStep((current) => Math.max(current, index));
      setActivePanel(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBackInBuilder() {
    const previous = builderSteps[activeStepIndex - 1];
    if (previous) {
      setActivePanel(previous);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goNextInBuilder() {
    if (activePanel === "content") {
      if (
        title.trim().length === 0 ||
        description.trim().length === 0 ||
        questions.length < 2 ||
        !questionsAreValid
      ) {
        window.alert("Önce başlık, açıklama ve tüm soruları tamamla.");
        return;
      }

      if (testMode === "score") {
        setGuide("answers");
        return;
      }

      setGuide("result");
      return;
    }

    if (activePanel === "answers") {
      if (!allAnswersSelected || !answersLocked) {
        window.alert("Tüm doğru cevapları seç ve cevap anahtarını kilitle.");
        return;
      }
      setGuide("result");
      return;
    }

    if (activePanel === "result") {
      if (!resultsAreValid) {
        window.alert("Tüm sonuç başlıklarını ve açıklamalarını tamamla.");
        return;
      }
      setGuide("offer");
      return;
    }

    if (activePanel === "offer") {
      if (!offerIsValid) {
        window.alert("Teklif açıksa başlık ve açıklamayı tamamla.");
        return;
      }
      showNextStep("preview");
    }
  }

  function confirmGuide() {
    const next = guide;
    setGuide(null);
    if (next) {
      showNextStep(next);
    }
  }

  function findResultForScore(score: number) {
    return (
      results.find((result) => {
        const { minScore, maxScore } =
          parseResultRange(result.range);
        return score >= minScore && score <= maxScore;
      }) ?? results[0]
    );
  }

  function calculatePreviewOutcome(
    answers: Record<number, number>,
  ) {
    if (testMode === "score") {
      const correctCount = questions.filter(
        (question) =>
          answers[question.id] ===
          correctAnswers[question.id],
      ).length;

      const score =
        questions.length > 0
          ? Math.round(
              (correctCount / questions.length) * 100,
            )
          : 0;

      return {
        score,
        result: findResultForScore(score),
      };
    }

    if (testMode === "spectrum") {
      let total = 0;
      let count = 0;

      questions.forEach((question, questionIndex) => {
        const optionIndex = answers[question.id];
        if (typeof optionIndex !== "number") return;

        let weight: number | null = null;
        const sourceQuestion = sourceBlueprint?.questions?.[questionIndex];
        const spectrumKey = sourceBlueprint?.test?.spectrumKey;

        if (sourceQuestion && spectrumKey) {
          const sourceOption = sourceQuestion.options?.[optionIndex];
          const signal = sourceOption?.signals?.find(
            (item) => item.key === spectrumKey,
          );
          if (typeof signal?.weight === "number") {
            weight = Math.max(0, Math.min(1, signal.weight));
          }
        }

        if (weight === null) {
          const denominator = Math.max(1, question.options.length - 1);
          weight = optionIndex / denominator;
        }

        total += weight;
        count += 1;
      });

      const score =
        count > 0 ? Math.round((total / count) * 100) : 0;

      return {
        score,
        result: findResultForScore(score),
      };
    }

    const profileKeys =
      sourceBlueprint?.test?.archetypeSignalKeys ?? {};
    const totals: Record<string, number> = {};

    sourceBlueprint?.questions?.forEach(
      (question, questionIndex) => {
        const builderQuestion = questions[questionIndex];
        if (!builderQuestion) return;
        const optionIndex = answers[builderQuestion.id];
        if (typeof optionIndex !== "number") return;

        const option = question.options?.[optionIndex];
        option?.signals?.forEach((signal) => {
          if (typeof signal.weight !== "number") return;
          totals[signal.key] =
            (totals[signal.key] ?? 0) + signal.weight;
        });
      },
    );

    const profiles = sourceBlueprint?.resultModel?.profiles ?? [];
    let winningProfileId = profiles[0]?.id ?? results[0]?.id ?? "";
    let winningScore = -1;

    profiles.forEach((profile) => {
      const signalKey = profileKeys[profile.id] ?? profile.id;
      const value = totals[signalKey] ?? 0;
      if (value > winningScore) {
        winningScore = value;
        winningProfileId = profile.id;
      }
    });

    const result =
      results.find((item) => item.id === winningProfileId) ??
      results[0];

    return {
      score: 100,
      result,
    };
  }

  function startSelfPreview() {
    setPreviewAnswers({});
    setPreviewQuestionIndex(0);
    setPreviewScreen("entry");
    setPreviewOpen(true);
  }

  function choosePreviewAnswer(optionIndex: number) {
    const question = questions[previewQuestionIndex];
    if (!question) return;

    const nextAnswers = {
      ...previewAnswers,
      [question.id]: optionIndex,
    };
    setPreviewAnswers(nextAnswers);

    const isLast =
      previewQuestionIndex === questions.length - 1;

    window.setTimeout(() => {
      if (isLast) {
        setPreviewScreen("result");
        setPreviewTested(true);
        return;
      }
      setPreviewQuestionIndex((current) => current + 1);
    }, 240);
  }

  function previousPreviewQuestion() {
    if (previewQuestionIndex === 0) {
      setPreviewScreen("entry");
      return;
    }
    setPreviewQuestionIndex((current) => current - 1);
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

    const canonicalBlueprint:
      ExperienceBlueprint | undefined =
      sourceBlueprint
        ? {
            ...sourceBlueprint,
            title,
            description,
            questions:
              sourceBlueprint.questions.map(
                (question, questionIndex) => {
                  const builderQuestion =
                    questions[
                      questionIndex
                    ];

                  if (
                    !builderQuestion
                  ) {
                    return question;
                  }

                  return {
                    ...question,
                    text:
                      builderQuestion.text,
                    options:
                      question.options.map(
                        (
                          option,
                          optionIndex,
                        ) => ({
                          ...option,
                          text:
                            builderQuestion
                              .options[
                              optionIndex
                            ] ??
                            option.text,
                        }),
                      ),
                  };
                },
              ),
            resultModel: {
              ...sourceBlueprint.resultModel,
              profiles:
                sourceBlueprint.resultModel.profiles.map(
                  (
                    profile,
                    profileIndex,
                  ) => {
                    const builderResult =
                      results[
                        profileIndex
                      ];

                    if (
                      !builderResult
                    ) {
                      return profile;
                    }

                    return {
                      ...profile,
                      title:
                        builderResult.title,
                      description:
                        builderResult.description,
                    };
                  },
                ),
            },
            offer: {
              ...(sourceBlueprint.offer ?? {
                enabled:
                  offerEnabled,
                title: offerTitle,
                description:
                  offerDescription,
                suggestedPrice:
                  offerPrice,
              }),
              enabled:
                offerEnabled,
              title: offerTitle,
              description:
                offerDescription,
              suggestedPrice:
                offerPrice,
            },
          }
        : testMode === "spectrum"
          ? buildManualSpectrumBlueprint({
              title,
              description,
              questions,
              results,
              offerEnabled,
              offerTitle,
              offerDescription,
              offerPrice,
            })
          : undefined;

    const publishedExperience = {
      id: experienceId,
      creatorId: creator.id,
      type: "test",
      status: "published",
      publishedAt:
        new Date().toISOString(),
      title,
      description,
      blueprint:
        canonicalBlueprint,
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

      profileAssignments: {},

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

      window.sessionStorage.removeItem(
        GENERATED_BLUEPRINT_STORAGE_KEY,
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
          window.location.href = "/creator-auth";
        }}
      />

      <header className="sticky top-16 z-30 border-b border-border/80 bg-[#faf8fb]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[58px] max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-7">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary">
              {sourceExperienceId
                ? "Yeni sürüm oluşturuluyor"
                : testMode === "score"
                  ? "Bilgi testi"
                  : testMode === "spectrum"
                    ? "Seviye testi"
                    : "Karakter / tip testi"}
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

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[210px_minmax(0,1fr)_330px]">
        <aside className="sticky top-[58px] z-20 border-b border-border bg-[#faf8fb]/95 px-3 py-3 backdrop-blur-xl lg:h-[calc(100vh-58px)] lg:self-start lg:border-b-0 lg:border-r lg:bg-white/60 lg:py-5">
          <p className="mb-3 hidden px-3 text-[8px] font-black uppercase tracking-[0.16em] text-muted-foreground lg:block">
            Oluşturma akışı
          </p>
          <nav className="grid grid-cols-4 gap-1.5 lg:grid-cols-1">
            {builderSteps.map((step, index) => (
              <BuilderTab
                key={step}
                active={activePanel === step}
                label={
                  step === "content"
                    ? "İçerik"
                    : step === "answers"
                      ? "Cevaplar"
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
            <p className="text-[10px] font-black">{activeStepIndex + 1}/{builderSteps.length}</p>
            <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
              AQRYO seni sırayla ilerletir. Tamamladığın adıma istediğin zaman geri dönebilirsin.
            </p>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-5 pb-28 sm:px-6 lg:px-8">
          {activePanel === "content" && (
            <ContentEditor
              testMode={testMode}
              changeTestMode={changeTestMode}
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
          )}

          {activePanel === "answers" && testMode === "score" && (
            <AnswerKeyEditor
              questions={questions}
              correctAnswers={correctAnswers}
              answeredCount={answeredCount}
              answersLocked={answersLocked}
              selectCorrectAnswer={selectCorrectAnswer}
              lockAnswers={() => setAnswersLocked(true)}
              unlockAnswers={() => setAnswersLocked(false)}
            />
          )}

          {activePanel === "result" && (
            <ResultEditor
              testMode={testMode}
              results={results}
              updateResult={updateResult}
            />
          )}

          {activePanel === "offer" && (
            <OfferEditor
              enabled={offerEnabled}
              title={offerTitle}
              description={offerDescription}
              price={offerPrice}
              setEnabled={setOfferEnabled}
              setTitle={setOfferTitle}
              setDescription={setOfferDescription}
            />
          )}

          {activePanel === "preview" && (
            <section>
              <SectionHeader
                eyebrow="Son kontrol"
                title="Yayınlamadan önce bir kez gözden geçir"
                description="Başlık, soru sayısı, sonuç ve varsa teklif hazır. Bir sorun görürsen önceki adımlara dön; hazırsan yayınla."
              />
              <div className="mt-5 lg:hidden">
                <LivePreview
                  title={title}
                  description={description}
                  questionCount={questions.length}
                  coverStyle={coverStyle}
                  coverImageUrl={coverImageUrl}
                  coverLabel={coverLabel}
                />
              </div>
              <div className="mt-5 rounded-[22px] border border-border bg-white p-5">
                <p className="text-sm font-black">Önce kendin dene</p>
                <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
                  Katılımcının göreceği akışı baştan sona çöz. Sonucun ve geçişlerin içine siniyorsa yayınla.
                </p>

                <button
                  type="button"
                  onClick={startSelfPreview}
                  className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-[10px] font-black text-white"
                >
                  Experience'ı dene →
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewTested(true)}
                  className="mt-2 flex h-10 w-full items-center justify-center rounded-full border border-border bg-white px-5 text-[9px] font-bold text-muted-foreground"
                >
                  Şimdilik atla
                </button>

                <p className="mt-4 text-[9px] leading-4 text-muted-foreground">
                  {questions.length} soru · {results.length} sonuç · {offerEnabled ? `${offerPrice} TL teklif` : "ek teklif yok"}
                </p>
              </div>
            </section>
          )}

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-4 py-3 backdrop-blur-xl lg:left-[210px] lg:right-[330px]">
            <div className="mx-auto flex max-w-[860px] items-center justify-between gap-3">
              <button
                type="button"
                disabled={activeStepIndex === 0}
                onClick={goBackInBuilder}
                className="h-11 rounded-full border border-border bg-white px-5 text-[10px] font-black disabled:opacity-30"
              >
                ← Geri
              </button>

              {activePanel === "preview" ? (
                <button
                  type="button"
                  disabled={!canPublish || !previewTested}
                  onClick={() => void handlePublish()}
                  className="h-11 flex-1 rounded-full bg-black px-6 text-[10px] font-black text-white transition enabled:hover:bg-primary disabled:bg-black/15 disabled:text-muted-foreground"
                >
                  {sourceExperienceId ? "Yeni sürümü yayınla" : "Yayınla"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNextInBuilder}
                  className="h-11 flex-1 rounded-full bg-black px-6 text-[10px] font-black text-white transition hover:bg-primary"
                >
                  Sonraki →
                </button>
              )}
            </div>
          </div>
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

      {guide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[430px] rounded-[28px] bg-white p-6 shadow-2xl">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-primary">
              {guide === "answers" ? "Cevap mantığı" : guide === "result" ? "Ücretsiz sonuç" : "Kazanç"}
            </p>
            <h2 className="mt-2 text-[22px] font-black tracking-[-0.04em]">
              {guide === "answers"
                ? "Şimdi doğru cevapları belirle"
                : guide === "result"
                  ? "Katılımcının göreceği sonucu hazırla"
                  : "Bu içerikten ekstra gelir elde etmek ister misin?"}
            </h2>
            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
              {guide === "answers"
                ? "AQRYO sonucu bu seçimlerden hesaplayacak. Her sorunun doğru cevabını seç ve bitince cevap anahtarını kilitle."
                : guide === "result"
                  ? "Sonuç ücretsiz ve tamamlanmış olmalı. Katılımcı Experience’ı bitirdiğinde burada gerçek karşılığını alır."
                  : "Doğal bir ekstra değer varsa Offer ekle. Yoksa teklifi kapatıp doğrudan devam et."}
            </p>
            <button
              type="button"
              onClick={confirmGuide}
              className="mt-6 h-12 w-full rounded-full bg-black text-[10px] font-black text-white transition hover:bg-primary"
            >
              Tamam, devam et →
            </button>
          </div>
        </div>
      )}
      {previewOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-[520px]">
            <div className="mb-3 flex items-center justify-between text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                Kendi Experience'ını deniyorsun
              </p>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="h-9 rounded-full bg-white/10 px-4 text-[9px] font-bold"
              >
                Kapat
              </button>
            </div>

            {previewScreen === "entry" && (
              <article className="overflow-hidden rounded-[30px] border border-white/10 bg-white shadow-2xl">
                <div className={`relative h-56 bg-gradient-to-br ${getCoverClass(coverStyle)}`}>
                  {coverImageUrl.trim() && (
                    <img
                      src={coverImageUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/15" />
                  <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
                    <span className="text-[9px] font-black uppercase tracking-[0.14em]">
                      {coverLabel || "Test"}
                    </span>
                    <span className="text-5xl">✦</span>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-[28px] font-black leading-[1] tracking-[-0.05em]">
                    {title}
                  </h2>
                  <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
                    {description}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPreviewScreen("questions")}
                    className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-black text-[10px] font-black text-white"
                  >
                    Başla →
                  </button>
                </div>
              </article>
            )}

            {previewScreen === "questions" && questions[previewQuestionIndex] && (
              <article className="rounded-[30px] border border-white/10 bg-white p-5 shadow-2xl sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-primary">
                    {previewQuestionIndex + 1}/{questions.length}
                  </span>
                  <span className="max-w-[220px] truncate text-right text-[8px] font-semibold text-muted-foreground">
                    {title}
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{
                      width: `${((previewQuestionIndex + 1) / questions.length) * 100}%`,
                    }}
                  />
                </div>

                <h2 className="mt-7 text-[23px] font-black leading-[1.08] tracking-[-0.045em]">
                  {questions[previewQuestionIndex].text}
                </h2>

                <div className="mt-6 grid gap-2.5">
                  {questions[previewQuestionIndex].options.map((option, optionIndex) => {
                    const question = questions[previewQuestionIndex];
                    const selected = previewAnswers[question.id] === optionIndex;
                    return (
                      <button
                        key={`${question.id}-${optionIndex}`}
                        type="button"
                        onClick={() => choosePreviewAnswer(optionIndex)}
                        className={`flex min-h-12 items-center gap-3 rounded-[16px] border px-4 py-3 text-left text-[11px] font-bold transition ${
                          selected
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-background hover:border-primary/35"
                        }`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-black ${selected ? "bg-white/20 text-white" : "bg-white text-muted-foreground"}`}>
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={previousPreviewQuestion}
                  className="mt-7 inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-5 text-[9px] font-bold"
                >
                  ← Önceki soru
                </button>
              </article>
            )}

            {previewScreen === "result" && (() => {
              const outcome = calculatePreviewOutcome(previewAnswers);
              return (
                <article className="overflow-hidden rounded-[30px] border border-white/10 bg-white shadow-2xl">
                  <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 p-7 text-white">
                    <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/75">
                      Ücretsiz sonuç
                    </p>
                    {testMode !== "archetype" && (
                      <p className="mt-6 text-5xl font-black">%{outcome.score}</p>
                    )}
                    <h2 className="mt-4 text-[28px] font-black leading-[1] tracking-[-0.05em]">
                      {outcome.result?.title || "Sonucun hazır"}
                    </h2>
                    <p className="mt-4 text-[12px] leading-5 text-white/85">
                      {outcome.result?.description || "Sonuç açıklaması"}
                    </p>
                  </div>

                  <div className="p-6">
                    {offerEnabled && (
                      <div className="rounded-[18px] border border-border bg-background p-4">
                        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-primary">
                          Ücretli teklif
                        </p>
                        <p className="mt-2 text-[12px] font-black">{offerTitle}</p>
                        <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
                          {offerDescription}
                        </p>
                        <p className="mt-3 text-[12px] font-black text-primary">{offerPrice} TL</p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setPreviewOpen(false)}
                      className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-black text-[10px] font-black text-white"
                    >
                      Tamam, yayına dön
                    </button>
                  </div>
                </article>
              );
            })()}
          </div>
        </div>
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
      disabled={disabled}
      onClick={onClick}
      className={`flex min-w-0 items-center justify-center gap-2 rounded-[13px] px-2 py-2.5 text-[9px] font-bold transition lg:justify-start lg:px-3 ${
        active
          ? "bg-primary text-white shadow-[0_8px_20px_rgba(124,58,237,0.16)]"
          : disabled
            ? "border border-border bg-white text-muted-foreground opacity-40"
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
        eyebrow="İçerik"
        title="Testini oluştur"
        description="Önce testin nasıl sonuçlanacağını seç; sonra kapağı, soruları ve seçenekleri düzenle."
      />

      <div className="mt-5 rounded-[22px] border border-border bg-white p-5">
        <p className="text-sm font-black">
          Sonuç mantığı
        </p>

        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
          AQRY seçtiğin yapıya göre sonucu hesaplar. Teknik puanlama ayrıntılarını creator görmez.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() =>
              changeTestMode("score")
            }
            className={`rounded-[18px] border p-4 text-left transition ${
              testMode === "score"
                ? "border-primary bg-primary/[0.04]"
                : "border-border bg-background hover:border-primary/30"
            }`}
          >
            <p className="text-[11px] font-black">
              Bilgi / skor
            </p>
            <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
              Doğru ve yanlış cevapları olan bilgi testleri.
            </p>
            <p className="mt-2 text-[8px] font-bold text-primary">
              “10 soruda ne kadar biliyorsun?”
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              changeTestMode(
                "spectrum",
              )
            }
            className={`rounded-[18px] border p-4 text-left transition ${
              testMode ===
              "spectrum"
                ? "border-primary bg-primary/[0.04]"
                : "border-border bg-background hover:border-primary/30"
            }`}
          >
            <p className="text-[11px] font-black">
              Ne kadar X’sin?
            </p>
            <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
              Tek bir özelliğin sende ne kadar güçlü olduğunu ölçer.
            </p>
            <p className="mt-2 text-[8px] font-bold text-primary">
              “Ne kadar ghostlayan birisin?”
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              changeTestMode(
                "archetype",
              )
            }
            className={`rounded-[18px] border p-4 text-left transition ${
              testMode ===
              "archetype"
                ? "border-primary bg-primary/[0.04]"
                : "border-border bg-background hover:border-primary/30"
            }`}
          >
            <p className="text-[11px] font-black">
              Hangi X’sin?
            </p>
            <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
              Cevaplarından sana en yakın karakteri, tipi veya rolü bulur.
            </p>
            <p className="mt-2 text-[8px] font-bold text-primary">
              “Hangi karaktere daha yakınsın?”
            </p>
          </button>
        </div>
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
                    "Test"}
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

              <label>
                <span className="text-[10px] font-bold">
                  Görsel adresi
                </span>

                <input
                  type="url"
                  value={
                    coverImageUrl
                  }
                  placeholder="https://..."
                  onChange={(
                    event,
                  ) =>
                    setCoverImageUrl(
                      event.target
                        .value,
                    )
                  }
                  className="mt-2 h-10 w-full rounded-[14px] border border-border bg-background px-4 text-[10px] outline-none focus:border-primary"
                />
              </label>
            </div>
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
                  : testMode === "spectrum"
                    ? "Sorular aynı özelliğin farklı seviyelerini ölçer. Seçenekleri en düşükten en yükseğe sırala; AQRY puanlamayı otomatik kurar."
                    : "Sorular farklı karakter ve davranış sinyalleri taşır. AQRY bunları arka planda birlikte değerlendirir."}
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
                            className="min-w-0 flex-1 bg-transparent text-[10px] font-semibold outline-none"
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
            : testMode ===
                "spectrum"
              ? "Seviyelere göre sonucu düzenle"
              : "Karakter sonuçlarını düzenle"
        }
        description={
          testMode === "score"
            ? "Katılımcı ödeme yapmadan skorunu ve tamamlanmış sonucunu görür."
            : testMode ===
                "spectrum"
              ? "AQRYO cevaplardan bir seviye hesaplar. Burada farklı aralıklarda kullanıcıya gösterilecek sonuçları düzenlersin."
              : "AQRYO cevapların taşıdığı sinyalleri birlikte değerlendirir ve kullanıcıya en yakın karakter veya tipi ücretsiz sonuç olarak gösterir."
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
                {testMode === "score" ||
                testMode ===
                  "spectrum"
                  ? result.range
                  : "Karakter / tip"}
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
}) {
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
                "Test"}
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