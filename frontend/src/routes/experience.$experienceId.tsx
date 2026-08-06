import { useEffect, useRef, useState } from "react";
import { getParticipantKey, saveCompletion } from "@/services/completions";
import type { ExperienceBlueprint } from "@/types/experienceBlueprint";
import { calculateTestResult } from "@/services/test-result-engine";
import {
  createOrderAndStartPayment,
  createGiftOrderAndStartPayment,
  getExistingPaidOrder,
  getPaidOfferResult,
  type GiftKey,
  type GiftMessageKey,
  type GiftContactType,
} from "@/services/orders";
import { recordExperienceEvent } from "@/services/experienceEvents";
import {
  ExperienceUnavailableState,
  type ExperienceUnavailableReason,
} from "@/components/experience/ExperienceUnavailableState";
import { ReportExperienceDialog } from "@/components/experience/ReportExperienceDialog";
import { PublicNavigation } from "@/components/home/PublicNavigation";
import { supabase } from "@/services/supabase";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/experience/$experienceId",
)({
  component: PublishedExperiencePage,
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

type CreatorProfile = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
};

type PaidBaseResult = {
  orderId: string;
  experienceId: string;
  experienceTitle: string;
  offerTitle: string;
  offerDescription?: string;
  score: number;
};

type PaidOfferResult =
  | (PaidBaseResult & {
      kind: "compatibility";
      matchingAnswers: Array<{
        question: string;
        answer: string;
      }>;
      differentAnswers: Array<{
        question: string;
        participantAnswer: string;
        creatorAnswer: string;
      }>;
    })
  | (PaidBaseResult & {
      kind: "test_score";
      resultTitle: string;
      totalQuestions: number;
      correctCount: number;
      incorrectCount: number;
      correctAnswers: Array<{
        question: string;
        participantAnswer: string;
        correctAnswer: string;
      }>;
      incorrectAnswers: Array<{
        question: string;
        participantAnswer: string;
        correctAnswer: string;
      }>;
    })
  | (PaidBaseResult & {
      kind: "test_spectrum";
      resultTitle: string;
      spectrumKey: string;
      mappedAnswerCount: number;
      totalQuestions: number;
      answers: Array<{
        question: string;
        answer: string;
        weight: number;
      }>;
      insights: {
        strongestTrigger: {
          question: string;
          answer: string;
          intensity: number;
        } | null;
        calmestArea: {
          question: string;
          answer: string;
          intensity: number;
        } | null;
        reactionPattern: string;
        redZone: string[];
        surpriseInsight: string;
        highIntensityCount: number;
        lowIntensityCount: number;
      };
    })
  | (PaidBaseResult & {
      kind: "test_archetype";
      resultTitle: string;
      winningProfile:
        | {
            profileId: string;
            title: string;
            description: string;
            percentage: number;
          }
        | null;
      breakdown: Array<{
        profileId: string;
        title: string;
        description: string;
        percentage: number;
      }>;
      answers: Array<{
        question: string;
        answer: string;
        profileId?: string;
        profileTitle?: string;
        signals?: Array<{
          key: string;
          weight: number;
        }>;
      }>;
      totalQuestions: number;
    })
  | (PaidBaseResult & {
      kind: "guess";
      resultTitle: string;
      premiumDescription: string;
    })
  | (PaidBaseResult & {
      kind: "story";
      resultTitle: string;
      premiumDescription: string;
      premiumItems: Array<
        | {
            id: string;
            type: "text";
            text: string;
          }
        | {
            id: string;
            type: "image";
            imageUrl: string;
          }
      >;
    });

type PublishedExperience = {
  id: string;
  creatorId: string;
  creator: CreatorProfile | null;
  type: "compatibility" | "test" | "guess" | "story";
  status: "published";
  publishedAt: string;
  title: string;
  description: string;
  cover: {
    style: CoverStyle;
    imageUrl: string;
    label: string;
  };
  questions: Question[];
  creatorAnswers: Record<number, number>;
  blueprint: ExperienceBlueprint | null;
  testMode:
    | "score"
    | "spectrum"
    | "archetype"
    | null;
  results: ResultDefinition[];
  resultModel: {
    mode?: string;
    [key: string]: unknown;
  } | null;
  offer: {
    enabled: boolean;
    title: string;
    description: string;
    price: number;
  };
  guess: {
    prompt: string;
    acceptedAnswers: string[];
    successTitle: string;
    successDescription: string;
    retryEnabled: boolean;
  } | null;
  story: {
    items: Array<
      | {
          id: string;
          type: "text";
          text: string;
        }
      | {
          id: string;
          type: "image";
          imageUrl: string;
        }
    >;
    resultTitle: string;
    resultDescription: string;
  } | null;
};

type ExperienceScreen =
  | "entry"
  | "questions"
  | "guess"
  | "story"
  | "result"
  | "gift"
  | "offer";

function PublishedExperiencePage() {
  const { experienceId } = Route.useParams();

    const [experience, setExperience] =
    useState<PublishedExperience | null>(null);

  const [experienceLoaded, setExperienceLoaded] =
    useState(false);

  const [
    unavailableReason,
    setUnavailableReason,
  ] = useState<ExperienceUnavailableReason | null>(null);

  const [captureShieldVisible, setCaptureShieldVisible] =
    useState(false);

  useEffect(() => {
  let cancelled = false;

  async function loadExperience() {
    try {
      setExperienceLoaded(false);
      setUnavailableReason(null);

      const { data, error } = await supabase
        .from("experiences")
        .select(
          `
            id,
            creator_id,
            type,
            status,
            paused_by,
            pause_reason,
            moderated_at,
            published_at,
            title,
            description,
            cover_style,
            cover_label,
            cover_image_url,
            content,
            result_config,
            offer_config
          `,
        )
        .eq("id", experienceId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (cancelled) {
        return;
      }

      if (!data) {
        setExperience(null);
        setUnavailableReason("not_found");
        return;
      }

      const rawStatus =
        typeof data.status === "string"
          ? data.status
          : "";

      const pausedBy =
        typeof data.paused_by === "string"
          ? data.paused_by
          : null;

      if (
        pausedBy === "moderation" ||
        data.moderated_at
      ) {
        setExperience(null);
        setUnavailableReason("moderated");
        return;
      }

      if (rawStatus === "archived") {
        setExperience(null);
        setUnavailableReason("archived");
        return;
      }

      if (
        rawStatus === "paused" ||
        pausedBy === "creator"
      ) {
        setExperience(null);
        setUnavailableReason("paused");
        return;
      }

      if (rawStatus !== "published") {
        setExperience(null);
        setUnavailableReason("not_found");
        return;
      }

      const content =
        data.content as {
          questions?: Question[];
          creatorAnswers?: Record<
            number,
            number
          >;
          blueprint?: ExperienceBlueprint | null;
          testMode?:
            | "score"
            | "spectrum"
            | "archetype";
          guess?: {
            prompt?: string;
            acceptedAnswers?: string[];
            successTitle?: string;
            successDescription?: string;
            retryEnabled?: boolean;
          } | null;
          story?: {
            items?: Array<
              | {
                  id: string;
                  type: "text";
                  text: string;
                }
              | {
                  id: string;
                  type: "image";
                  imageUrl: string;
                }
            >;
            resultTitle?: string;
            resultDescription?: string;
          } | null;
        } | null;

      const resultConfig =
        data.result_config as {
          results?: ResultDefinition[];
          resultModel?: {
            mode?: string;
            [key: string]: unknown;
          } | null;
        } | null;

      const offerConfig =
        data.offer_config as PublishedExperience["offer"] | null;

      let creatorProfile: CreatorProfile | null = null;

      if (typeof data.creator_id === "string" && data.creator_id) {
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("creator_profiles")
          .select(
            `
              id,
              display_name,
              username,
              avatar_url
            `,
          )
          .eq("id", data.creator_id)
          .maybeSingle();

        if (profileError) {
          console.error(
            "Creator profili yÃ¼klenemedi:",
            profileError,
          );
        } else if (profileData) {
          creatorProfile = {
            id: profileData.id,
            displayName:
              profileData.display_name ?? "Creator",
            username:
              profileData.username ?? "",
            avatarUrl:
              profileData.avatar_url ?? "",
          };
        }
      }

      setUnavailableReason(null);

      setExperience({
        id: data.id,
        creatorId:
          typeof data.creator_id === "string"
            ? data.creator_id
            : "",
        creator: creatorProfile,
        type:
          data.type === "story"
            ? "story"
            : data.type === "guess"
              ? "guess"
              : data.type === "test"
                ? "test"
                : "compatibility",
        status: "published",
        publishedAt:
          data.published_at ?? "",
        title: data.title,
        description:
          data.description ?? "",
        cover: {
          style:
            (data.cover_style as CoverStyle) ??
            "pink",
          label:
            data.cover_label ?? "",
          imageUrl:
            data.cover_image_url ?? "",
        },
        questions:
          content?.questions ?? [],
        creatorAnswers:
          content?.creatorAnswers ?? {},
        blueprint:
          content?.blueprint ?? null,
        testMode:
          content?.testMode ??
          (data.type === "test"
            ? "score"
            : null),
        results:
          resultConfig?.results ?? [],
        resultModel:
          resultConfig?.resultModel ?? null,
        offer:
          offerConfig ?? {
            enabled: false,
            title: "",
            description: "",
            price: 0,
          },
        guess: content?.guess
          ? {
              prompt:
                content.guess.prompt ??
                "Sence bu nedir?",
              acceptedAnswers:
                content.guess.acceptedAnswers ??
                [],
              successTitle:
                content.guess.successTitle ??
                "Bildin! ğŸ‰",
              successDescription:
                content.guess.successDescription ??
                "DoÄŸru cevabÄ± buldun.",
              retryEnabled:
                content.guess.retryEnabled ??
                true,
            }
          : null,
        story: content?.story
          ? {
              items: content.story.items ?? [],
              resultTitle:
                content.story.resultTitle ??
                "Sonuna geldin.",
              resultDescription:
                content.story.resultDescription ??
                "Ä°Ã§eriÄŸi tamamladÄ±n.",
            }
          : null,
      });
    } catch (error) {
      console.error(
        "YayÄ±nlanmÄ±ÅŸ Experience yÃ¼klenemedi:",
        error,
      );

      if (!cancelled) {
        setExperience(null);
        setUnavailableReason("error");
      }
    } finally {
      if (!cancelled) {
        setExperienceLoaded(true);
      }
    }
  }

  void loadExperience();

  return () => {
    cancelled = true;
  };
}, [experienceId]);
useEffect(() => {
  if (!experienceLoaded || !experience) {
    return;
  }

  void recordExperienceEvent({
    experienceId,
    eventType: "view",
  }).catch((error) => {
    console.error(
      "Experience view kaydedilemedi:",
      error,
    );
  });
}, [
  experience,
  experienceId,
  experienceLoaded,
]);

useEffect(() => {
  if (!experienceLoaded || !experience) {
    return;
  }

  const params = new URLSearchParams(
    window.location.search,
  );

  const payment = params.get("payment");
  const returnedOrderId = params.get("orderId");

  if (
    payment === "paid" ||
    payment === "failed" ||
    payment === "cancelled"
  ) {
    const pendingGiftOrderId =
      window.sessionStorage.getItem(
        "aqry-pending-gift-order",
      );

    const isGiftReturn =
      Boolean(returnedOrderId) &&
      pendingGiftOrderId === returnedOrderId;

    if (isGiftReturn) {
      setGiftPaymentResult(payment);
      setGiftPaymentOrderId(
        returnedOrderId,
      );
      setScreen("gift");

      if (
        payment === "paid" ||
        payment === "failed" ||
        payment === "cancelled"
      ) {
        window.sessionStorage.removeItem(
          "aqry-pending-gift-order",
        );
      }
    } else {
      setPaymentResult(payment);
      setPaymentOrderId(
        payment === "paid"
          ? returnedOrderId
          : null,
      );
      setScreen("offer");
    }

    window.history.replaceState(
      {},
      "",
      window.location.pathname,
    );
  }
}, [
  experience,
  experienceLoaded,
]);
  const [screen, setScreen] =
    useState<ExperienceScreen>("entry");

  const [paymentResult, setPaymentResult] =
    useState<"paid" | "failed" | "cancelled" | null>(
      null,
    );

  const [paymentOrderId, setPaymentOrderId] =
    useState<string | null>(null);

  const [giftPaymentResult, setGiftPaymentResult] =
    useState<"paid" | "failed" | "cancelled" | null>(null);

  const [giftPaymentOrderId, setGiftPaymentOrderId] =
    useState<string | null>(null);

  const [
    reportDialogOpen,
    setReportDialogOpen,
  ] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [participantAnswers, setParticipantAnswers] =
    useState<Record<number, number>>({});

  const [guessAnswer, setGuessAnswer] =
    useState("");

  const [guessError, setGuessError] =
    useState<string | null>(null);
  if (!experienceLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8fb]">
        <p className="text-xs font-bold text-muted-foreground">
          AQRYO yÃ¼kleniyor...
        </p>
      </div>
    );
  }

  if (!experience) {
    return (
      <ExperienceUnavailableState
        reason={
          unavailableReason ??
          "not_found"
        }
      />
    );
  }
  const currentQuestion =
    experience.questions[currentQuestionIndex];

  const selectedAnswer = currentQuestion
    ? participantAnswers[currentQuestion.id]
    : undefined;

  const progress =
    experience.questions.length > 0
      ? ((currentQuestionIndex + 1) /
          experience.questions.length) *
        100
      : 0;

  const calculatedOutcome =
    experience.type === "story"
      ? {
          score: 100,
          result:
            experience.results[0] ?? {
              id: "completed",
              range: "%100â€“100",
              title:
                experience.story?.resultTitle ??
                "Sonuna geldin.",
              description:
                experience.story?.resultDescription ??
                "Ä°Ã§eriÄŸi tamamladÄ±n.",
            },
        }
      : experience.type === "guess"
        ? {
            score: 100,
            result:
              experience.results[0] ?? {
                id: "correct",
                range: "%100â€“100",
                title:
                  experience.guess?.successTitle ??
                  "Bildin! ğŸ‰",
                description:
                  experience.guess?.successDescription ??
                  "DoÄŸru cevabÄ± buldun.",
              },
          }
        : experience.type === "test" &&
          experience.blueprint
        ? calculateBlueprintTestOutcome(
            experience,
            participantAnswers,
          )
        : calculateExperienceOutcome(
            experience,
            participantAnswers,
          );

  const resultScore =
    calculatedOutcome.score;

  const result =
    calculatedOutcome.result;

  async function finishQuestionFlow(
    answers: Record<number, number>,
  ) {
    if (!experience) return;

    const outcome =
      experience.type === "test" && experience.blueprint
        ? calculateBlueprintTestOutcome(experience, answers)
        : calculateExperienceOutcome(experience, answers);

    const orderedAnswers = experience.questions.map(
      (question) => answers[question.id] ?? -1,
    );

    try {
      await saveCompletion({
        experienceId,
        score: outcome.score,
        resultKey: outcome.result.title,
        answers: orderedAnswers,
      });
    } catch (error) {
      console.error("Tamamlama Supabase'e kaydedilemedi:", error);
    }

    setScreen("result");
  }

  function selectAnswer(optionIndex: number) {
    if (!currentQuestion || !experience) return;

    const nextAnswers = {
      ...participantAnswers,
      [currentQuestion.id]: optionIndex,
    };

    setParticipantAnswers(nextAnswers);

    const isLastQuestion =
      currentQuestionIndex === experience.questions.length - 1;

    window.setTimeout(() => {
      if (isLastQuestion) {
        void finishQuestionFlow(nextAnswers);
        return;
      }

      setCurrentQuestionIndex((currentIndex) => currentIndex + 1);
    }, 240);
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

  function normalizeGuessAnswer(
    value: string,
  ) {
    return value
      .trim()
      .toLocaleLowerCase("tr-TR")
      .replace(/\s+/g, " ");
  }

  async function submitGuessAnswer() {
    if (
      !experience ||
      experience.type !== "guess" ||
      !experience.guess
    ) {
      return;
    }

    const guess =
      experience.guess;

    const normalized =
      normalizeGuessAnswer(
        guessAnswer,
      );

    if (!normalized) {
      return;
    }

    const isCorrect =
      guess.acceptedAnswers.some(
        (answer) =>
          normalizeGuessAnswer(
            answer,
          ) === normalized,
      );

    if (!isCorrect) {
      setGuessError(
        "Bu cevap doÄŸru deÄŸil. Bir kez daha dene.",
      );
      return;
    }

    setGuessError(null);

    try {
      await saveCompletion({
        experienceId,
        score: 100,
        resultKey: "correct",
        answers: [],
      });
    } catch (error) {
      console.error(
        "Guess completion kaydedilemedi:",
        error,
      );
    }

    setScreen("result");
  }

  async function completeStory() {
    if (
      !experience ||
      experience.type !== "story" ||
      !experience.story
    ) {
      return;
    }

    try {
      await saveCompletion({
        experienceId,
        score: 100,
        resultKey: "completed",
        answers: [],
      });
    } catch (error) {
      console.error(
        "Story completion kaydedilemedi:",
        error,
      );
    }

    setScreen("result");
  }

  function restartExperience() {
    setParticipantAnswers({});
    setCurrentQuestionIndex(0);
    setGuessAnswer("");
    setGuessError(null);
    setScreen("entry");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_85%,rgba(124,58,237,0.06),transparent_28%),radial-gradient(circle_at_85%_85%,rgba(236,72,153,0.05),transparent_28%),#fbfafd] text-foreground">
      {captureShieldVisible ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#111119] px-6 text-center text-white">
          <div>
            <p className="text-[15px] font-black">
              Bu iÃ§erik korumalÄ±dÄ±r.
            </p>
            <p className="mt-2 text-[11px] text-white/55">
              Experienceâ€™a geri dÃ¶ndÃ¼ÄŸÃ¼nde iÃ§erik yeniden gÃ¶rÃ¼necek.
            </p>
          </div>
        </div>
      ) : null}

      <PublicNavigation />

      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1240px] flex-col items-center justify-center px-4 py-7 sm:px-6 sm:py-10">
        {screen === "entry" && experience.creator && (
          <button
            type="button"
            onClick={() => {
  window.location.href =
    `/creator/${experience.creator!.id}`;
}}
            className="relative z-10 mb-[-18px] flex items-center gap-3 rounded-[26px] border border-white/80 bg-white px-4 py-3 shadow-[0_14px_38px_rgba(34,17,52,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(34,17,52,0.16)]"
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/[0.08] text-[14px] font-black text-primary ring-2 ring-primary/20">
              {experience.creator.avatarUrl ? (
                <img
                  src={experience.creator.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                getCreatorInitials(
                  experience.creator.displayName,
                )
              )}
            </div>

            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <p className="max-w-[190px] truncate text-[12px] font-black sm:max-w-[240px]">
                  {experience.creator.displayName}
                </p>

                <span className="text-[12px] text-primary">
                  â—†
                </span>
              </div>

              <p className="mt-0.5 max-w-[190px] truncate text-[9px] font-semibold text-muted-foreground sm:max-w-[240px]">
                {experience.creator.username
                  ? `@${experience.creator.username}`
                  : "AQRYO creator"}
              </p>
            </div>
          </button>
        )}

        <div className="w-full max-w-[520px]">
          {screen === "entry" && (
            <EntryScreen
              experience={experience}
              onStart={() => {
  void recordExperienceEvent({
    experienceId,
    eventType: "start",
  }).catch((error) => {
    console.error(
      "Experience start kaydedilemedi:",
      error,
    );
  });

  setScreen(
    experience.type === "story"
      ? "story"
      : experience.type === "guess"
        ? "guess"
        : "questions",
  );
}}
            />
          )}

          {screen === "questions" &&
            currentQuestion && (
              <QuestionScreen
                question={currentQuestion}
                questionIndex={currentQuestionIndex}
                questionCount={
                  experience.questions.length
                }
                selectedAnswer={selectedAnswer}
                progress={progress}
                experienceType={experience.type}
                experienceTitle={experience.title}
                onSelectAnswer={selectAnswer}
                onPrevious={goToPreviousQuestion}
              />
            )}

          {screen === "story" &&
            experience.type === "story" &&
            experience.story && (
              <StoryContentScreen
                experience={experience}
                onBack={() =>
                  setScreen("entry")
                }
                onComplete={() => {
                  void completeStory();
                }}
              />
            )}

          {screen === "guess" &&
            experience.type === "guess" &&
            experience.guess && (
              <GuessAnswerScreen
                experience={experience}
                value={guessAnswer}
                error={guessError}
                onChange={(value) => {
                  setGuessAnswer(value);
                  if (guessError) {
                    setGuessError(null);
                  }
                }}
                onSubmit={() => {
                  void submitGuessAnswer();
                }}
                onBack={() =>
                  setScreen("entry")
                }
              />
            )}

          {screen === "result" &&
          experience.type === "story" &&
          experience.story ? (
            <StoryResultScreen
              experience={experience}
              onRestart={restartExperience}
              onOffer={() =>
                setScreen("offer")
              }
              onGift={() =>
                setScreen("gift")
              }
            />
          ) : screen === "result" &&
          experience.type === "guess" &&
          experience.guess ? (
            <GuessResultScreen
              experience={experience}
              onRestart={restartExperience}
              onOffer={() =>
                setScreen("offer")
              }
              onGift={() =>
                setScreen("gift")
              }
            />
          ) : screen === "result" ? (
            <ResultScreen
  score={resultScore}
  result={result}
  experienceTitle={experience.title}
  experienceType={experience.type}
  testMode={experience.testMode}
  testStrategy={
    experience.blueprint?.test
      ?.strategy ?? null
  }
  offerEnabled={experience.offer.enabled}
  offerTitle={experience.offer.title}
  onOffer={() => setScreen("offer")}
  onGift={() => setScreen("gift")}
  onRestart={restartExperience}
/>
          ) : null}

          {screen === "result" ? (
            <ExperienceFeedbackCard
              experienceId={experience.id}
            />
          ) : null}

          {screen === "gift" && (
            <GiftScreen
              experienceId={experience.id}
              creatorName={
                experience.creator?.displayName ||
                experience.creator?.username ||
                "creator"
              }
              paymentResult={giftPaymentResult}
              orderId={giftPaymentOrderId}
              onBack={() => {
                setGiftPaymentResult(null);
                setGiftPaymentOrderId(null);
                setScreen("result");
              }}
            />
          )}

          {screen === "offer" && (
            <OfferScreen
  experienceId={experience.id}
  experienceType={experience.type}
  offer={experience.offer}
  paymentResult={paymentResult}
  orderId={paymentOrderId}
  onExistingPaid={(orderId) => {
    setPaymentOrderId(orderId);
    setPaymentResult("paid");
  }}
  onBack={() => setScreen("result")}
/>
          )}

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() =>
                setReportDialogOpen(true)
              }
              className="text-[9px] font-bold text-muted-foreground underline decoration-border underline-offset-4 transition hover:text-foreground"
            >
              Ä°Ã§eriÄŸi bildir
            </button>
          </div>
        </div>
      </main>

      <ReportExperienceDialog
        experienceId={experience.id}
        open={reportDialogOpen}
        onClose={() =>
          setReportDialogOpen(false)
        }
      />
    </div>
  );
}

type FeedbackSummary = {
  total_count: number;
  negative_count: number;
  has_voted: boolean;
  participant_verdict: "appropriate" | "inappropriate" | null;
};

function ExperienceFeedbackCard({
  experienceId,
}: {
  experienceId: string;
}) {
  const [summary, setSummary] =
    useState<FeedbackSummary | null>(null);
  const [submitting, setSubmitting] =
    useState(false);
  const [showReasons, setShowReasons] =
    useState(false);
  const [message, setMessage] =
    useState<string | null>(null);

  const participantKey = getParticipantKey();

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      const { data, error } = await supabase.rpc(
        "get_experience_feedback_summary",
        {
          p_experience_id: experienceId,
          p_participant_key: participantKey,
        },
      );

      if (error) {
        console.error(
          "Experience deÄŸerlendirme Ã¶zeti yÃ¼klenemedi:",
          error,
        );
        return;
      }

      if (cancelled) {
        return;
      }

      const row = Array.isArray(data)
        ? data[0]
        : data;

      if (!row) {
        return;
      }

      setSummary({
        total_count: Number(row.total_count ?? 0),
        negative_count: Number(row.negative_count ?? 0),
        has_voted: Boolean(row.has_voted),
        participant_verdict:
          row.participant_verdict === "appropriate" ||
          row.participant_verdict === "inappropriate"
            ? row.participant_verdict
            : null,
      });
    }

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, [experienceId, participantKey]);

  async function submitFeedback(
    verdict: "appropriate" | "inappropriate",
    reason: string | null = null,
  ) {
    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      const { data, error } = await supabase.rpc(
        "submit_experience_feedback",
        {
          p_experience_id: experienceId,
          p_participant_key: participantKey,
          p_verdict: verdict,
          p_reason: reason,
        },
      );

      if (error) {
        throw error;
      }

      const row = Array.isArray(data)
        ? data[0]
        : data;

      setSummary({
        total_count: Number(row?.total_count ?? 0),
        negative_count: Number(row?.negative_count ?? 0),
        has_voted: true,
        participant_verdict: verdict,
      });

      setShowReasons(false);
      setMessage(
        verdict === "appropriate"
          ? "TeÅŸekkÃ¼rler. DeÄŸerlendirmen kaydedildi."
          : "TeÅŸekkÃ¼rler. Bildirimin incelemeye alÄ±ndÄ±.",
      );
    } catch (error) {
      console.error(
        "Experience deÄŸerlendirmesi kaydedilemedi:",
        error,
      );
      setMessage(
        "DeÄŸerlendirme ÅŸu anda kaydedilemedi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const totalCount = summary?.total_count ?? 0;
  const isEarlyWindow = totalCount < 50;
  const hasVoted = summary?.has_voted ?? false;

  if (hasVoted) {
    return (
      <div className="mt-3 rounded-[22px] border border-emerald-100 bg-emerald-50 px-5 py-4 text-center shadow-[0_14px_40px_rgba(35,16,55,0.06)]">
        <p className="text-[10px] font-black text-emerald-800">
          TeÅŸekkÃ¼rler. DeÄŸerlendirmen alÄ±ndÄ±.
        </p>
      </div>
    );
  }

  if (!isEarlyWindow && !showReasons) {
    return (
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => setShowReasons(true)}
          className="text-[9px] font-bold text-muted-foreground underline decoration-border underline-offset-4 transition hover:text-foreground"
        >
          Ä°Ã§eriÄŸi bildir
        </button>
      </div>
    );
  }

  const reasons = [
    ["harassment", "Taciz veya tehdit"],
    ["sexual", "Uygunsuz cinsel iÃ§erik"],
    ["fraud", "DolandÄ±rÄ±cÄ±lÄ±k / yanÄ±ltÄ±cÄ± iÃ§erik"],
    ["hate", "Nefret veya hedef gÃ¶sterme"],
    ["violence", "Åiddet / zarar"],
    ["other", "DiÄŸer ciddi sorun"],
  ] as const;

  if (showReasons) {
    return (
      <section className="mt-3 rounded-[24px] border border-border bg-white p-5 shadow-[0_14px_40px_rgba(35,16,55,0.08)]">
        <p className="text-[11px] font-black">
          Sorun nedir?
        </p>
        <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
          Bu alan iÃ§erik kalitesini deÄŸil, ciddi uygunsuzluklarÄ± bildirmek iÃ§indir.
        </p>

        <div className="mt-4 grid gap-2">
          {reasons.map(([value, label]) => (
            <button
              key={value}
              type="button"
              disabled={submitting}
              onClick={() =>
                void submitFeedback(
                  "inappropriate",
                  value,
                )
              }
              className="flex min-h-10 items-center rounded-[14px] border border-border px-4 text-left text-[9px] font-bold transition hover:border-red-200 hover:bg-red-50 disabled:opacity-40"
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowReasons(false)}
          className="mt-3 text-[9px] font-bold text-muted-foreground"
        >
          VazgeÃ§
        </button>

        {message ? (
          <p className="mt-3 text-[9px] font-bold text-muted-foreground">
            {message}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section className="mt-3 rounded-[24px] border border-primary/15 bg-white p-5 shadow-[0_14px_40px_rgba(35,16,55,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black">
            Bu iÃ§eriÄŸi deÄŸerlendiren ilk 50 kiÅŸi arasÄ±ndasÄ±n.
          </p>
          <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
            GÃ¶rÃ¼ÅŸÃ¼n bizim iÃ§in Ã¶nemli. Sence bu iÃ§erik toplum normlarÄ±na uygun mu?
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/[0.08] px-2.5 py-1 text-[8px] font-black text-primary">
          {Math.min(totalCount + 1, 50)} / 50
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={() =>
            void submitFeedback("appropriate")
          }
          className="flex h-11 items-center justify-center rounded-full border border-border bg-white text-[9px] font-black transition hover:border-emerald-200 hover:bg-emerald-50 disabled:opacity-40"
        >
          Uygun
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => setShowReasons(true)}
          className="flex h-11 items-center justify-center rounded-full bg-black text-[9px] font-black text-white transition hover:bg-red-600 disabled:opacity-40"
        >
          Uygun deÄŸil
        </button>
      </div>

      {message ? (
        <p className="mt-3 text-center text-[9px] font-bold text-muted-foreground">
          {message}
        </p>
      ) : null}
    </section>
  );
}

function EntryScreen({
  experience,
  onStart,
}: {
  experience: PublishedExperience;
  onStart: () => void;
}) {
  const coverClass = getCoverClass(
    experience.cover.style,
  );

  const estimatedMinutes = Math.max(
    1,
    Math.ceil(experience.questions.length / 6),
  );

  return (
    <>
      <article className="overflow-hidden rounded-[34px] border border-border bg-white shadow-[0_28px_80px_rgba(35,16,55,0.13)]">
        <div
          className={`relative h-[220px] overflow-hidden bg-gradient-to-br ${coverClass}`}
        >
          {experience.type ===
          "story" ? (
            <>
              {experience.cover.imageUrl.trim() ? (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <img
                    src={
                      experience.cover.imageUrl
                    }
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-6 pb-5 pt-16">
                <p className="max-w-[90%] text-[24px] font-black leading-[1] tracking-[-0.04em] text-white">
                  {experience.title}
                </p>
              </div>
            </>
          ) : experience.cover.imageUrl.trim() ? (
            <img
              src={experience.cover.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}

          <div className="absolute inset-0 bg-black/5" />

          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.13]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "16px 16px",
            }}
          />

          <div className="relative z-10 flex h-full flex-col justify-end p-7 text-white">
            <span className="text-5xl">
              {experience.type === "test"
                ? "âœ¦"
                : experience.type === "guess"
                  ? "?"
                  : experience.type === "story"
                    ? "â–¤"
                    : "â™¥"}
            </span>

            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.15em] text-white/85">
              {experience.type === "test"
                ? "AQRYO Test"
                : experience.type === "guess"
                  ? "AQRYO Tahmin"
                  : experience.type === "story"
                    ? "AQRYO Story"
                    : "AQRYO Experience"}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          <h1 className="text-[32px] font-black leading-[0.98] tracking-[-0.055em] sm:text-[35px]">
            {experience.title}
          </h1>

          <p className="mt-4 text-[12px] leading-5 text-muted-foreground">
            {experience.description}
          </p>

          <div className="mt-6 grid grid-cols-3 overflow-hidden rounded-[18px] border border-border bg-background">
            {experience.type === "story" ? (
              <>
                <EntryMetric
                  icon="â–¤"
                  label={`${experience.story?.items.length ?? 0} ekran`}
                />
                <EntryMetric
                  icon="â†•"
                  label="Ä°Ã§erik akÄ±ÅŸÄ±"
                  bordered
                />
                <EntryMetric
                  icon="â™¢"
                  label="Ãœcretsiz sonuÃ§"
                  bordered
                />
              </>
            ) : experience.type === "guess" ? (
              <>
                <EntryMetric
                  icon="?"
                  label="1 tahmin"
                />
                <EntryMetric
                  icon="âœ"
                  label="Serbest cevap"
                  bordered
                />
                <EntryMetric
                  icon="â™¢"
                  label="Ãœcretsiz sonuÃ§"
                  bordered
                />
              </>
            ) : (
              <>
                <EntryMetric
                  icon="â˜·"
                  label={`${experience.questions.length} soru`}
                />

                <EntryMetric
                  icon="â—·"
                  label={`~${estimatedMinutes} dakika`}
                  bordered
                />

                <EntryMetric
                  icon="â™¢"
                  label="Ãœcretsiz"
                  bordered
                />
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onStart}
            className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-black text-[11px] font-black text-white transition hover:bg-primary"
          >
            BaÅŸla â†’
          </button>
        </div>
      </article>

      <div className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-3 text-[8px] font-semibold text-muted-foreground">
        <button
          type="button"
          onClick={() =>
            window.location.assign("/")
          }
          className="transition hover:text-foreground"
        >
          â—‡ AQRYO ile oluÅŸturuldu
        </button>

        <span>Â·</span>

        <span>NasÄ±l Ã§alÄ±ÅŸÄ±r?</span>

        <span>Â·</span>

        <span>Gizlilik</span>
      </div>
    </>
  );
}


function StoryContentScreen({
  experience,
  onBack,
  onComplete,
}: {
  experience: PublishedExperience;
  onBack: () => void;
  onComplete: () => void;
}) {
  const story =
    experience.story;

  const [activeIndex, setActiveIndex] =
    useState(0);

  if (!story) {
    return null;
  }

  const slides =
    story.items.filter(
      (item) =>
        item.type === "text"
          ? item.text.trim()
              .length > 0
          : item.imageUrl
              .trim().length > 0,
    );

  if (slides.length === 0) {
    return null;
  }

  const index =
    Math.min(
      activeIndex,
      slides.length - 1,
    );

  const active =
    slides[index];

  const isFirst =
    index === 0;

  const isLast =
    index ===
    slides.length - 1;

  function goNext() {
    if (isLast) {
      onComplete();
      return;
    }

    setActiveIndex(
      (current) =>
        current + 1,
    );
  }

  function goPrevious() {
    if (isFirst) {
      onBack();
      return;
    }

    setActiveIndex(
      (current) =>
        current - 1,
    );
  }

  return (
    <section className="mx-auto w-full max-w-[560px]">
      <div className="mb-3 flex items-center gap-1.5 px-1">
        {slides.map(
          (item, itemIndex) => (
            <span
              key={item.id}
              className={`h-1 flex-1 rounded-full ${
                itemIndex <= index
                  ? "bg-foreground"
                  : "bg-foreground/10"
              }`}
            />
          ),
        )}
      </div>

      <article
        role="button"
        tabIndex={0}
        onClick={goNext}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " " ||
            event.key ===
              "ArrowRight"
          ) {
            event.preventDefault();
            goNext();
          }

          if (
            event.key ===
            "ArrowLeft"
          ) {
            event.preventDefault();
            goPrevious();
          }
        }}
        className="group relative flex min-h-[590px] cursor-pointer flex-col overflow-hidden rounded-[32px] border border-border bg-white shadow-[0_24px_70px_rgba(35,16,55,0.12)] outline-none sm:min-h-[640px]"
      >
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goPrevious();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-[14px] font-black"
          >
            â†
          </button>

          <div className="min-w-0 text-center">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">
              {experience.title}
            </p>

            <p className="mt-1 text-[9px] font-bold text-muted-foreground/70">
              {index + 1} /{" "}
              {slides.length}
            </p>
          </div>

          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-[10px] font-black text-muted-foreground">
            AQ
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6">
          {active.type ===
          "text" ? (
            <div className="flex min-h-0 flex-1 items-center rounded-[24px] bg-[#f7f7f8] px-6 py-10 sm:px-9">
              <p className="w-full whitespace-pre-wrap text-left text-[17px] font-black leading-[1.55] tracking-[-0.02em] text-foreground sm:text-[20px]">
                {active.text}
              </p>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[24px] bg-[#efeff2] p-3 sm:p-5">
              <img
                src={
                  active.imageUrl
                }
                alt=""
                draggable={false}
                onContextMenu={(
                  event,
                ) =>
                  event.preventDefault()
                }
                className="max-h-full max-w-full select-none object-contain"
              />
            </div>
          )}

          <div className="pointer-events-none mt-4 flex items-center justify-between">
            <p className="text-[9px] font-bold text-muted-foreground">
              {isLast
                ? "Sonucu gÃ¶rmek iÃ§in dokun"
                : "Devam etmek iÃ§in dokun"}
            </p>

            <span className="text-[13px] font-black">
              {isLast
                ? "SonuÃ§ â†’"
                : "â†’"}
            </span>
          </div>
        </div>
      </article>
    </section>
  );
}

function StoryResultScreen({
  experience,
  onRestart,
  onOffer,
  onGift,
}: {
  experience: PublishedExperience;
  onRestart: () => void;
  onOffer: () => void;
  onGift: () => void;
}) {
  const story =
    experience.story;

  if (!story) {
    return null;
  }

  return (
    <article className="rounded-[30px] border border-border bg-white p-6 text-center shadow-[0_24px_70px_rgba(35,16,55,0.12)] sm:p-7">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-[26px] text-teal-700">
        âœ“
      </div>

      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.14em] text-teal-600">
        TamamlandÄ±
      </p>

      <h2 className="mt-3 text-[31px] font-black leading-[1] tracking-[-0.05em]">
        {story.resultTitle}
      </h2>

      <p className="mx-auto mt-4 max-w-[390px] text-[12px] leading-6 text-muted-foreground">
        {story.resultDescription}
      </p>

      <button
        type="button"
        onClick={onGift}
        className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-[10px] font-black text-white"
      >
        Creatorâ€™a hediye gÃ¶nder ğŸ
      </button>

      {experience.offer.enabled ? (
        <button
          type="button"
          onClick={onOffer}
          className="mt-2.5 flex h-12 w-full items-center justify-center rounded-full bg-black text-[10px] font-black text-white transition hover:bg-primary"
        >
          {experience.offer.title ||
            "DevamÄ±nÄ± gÃ¶r"}{" "}
          â†’
        </button>
      ) : null}

      <button
        type="button"
        onClick={onRestart}
        className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-border bg-white text-[10px] font-black"
      >
        BaÅŸtan gÃ¶r
      </button>
    </article>
  );
}

function GuessAnswerScreen({
  experience,
  value,
  error,
  onChange,
  onSubmit,
  onBack,
}: {
  experience: PublishedExperience;
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const prompt =
    experience.guess?.prompt ??
    "Sence bu nedir?";

  return (
    <article className="overflow-hidden rounded-[30px] border border-border bg-white shadow-[0_24px_70px_rgba(35,16,55,0.12)]">
      {experience.cover.imageUrl.trim() ? (
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={experience.cover.imageUrl}
            alt=""
            draggable={false}
            onContextMenu={(event) =>
              event.preventDefault()
            }
            onDragStart={(event) =>
              event.preventDefault()
            }
            style={{
              WebkitTouchCallout:
                "none",
              WebkitUserSelect:
                "none",
              userSelect: "none",
            }}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="p-5 sm:p-6">
        <p className="text-[9px] font-black uppercase tracking-[0.13em] text-orange-600">
          Tahmin et
        </p>

        <h2 className="mt-3 text-[26px] font-black leading-[1.02] tracking-[-0.045em]">
          {prompt}
        </h2>

        <input
          autoFocus
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              value.trim()
            ) {
              onSubmit();
            }
          }}
          placeholder="CevabÄ±nÄ± yaz..."
          className={`mt-6 h-14 w-full rounded-[18px] border bg-background px-5 text-[14px] font-bold outline-none transition ${
            error
              ? "border-red-300 focus:border-red-400"
              : "border-border focus:border-orange-300"
          }`}
        />

        {error ? (
          <div className="mt-3 rounded-[16px] border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-[11px] font-bold text-red-700">
              {error}
            </p>
          </div>
        ) : null}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-12 items-center justify-center rounded-full border border-border bg-white px-5 text-[10px] font-black"
          >
            â† Geri
          </button>

          <button
            type="button"
            disabled={!value.trim()}
            onClick={onSubmit}
            className="flex h-12 flex-1 items-center justify-center rounded-full bg-black px-6 text-[10px] font-black text-white transition enabled:hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-20"
          >
            CevabÄ±mÄ± kontrol et â†’
          </button>
        </div>
      </div>
    </article>
  );
}

function GuessResultScreen({
  experience,
  onRestart,
  onOffer,
  onGift,
}: {
  experience: PublishedExperience;
  onRestart: () => void;
  onOffer: () => void;
  onGift: () => void;
}) {
  const guess =
    experience.guess;

  if (!guess) {
    return null;
  }

  return (
    <article className="rounded-[30px] border border-border bg-white p-6 text-center shadow-[0_24px_70px_rgba(35,16,55,0.12)] sm:p-7">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[28px]">
        âœ“
      </div>

      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">
        DoÄŸru cevap
      </p>

      <h2 className="mt-3 text-[31px] font-black leading-[1] tracking-[-0.05em]">
        {guess.successTitle}
      </h2>

      <p className="mx-auto mt-4 max-w-[390px] text-[12px] leading-6 text-muted-foreground">
        {guess.successDescription}
      </p>

      <button
        type="button"
        onClick={onGift}
        className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-[10px] font-black text-white"
      >
        Creatorâ€™a hediye gÃ¶nder ğŸ
      </button>

      {experience.offer.enabled ? (
        <button
          type="button"
          onClick={onOffer}
          className="mt-2.5 flex h-12 w-full items-center justify-center rounded-full bg-black text-[10px] font-black text-white transition hover:bg-primary"
        >
          {experience.offer.title ||
            "DevamÄ±nÄ± gÃ¶r"}{" "}
          â†’
        </button>
      ) : null}

      <button
        type="button"
        onClick={onRestart}
        className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-border bg-white text-[10px] font-black"
      >
        Tekrar dene
      </button>
    </article>
  );
}

function EntryMetric({
  icon,
  label,
  bordered = false,
}: {
  icon: string;
  label: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 items-center justify-center gap-2 px-2 py-4 ${
        bordered
          ? "border-l border-border"
          : ""
      }`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-[14px] font-black text-primary">
        {icon}
      </span>

      <span className="truncate text-[9px] font-black sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

function QuestionScreen({
  question,
  questionIndex,
  questionCount,
  selectedAnswer,
  progress,
  experienceType,
  experienceTitle,
  onSelectAnswer,
  onPrevious,
}: {
  question: Question;
  questionIndex: number;
  questionCount: number;
  selectedAnswer?: number;
  progress: number;
  experienceType: PublishedExperience["type"];
  experienceTitle: string;
  onSelectAnswer: (optionIndex: number) => void;
  onPrevious: () => void;
}) {
  return (
    <article className="rounded-[30px] border border-border bg-white p-5 shadow-[0_24px_70px_rgba(35,16,55,0.12)] sm:p-6">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-black text-primary">
          {questionIndex + 1}/{questionCount}
        </span>

        <span className="max-w-[250px] truncate text-right text-[13px] font-bold text-muted-foreground">
          {experienceTitle}
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
              className={`flex min-h-14 items-center gap-3 rounded-[16px] border px-4 py-3.5 text-left text-[16px] font-bold leading-[1.35] transition ${
                isSelected
                  ? "border-primary bg-primary text-white shadow-[0_10px_25px_rgba(124,58,237,0.18)]"
                  : "border-border bg-background text-foreground hover:border-primary/35"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
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

      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-white px-5 text-[11px] font-bold"
        >
          â† Ã–nceki soru
        </button>

        <span className="max-w-[180px] text-right text-[10px] font-semibold leading-4 text-muted-foreground">
          Bir cevap seÃ§tiÄŸinde otomatik ilerler.
        </span>
      </div>
    </article>
  );
}


function calculateBlueprintTestOutcome(
  experience: PublishedExperience,
  participantAnswers:
    Record<number, number>,
) {
  const blueprint =
    experience.blueprint;

  if (!blueprint) {
    return calculateExperienceOutcome(
      experience,
      participantAnswers,
    );
  }

  const answerMap: Record<
    string,
    string
  > = {};

  for (const question of
    experience.questions) {
    const selectedIndex =
      participantAnswers[
        question.id
      ];

    if (
      selectedIndex === undefined
    ) {
      continue;
    }

    const blueprintQuestion =
      blueprint.questions.find(
        (item) =>
          item.id ===
          `q${question.id}`,
      ) ??
      blueprint.questions[
        question.id - 1
      ];

    const blueprintOption =
      blueprintQuestion
        ?.options[
        selectedIndex
      ];

    if (
      blueprintQuestion &&
      blueprintOption
    ) {
      answerMap[
        blueprintQuestion.id
      ] = blueprintOption.id;
    }
  }

  const calculated =
    calculateTestResult(
      blueprint,
      answerMap,
    );

  return {
    score: calculated.score,
    result: {
      id:
        calculated.result?.id ??
        "result",
      range: "",
      title:
        calculated.result?.title ??
        "Sonucun hazÄ±r",
      description:
        calculated.result
          ?.description ??
        "CevaplarÄ±na gÃ¶re sonucun hesaplandÄ±.",
    },
  };
}

function ResultScreen({
  score,
  result,
  experienceTitle,
  experienceType,
  testMode,
  testStrategy,
  offerEnabled,
  offerTitle,
  onOffer,
  onGift,
  onRestart,
}: {
  score: number;
  result: ResultDefinition;
  experienceTitle: string;
  experienceType: PublishedExperience["type"];
  testMode: PublishedExperience["testMode"];
  testStrategy:
    | "score"
    | "spectrum"
    | "archetype"
    | null;
  offerEnabled: boolean;
  offerTitle: string;
  onOffer: () => void;
  onGift: () => void;
  onRestart: () => void;
}) {
  const isArchetypeTest =
    experienceType === "test" &&
    (testStrategy === "archetype" || testMode === "archetype");

  const isSpectrumTest =
    experienceType === "test" &&
    (
      testStrategy ===
        "spectrum" ||
      testMode === "spectrum"
    );

  const isScoreTest =
    experienceType === "test" &&
    !isArchetypeTest &&
    !isSpectrumTest;

  const displayResultTitle = result.title;
  const displayResultDescription = result.description;

  const shareText =
    isArchetypeTest
      ? `Bu teste gÃ¶re ben â€œ${displayResultTitle}â€ Ã§Ä±ktÄ±m. Sen ne Ã§Ä±kacaksÄ±n?`
      : isSpectrumTest
        ? `â€œ${experienceTitle}â€ sonucum %${score} Ã§Ä±ktÄ±. Seninki kaÃ§? ğŸ‘€`
        : experienceType === "compatibility"
          ? `Uyum sonucum %${score} Ã§Ä±ktÄ± ğŸ‘€ Sen benimle kaÃ§ yaparsÄ±n?`
          : `â€œ${experienceTitle}â€ testinde %${score} yaptÄ±m. Beni geÃ§ebilir misin? ğŸ‘€`;

  function copyResultLink() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        window.alert("Deneyim baÄŸlantÄ±sÄ± kopyalandÄ±.");
      })
      .catch(() => {
        window.alert("BaÄŸlantÄ± kopyalanamadÄ±.");
      });
  }

  function shareResult() {
    if (navigator.share) {
      navigator
        .share({
          title: experienceTitle,
          text: shareText,
          url: window.location.href,
        })
        .catch(() => {
          // KullanÄ±cÄ± paylaÅŸÄ±m ekranÄ±nÄ± kapatÄ±rsa iÅŸlem yapÄ±lmaz.
        });

      return;
    }

    copyResultLink();
  }

  function shareOnX() {
    const shareUrl = new URL(
      "https://twitter.com/intent/tweet",
    );

    shareUrl.searchParams.set("text", shareText);
    shareUrl.searchParams.set("url", window.location.href);

    window.open(
      shareUrl.toString(),
      "_blank",
      "noopener,noreferrer",
    );
  }
  return (
    <article className="overflow-hidden rounded-[30px] border border-border bg-white pb-3 shadow-[0_24px_70px_rgba(35,16,55,0.13)]">     <div className="bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 p-7 text-white">
        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/70">
          {experienceType === "compatibility"
            ? "Uyum sonucun"
            : isArchetypeTest
              ? "Senin sonucun"
              : isSpectrumTest
                ? "Seviyen"
                : "Test sonucun"}
        </p>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            {!isArchetypeTest && (
              <p className="text-[64px] font-black leading-none tracking-[-0.08em]">
                %{score}
              </p>
            )}

            <h2 className={`text-[22px] font-black tracking-[-0.04em] ${
              isArchetypeTest ? "" : "mt-3"
            }`}>
              {displayResultTitle}
            </h2>
          </div>

          <span className="text-5xl">â™¥</span>
        </div>

        <p className="mt-5 text-[15px] leading-6 text-white/90">
          {displayResultDescription}
        </p>
      </div>

      <div className="mt-4 rounded-[18px] border border-border bg-background p-4">
  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="text-[10px] font-black">
        Sonucunu paylaÅŸ
      </p>

      <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
        {experienceType === "compatibility"
          ? "ArkadaÅŸlarÄ±nÄ± teste davet et ve sonuÃ§larÄ±nÄ±zÄ± karÅŸÄ±laÅŸtÄ±rÄ±n."
          : "Sonucunu paylaÅŸ ve arkadaÅŸlarÄ±nÄ± bu Experienceâ€™a davet et."}
      </p>
    </div>

    <span className="text-xl">â†—</span>
  </div>

  <div className="mt-3 rounded-[13px] border border-border bg-white px-3 py-3">
    <p className="text-[13px] font-semibold leading-5 text-muted-foreground">
      {shareText}
    </p>
  </div>

  <div className="mt-3 grid grid-cols-2 gap-2">
    <button
      type="button"
      onClick={shareResult}
      className="flex h-10 items-center justify-center rounded-full bg-primary px-3 text-[9px] font-bold text-white"
    >
      Sonucumu paylaÅŸ
    </button>

    <button
      type="button"
      onClick={shareOnX}
      className="flex h-10 items-center justify-center rounded-full bg-black px-3 text-[9px] font-bold text-white"
    >
      Xâ€™te paylaÅŸ
    </button>
  </div>

  <button
    type="button"
    onClick={copyResultLink}
    className="mt-2 flex h-9 w-full items-center justify-center rounded-full border border-border bg-white text-[8px] font-bold text-muted-foreground"
  >
    BaÄŸlantÄ±yÄ± kopyala
  </button>
</div>

        <button
          type="button"
          onClick={onGift}
          className="mx-auto mt-5 flex h-12 w-[92%] items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-center text-[10px] font-black text-white shadow-[0_12px_28px_rgba(124,58,237,0.22)] transition hover:opacity-95"
        >
          Creatorâ€™a hediye gÃ¶nder ğŸ
        </button>

        {offerEnabled && (
          <button
            type="button"
            onClick={onOffer}
            className="mx-auto mt-2.5 flex h-11 w-[92%] items-center justify-center rounded-full bg-black px-5 text-center text-[10px] font-bold text-white transition hover:bg-primary"
          >
            {offerTitle || "Ekstra iÃ§eriÄŸi gÃ¶r"} â†’
          </button>
        )}

        <button
          type="button"
          onClick={onRestart}
         className="mx-auto mt-3 flex h-9 w-[72%] items-center justify-center rounded-full border border-border bg-white text-[9px] font-bold text-muted-foreground transition hover:bg-muted"
          >
          BaÅŸtan Ã§Ã¶z
        </button>
      </article>
  );
}

function PaidStoryContinuation({
  result,
  onBack,
}: {
  result: Extract<
    PaidOfferResult,
    { kind: "story" }
  >;
  onBack: () => void;
}) {
  const [activeIndex, setActiveIndex] =
    useState(0);

  const items =
    result.premiumItems.filter(
      (item) =>
        item.type === "text"
          ? item.text.trim()
              .length > 0
          : item.imageUrl
              .trim().length > 0,
    );

  if (items.length === 0) {
    return (
      <article className="rounded-[30px] border border-border bg-white p-6">
        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-primary">
          Ã–deme doÄŸrulandÄ±
        </p>

        <h2 className="mt-3 text-[24px] font-black">
          {result.offerTitle}
        </h2>

        <p className="mt-4 text-[13px] leading-6 text-muted-foreground">
          {result.premiumDescription}
        </p>

        <button
          type="button"
          onClick={onBack}
          className="mt-5 h-11 w-full rounded-full border border-border text-[9px] font-black"
        >
          Sonucuma dÃ¶n
        </button>
      </article>
    );
  }

  const index =
    Math.min(
      activeIndex,
      items.length - 1,
    );

  const active =
    items[index];

  const isLast =
    index ===
    items.length - 1;

  return (
    <section className="mx-auto w-full max-w-[560px]">
      <div className="mb-3 flex items-center gap-1.5 px-1">
        {items.map(
          (item, itemIndex) => (
            <span
              key={item.id}
              className={`h-1 flex-1 rounded-full ${
                itemIndex <= index
                  ? "bg-amber-500"
                  : "bg-foreground/10"
              }`}
            />
          ),
        )}
      </div>

      <article
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!isLast) {
            setActiveIndex(
              (current) =>
                current + 1,
            );
          }
        }}
        className="flex min-h-[590px] cursor-pointer flex-col overflow-hidden rounded-[32px] border border-amber-200 bg-white shadow-[0_24px_70px_rgba(35,16,55,0.12)] sm:min-h-[640px]"
      >
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              if (index === 0) {
                onBack();
              } else {
                setActiveIndex(
                  (current) =>
                    current - 1,
                );
              }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-[14px] font-black"
          >
            â†
          </button>

          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-amber-700">
              Ãœcretli devam
            </p>

            <p className="mt-1 text-[9px] font-bold text-muted-foreground">
              {index + 1} /{" "}
              {items.length}
            </p>
          </div>

          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-[10px] font-black text-amber-700">
            â‚º
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6">
          {active.type ===
          "text" ? (
            <div className="flex min-h-0 flex-1 items-center rounded-[24px] bg-[#f7f7f8] px-6 py-10 sm:px-9">
              <p className="w-full whitespace-pre-wrap text-left text-[17px] font-black leading-[1.55] tracking-[-0.02em] sm:text-[20px]">
                {active.text}
              </p>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center rounded-[24px] bg-[#efeff2] p-3 sm:p-5">
              <img
                src={
                  active.imageUrl
                }
                alt=""
                draggable={false}
                onContextMenu={(
                  event,
                ) =>
                  event.preventDefault()
                }
                className="max-h-full max-w-full select-none object-contain"
              />
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[9px] font-bold text-muted-foreground">
              {isLast
                ? "Ãœcretli devamÄ±n sonu"
                : "Devam etmek iÃ§in dokun"}
            </p>

            {isLast ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onBack();
                }}
                className="text-[9px] font-black"
              >
                Sonuca dÃ¶n
              </button>
            ) : (
              <span className="text-[13px] font-black">
                â†’
              </span>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}


const GIFT_OPTIONS: Array<{
  key: GiftKey;
  emoji: string;
  label: string;
  price: number;
}> = [
  { key: "coffee", emoji: "â˜•", label: "Kahve", price: 29 },
  { key: "heart", emoji: "ğŸ’œ", label: "Kalp", price: 99 },
  { key: "crown", emoji: "ğŸ‘‘", label: "TaÃ§", price: 249 },
  { key: "rocket", emoji: "ğŸš€", label: "Roket", price: 999 },
];

const GIFT_MESSAGES: Array<{
  key: GiftMessageKey;
  label: string;
}> = [
  { key: "liked", label: "Ä°Ã§eriÄŸini sevdim." },
  { key: "support", label: "Destekliyorum." },
  { key: "notice", label: "Beni fark et." },
  { key: "more", label: "DevamÄ±nÄ± bekliyorum." },
];

const CONTACT_OPTIONS: Array<{
  key: GiftContactType;
  label: string;
  placeholder: string;
}> = [
  { key: "none", label: "Anonim kal", placeholder: "" },
  { key: "instagram", label: "Instagram", placeholder: "@kullaniciadi" },
  { key: "telegram", label: "Telegram", placeholder: "@kullaniciadi" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "+90..." },
  { key: "email", label: "E-posta", placeholder: "mail@example.com" },
];

function GiftScreen({
  experienceId,
  creatorName,
  paymentResult,
  orderId,
  onBack,
}: {
  experienceId: string;
  creatorName: string;
  paymentResult: "paid" | "failed" | "cancelled" | null;
  orderId: string | null;
  onBack: () => void;
}) {
  const [giftKey, setGiftKey] =
    useState<GiftKey>("coffee");
  const [messageKey, setMessageKey] =
    useState<GiftMessageKey>("support");
  const [contactType, setContactType] =
    useState<GiftContactType>("none");
  const [contactValue, setContactValue] =
    useState("");
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const paymentLockRef =
    useRef(false);

  const selectedGift =
    GIFT_OPTIONS.find(
      (gift) => gift.key === giftKey,
    ) ?? GIFT_OPTIONS[1];

  async function sendGift() {
    if (
      paymentLockRef.current ||
      loading
    ) {
      return;
    }

    if (
      contactType !== "none" &&
      !contactValue.trim()
    ) {
      setError(
        "Ä°letiÅŸim kanalÄ±nÄ± seÃ§tiysen bilgini de yazmalÄ±sÄ±n.",
      );
      return;
    }

    try {
      paymentLockRef.current =
        true;
      setLoading(true);
      setError(null);

      const {
        order,
        payment,
      } =
        await createGiftOrderAndStartPayment({
          experienceId,
          giftKey,
          messageKey,
          contactType,
          contactValue:
            contactType === "none"
              ? ""
              : contactValue.trim(),
        });

      window.sessionStorage.setItem(
        "aqry-pending-gift-order",
        order.id,
      );

      const paymentUrl =
        payment?.paymentUrl;

      if (!paymentUrl) {
        throw new Error(
          "Ã–deme baÄŸlantÄ±sÄ± alÄ±namadÄ±.",
        );
      }

      window.location.href =
        paymentUrl;
    } catch (giftError) {
      const message =
        giftError instanceof Error
          ? giftError.message
          : "Hediye Ã¶demesi baÅŸlatÄ±lamadÄ±.";

      console.error(
        "Hediye baÅŸlatÄ±lamadÄ±:",
        giftError,
      );
      setError(message);
      paymentLockRef.current =
        false;
      setLoading(false);
    }
  }

  if (paymentResult === "paid") {
    return (
      <article className="rounded-[30px] border border-violet-100 bg-white p-7 text-center shadow-[0_24px_70px_rgba(35,16,55,0.12)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-50 text-[38px]">
          ğŸ
        </div>

        <p className="mt-5 text-[9px] font-black uppercase tracking-[0.14em] text-violet-600">
          Hediye gÃ¶nderildi
        </p>

        <h2 className="mt-3 text-[28px] font-black tracking-[-0.05em]">
          TeÅŸekkÃ¼rler.
        </h2>

        <p className="mx-auto mt-4 max-w-[390px] text-[12px] leading-6 text-muted-foreground">
          Hediyen {creatorName}â€™a ulaÅŸtÄ±. Ä°letiÅŸim bilgisi bÄ±raktÄ±ysan creator bunu gÃ¶rebilir; cevap verme zorunluluÄŸu yoktur.
        </p>

        {orderId ? (
          <p className="mt-3 text-[8px] font-bold text-muted-foreground/70">
            Ä°ÅŸlem: {orderId.slice(0, 8)}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onBack}
          className="mt-6 h-11 w-full rounded-full bg-black text-[10px] font-black text-white"
        >
          Sonucuma dÃ¶n
        </button>
      </article>
    );
  }

  return (
    <article className="rounded-[30px] border border-border bg-white p-5 shadow-[0_24px_70px_rgba(35,16,55,0.12)] sm:p-6">
      <button
        type="button"
        onClick={onBack}
        className="text-[9px] font-black text-muted-foreground"
      >
        â† Sonuca dÃ¶n
      </button>

      <div className="mt-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-[30px]">
          ğŸ
        </div>

        <h2 className="mt-4 text-[27px] font-black tracking-[-0.05em]">
          {creatorName}â€™a hediye gÃ¶nder
        </h2>

        <p className="mx-auto mt-3 max-w-[390px] text-[11px] leading-5 text-muted-foreground">
          Ä°Ã§eriÄŸi sevdiysen kÃ¼Ã§Ã¼k bir hediye bÄ±rak. Hediye destek ve fark edilme sinyalidir; cevap veya iletiÅŸim garantisi vermez.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-5 gap-2">
        {GIFT_OPTIONS.map((gift) => {
          const selected =
            gift.key === giftKey;

          return (
            <button
              key={gift.key}
              type="button"
              onClick={() =>
                setGiftKey(gift.key)
              }
              className={`rounded-[18px] border px-1 py-3 text-center transition ${
                selected
                  ? "border-violet-500 bg-violet-50 shadow-[0_8px_20px_rgba(124,58,237,0.13)]"
                  : "border-border bg-background"
              }`}
            >
              <span className="block text-[24px]">
                {gift.emoji}
              </span>
              <span className="mt-1 block text-[8px] font-black">
                {gift.label}
              </span>
              <span className="mt-0.5 block text-[8px] font-bold text-muted-foreground">
                {gift.price} TL
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <p className="text-[9px] font-black uppercase tracking-[0.1em]">
          MesajÄ±n
        </p>

        <div className="mt-2 grid grid-cols-2 gap-2">
          {GIFT_MESSAGES.map((message) => (
            <button
              key={message.key}
              type="button"
              onClick={() =>
                setMessageKey(
                  message.key,
                )
              }
              className={`min-h-11 rounded-[14px] border px-3 py-2 text-left text-[9px] font-bold ${
                message.key ===
                messageKey
                  ? "border-violet-500 bg-violet-50 text-violet-800"
                  : "border-border bg-background"
              }`}
            >
              {message.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[9px] font-black uppercase tracking-[0.1em]">
          Seni nasÄ±l gÃ¶rsÃ¼n?
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {CONTACT_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                setContactType(
                  option.key,
                );
                if (
                  option.key ===
                  "none"
                ) {
                  setContactValue("");
                }
              }}
              className={`rounded-full border px-3 py-2 text-[8px] font-black ${
                option.key ===
                contactType
                  ? "border-black bg-black text-white"
                  : "border-border bg-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {contactType !== "none" ? (
          <input
            value={contactValue}
            onChange={(event) =>
              setContactValue(
                event.target.value,
              )
            }
            maxLength={120}
            placeholder={
              CONTACT_OPTIONS.find(
                (option) =>
                  option.key ===
                  contactType,
              )?.placeholder ?? ""
            }
            className="mt-3 h-12 w-full rounded-[16px] border border-border bg-background px-4 text-[11px] font-bold outline-none focus:border-violet-400"
          />
        ) : null}

        <p className="mt-2 text-[8px] leading-4 text-muted-foreground">
          Ä°letiÅŸim bilgisi isteÄŸe baÄŸlÄ±dÄ±r. Creatorâ€™Ä±n sana ulaÅŸacaÄŸÄ±na dair sÃ¶z verilmez.
        </p>
      </div>

      {paymentResult === "failed" ||
      paymentResult === "cancelled" ? (
        <div className="mt-4 rounded-[15px] border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-[9px] font-bold text-amber-800">
            Ã–deme tamamlanmadÄ±. Ä°stersen tekrar deneyebilirsin.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-[15px] border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-[9px] font-bold text-red-700">
            {error}
          </p>
        </div>
      ) : null}

      <button
        type="button"
        disabled={loading}
        onClick={() => {
          void sendGift();
        }}
        className="mt-6 flex h-13 min-h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-[11px] font-black text-white transition disabled:opacity-50"
      >
        {loading
          ? "Ã–deme hazÄ±rlanÄ±yor..."
          : `${selectedGift.emoji} ${selectedGift.label} gÃ¶nder Â· ${selectedGift.price} TL`}
      </button>
    </article>
  );
}

function OfferScreen({
  experienceId,
  experienceType,
  offer,
  paymentResult,
  orderId,
  onExistingPaid,
  onBack,
}: {
  experienceId: string;
  experienceType: PublishedExperience["type"];
  offer: PublishedExperience["offer"];
  paymentResult:
    | "paid"
    | "failed"
    | "cancelled"
    | null;
  orderId: string | null;
  onExistingPaid: (orderId: string) => void;
  onBack: () => void;
}) {
  const [orderLoading, setOrderLoading] =
    useState(false);
  const orderLockRef =
    useRef(false);
  const [
    existingPaidChecking,
    setExistingPaidChecking,
  ] = useState(true);

  useEffect(() => {
    if (paymentResult === "paid" || orderId) {
      setExistingPaidChecking(false);
      return;
    }

    let cancelled = false;

    async function checkExistingPurchase() {
      try {
        setExistingPaidChecking(true);

        const existing =
          await getExistingPaidOrder(
            experienceId,
          );

        if (cancelled) {
          return;
        }

        if (
          existing.paid &&
          existing.orderId
        ) {
          setExistingPaidChecking(false);

          onExistingPaid(
            existing.orderId,
          );

          return;
        }

        setExistingPaidChecking(false);
      } catch (error) {
        console.error(
          "Ã–nceki satÄ±n alma kontrol edilemedi:",
          error,
        );

        if (!cancelled) {
          setExistingPaidChecking(false);
        }
      }
    }

    void checkExistingPurchase();

    return () => {
      cancelled = true;
    };
  }, [
    experienceId,
    orderId,
    paymentResult,
    onExistingPaid,
  ]);
  const [paidOfferResult, setPaidOfferResult] =
    useState<PaidOfferResult | null>(null);

  const [paidOfferLoading, setPaidOfferLoading] =
    useState(false);

  const [paidOfferError, setPaidOfferError] =
    useState<string | null>(null);

  useEffect(() => {
    if (paymentResult !== "paid") {
      setPaidOfferResult(null);
      setPaidOfferError(null);
      setPaidOfferLoading(false);
      return;
    }

    if (!orderId) {
      setPaidOfferResult(null);
      setPaidOfferError(
        "Ã–deme tamamlandÄ± ancak sipariÅŸ bilgisi bulunamadÄ±.",
      );
      setPaidOfferLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPaidOfferResult() {
      try {
        setPaidOfferLoading(true);
        setPaidOfferError(null);
        setPaidOfferResult(null);
if (!orderId) {
  throw new Error(
    "Ã–deme sipariÅŸ bilgisi bulunamadÄ±.",
  );
}
        const result =
          (await getPaidOfferResult(
            orderId,
          )) as PaidOfferResult;

        if (!cancelled) {
          setPaidOfferResult(result);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Ãœcretli sonuÃ§ doÄŸrulanamadÄ±.";

        console.error(
          "Ãœcretli sonuÃ§ doÄŸrulanamadÄ±:",
          error,
        );

        setPaidOfferError(message);
      } finally {
        if (!cancelled) {
          setPaidOfferLoading(false);
        }
      }
    }

    void loadPaidOfferResult();

    return () => {
      cancelled = true;
    };
  }, [
    orderId,
    paymentResult,
  ]);

  async function startPayment() {
    if (
      orderLockRef.current ||
      orderLoading
    ) {
      return;
    }

    try {
      orderLockRef.current =
        true;
      setOrderLoading(true);

      const {
  order,
  alreadyPaid,
  payment,
} = await createOrderAndStartPayment(
  experienceId,
);

if (alreadyPaid) {
  onExistingPaid(order.id);
  return;
}
const paymentUrl =
  payment?.paymentUrl;

if (!paymentUrl) {
  throw new Error(
    "Ã–deme baÄŸlantÄ±sÄ± alÄ±namadÄ±.",
  );
}

window.location.href =
  paymentUrl;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "SipariÅŸ oluÅŸturulamadÄ±.";

      console.error(
        "SipariÅŸ oluÅŸturulamadÄ±:",
        error,
      );

      window.alert(message);
    } finally {
      orderLockRef.current =
        false;
      setOrderLoading(false);
    }
  }

  if (paymentResult === "paid") {
    if (paidOfferLoading) {
      return (
        <article className="overflow-hidden rounded-[30px] border border-border bg-white shadow-[0_24px_70px_rgba(35,16,55,0.13)]">
          <div className="p-7 text-center">
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-primary">
              Ã–deme doÄŸrulanÄ±yor
            </p>

            <h2 className="mt-4 text-[24px] font-black tracking-[-0.04em]">
              SatÄ±n aldÄ±ÄŸÄ±n iÃ§erik hazÄ±rlanÄ±yor
            </h2>

            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
              SipariÅŸ ve katÄ±lÄ±mcÄ± bilgilerin sunucuda doÄŸrulanÄ±yor.
            </p>
          </div>
        </article>
      );
    }

    if (paidOfferError || !paidOfferResult) {
      return (
        <article className="overflow-hidden rounded-[30px] border border-border bg-white shadow-[0_24px_70px_rgba(35,16,55,0.13)]">
          <div className="p-7">
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-red-500">
              Premium eriÅŸim doÄŸrulanamadÄ±
            </p>

            <h2 className="mt-4 text-[25px] font-black tracking-[-0.04em]">
              SatÄ±n aldÄ±ÄŸÄ±n iÃ§erik aÃ§Ä±lamadÄ±
            </h2>

            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
              {paidOfferError ??
                "SatÄ±n alma bilgisi doÄŸrulanamadÄ±."}
            </p>

            <button
              type="button"
              onClick={onBack}
              className="mt-5 flex h-11 w-full items-center justify-center rounded-full border border-border bg-white text-[9px] font-bold text-muted-foreground"
            >
              Ãœcretsiz sonucuma dÃ¶n
            </button>
          </div>
        </article>
      );
    }

    if (
      paidOfferResult.kind ===
      "compatibility"
    ) {
      return (
      <article className="overflow-hidden rounded-[30px] border border-emerald-200 bg-white shadow-[0_24px_70px_rgba(35,16,55,0.13)]">
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-7 text-white">
          <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/75">
            Ã–deme doÄŸrulandÄ±
          </p>

          <div className="mt-8">
            <span className="text-5xl">âœ“</span>

            <h2 className="mt-5 text-[28px] font-black leading-[1] tracking-[-0.05em]">
              DetaylÄ± uyum haritan
            </h2>

            <p className="mt-4 text-[12px] leading-5 text-white/85">
              %{paidOfferResult.score} uyum sonucunun hangi cevaplardan oluÅŸtuÄŸunu ÅŸimdi gÃ¶rebilirsin.
            </p>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <section className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black text-emerald-950">
                  Uyumlu olduÄŸunuz konular
                </p>
                <p className="mt-1 text-[9px] leading-4 text-emerald-800">
                  AynÄ± seÃ§eneÄŸi verdiÄŸiniz {paidOfferResult.matchingAnswers.length} soru
                </p>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-[9px] font-black text-emerald-700">
                {paidOfferResult.matchingAnswers.length}
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {paidOfferResult.matchingAnswers.length === 0 ? (
                <div className="rounded-[15px] border border-emerald-200 bg-white p-3">
                  <p className="text-[10px] leading-5 text-emerald-900">
                    Bu sonuÃ§ta tamamen aynÄ± cevap verdiÄŸiniz bir soru yok.
                  </p>
                </div>
              ) : (
                paidOfferResult.matchingAnswers.map(
                  (item, index) => (
                    <div
                      key={`${item.question}-${index}`}
                      className="rounded-[15px] border border-emerald-200 bg-white p-3"
                    >
                      <p className="text-[10px] font-black leading-4 text-foreground">
                        {item.question}
                      </p>

                      <p className="mt-2 text-[9px] font-semibold leading-4 text-emerald-700">
                        Ortak cevabÄ±nÄ±z: {item.answer}
                      </p>
                    </div>
                  ),
                )
              )}
            </div>
          </section>

          <section className="rounded-[20px] border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black text-rose-950">
                  FarklÄ± dÃ¼ÅŸÃ¼ndÃ¼ÄŸÃ¼nÃ¼z konular
                </p>
                <p className="mt-1 text-[9px] leading-4 text-rose-800">
                  FarklÄ± seÃ§enek verdiÄŸiniz {paidOfferResult.differentAnswers.length} soru
                </p>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-[9px] font-black text-rose-700">
                {paidOfferResult.differentAnswers.length}
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {paidOfferResult.differentAnswers.length === 0 ? (
                <div className="rounded-[15px] border border-rose-200 bg-white p-3">
                  <p className="text-[10px] leading-5 text-rose-900">
                    TÃ¼m karÅŸÄ±laÅŸtÄ±rÄ±labilir sorularda aynÄ± cevabÄ± verdiniz.
                  </p>
                </div>
              ) : (
                paidOfferResult.differentAnswers.map(
                  (item, index) => (
                    <div
                      key={`${item.question}-${index}`}
                      className="rounded-[15px] border border-rose-200 bg-white p-3"
                    >
                      <p className="text-[10px] font-black leading-4 text-foreground">
                        {item.question}
                      </p>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-[12px] bg-background p-3">
                          <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                            Senin cevabÄ±n
                          </p>
                          <p className="mt-1 text-[9px] font-bold leading-4">
                            {item.participantAnswer}
                          </p>
                        </div>

                        <div className="rounded-[12px] bg-background p-3">
                          <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                            Creatorâ€™Ä±n cevabÄ±
                          </p>
                          <p className="mt-1 text-[9px] font-bold leading-4">
                            {item.creatorAnswer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                )
              )}
            </div>
          </section>

          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-full items-center justify-center rounded-full border border-border bg-white text-[9px] font-bold text-muted-foreground"
          >
            Ãœcretsiz sonucuma dÃ¶n
          </button>
        </div>
      </article>
      );
    }

    if (
      paidOfferResult.kind ===
      "test_score"
    ) {
      return (
        <article className="overflow-hidden rounded-[30px] border border-border bg-white shadow-[0_24px_70px_rgba(35,16,55,0.13)]">
          <div className="bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 p-7 text-white">
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/75">
              Premium performans raporu
            </p>

            <div className="mt-7">
              <span className="text-5xl">âœ¦</span>

              <h2 className="mt-5 text-[28px] font-black leading-[1] tracking-[-0.05em]">
                {paidOfferResult.resultTitle ||
                  "DetaylÄ± performansÄ±n"}
              </h2>

              <p className="mt-4 text-[12px] leading-5 text-white/85">
                %{paidOfferResult.score} skorunun hangi sorulardan oluÅŸtuÄŸunu ÅŸimdi gÃ¶rebilirsin.
              </p>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-[16px] border border-border bg-background p-3 text-center">
                <p className="text-[18px] font-black">
                  {paidOfferResult.totalQuestions}
                </p>
                <p className="mt-1 text-[8px] font-bold text-muted-foreground">
                  Soru
                </p>
              </div>

              <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 p-3 text-center">
                <p className="text-[18px] font-black text-emerald-700">
                  {paidOfferResult.correctCount}
                </p>
                <p className="mt-1 text-[8px] font-bold text-emerald-700">
                  DoÄŸru
                </p>
              </div>

              <div className="rounded-[16px] border border-rose-200 bg-rose-50 p-3 text-center">
                <p className="text-[18px] font-black text-rose-700">
                  {paidOfferResult.incorrectCount}
                </p>
                <p className="mt-1 text-[8px] font-bold text-rose-700">
                  YanlÄ±ÅŸ
                </p>
              </div>
            </div>

            <section className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[10px] font-black text-emerald-950">
                DoÄŸru cevapladÄ±klarÄ±n
              </p>

              <div className="mt-3 space-y-2">
                {paidOfferResult.correctAnswers.length === 0 ? (
                  <p className="rounded-[14px] bg-white p-3 text-[9px] text-emerald-900">
                    Bu testte doÄŸru cevap bulunmuyor.
                  </p>
                ) : (
                  paidOfferResult.correctAnswers.map(
                    (item, index) => (
                      <div
                        key={`${item.question}-${index}`}
                        className="rounded-[14px] bg-white p-3"
                      >
                        <p className="text-[10px] font-black">
                          {item.question}
                        </p>

                        <p className="mt-2 text-[9px] font-semibold text-emerald-700">
                          DoÄŸru cevabÄ±n: {item.participantAnswer}
                        </p>
                      </div>
                    ),
                  )
                )}
              </div>
            </section>

            <section className="rounded-[20px] border border-rose-200 bg-rose-50 p-4">
              <p className="text-[10px] font-black text-rose-950">
                GeliÅŸtirebileceÄŸin sorular
              </p>

              <div className="mt-3 space-y-2">
                {paidOfferResult.incorrectAnswers.length === 0 ? (
                  <p className="rounded-[14px] bg-white p-3 text-[9px] text-emerald-900">
                    TÃ¼m sorularÄ± doÄŸru cevapladÄ±n.
                  </p>
                ) : (
                  paidOfferResult.incorrectAnswers.map(
                    (item, index) => (
                      <div
                        key={`${item.question}-${index}`}
                        className="rounded-[14px] bg-white p-3"
                      >
                        <p className="text-[10px] font-black">
                          {item.question}
                        </p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-[12px] bg-background p-3">
                            <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                              Senin cevabÄ±n
                            </p>
                            <p className="mt-1 text-[9px] font-bold">
                              {item.participantAnswer}
                            </p>
                          </div>

                          <div className="rounded-[12px] bg-background p-3">
                            <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                              DoÄŸru cevap
                            </p>
                            <p className="mt-1 text-[9px] font-bold text-emerald-700">
                              {item.correctAnswer}
                            </p>
                          </div>
                        </div>
                      </div>
                    ),
                  )
                )}
              </div>
            </section>

            <button
              type="button"
              onClick={onBack}
              className="flex h-11 w-full items-center justify-center rounded-full border border-border bg-white text-[9px] font-bold text-muted-foreground"
            >
              Ãœcretsiz sonucuma dÃ¶n
            </button>
          </div>
        </article>
      );
    }

    if (
      paidOfferResult.kind ===
      "test_spectrum"
    ) {
      const insights =
        paidOfferResult.insights;

      return (
        <article className="overflow-hidden rounded-[30px] border border-border bg-white shadow-[0_24px_70px_rgba(35,16,55,0.13)]">
          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-500 p-7 text-white">
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/75">
              KiÅŸisel premium harita
            </p>

            <div className="mt-7">
              <span className="text-5xl">â†•</span>

              <h2 className="mt-5 text-[28px] font-black leading-[1] tracking-[-0.05em]">
                {paidOfferResult.offerTitle ||
                  "KiÅŸisel Haritan"}
              </h2>

              <p className="mt-4 text-[12px] leading-5 text-white/85">
                Genel seviyen %{paidOfferResult.score}. AÅŸaÄŸÄ±daki bÃ¶lÃ¼m cevaplarÄ±nÄ± tekrar etmez; hangi durumlarda yÃ¼kseldiÄŸini ve cevaplarÄ±nÄ±n birlikte oluÅŸturduÄŸu Ã¶rÃ¼ntÃ¼yÃ¼ gÃ¶sterir.
              </p>
            </div>
          </div>

          <div className="space-y-3 p-6">
            {insights.strongestTrigger && (
              <section className="rounded-[20px] border border-border bg-background p-4">
                <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-primary">
                  En gÃ¼Ã§lÃ¼ tetikleyicin
                </p>
                <p className="mt-2 text-[12px] font-black leading-5">
                  {insights.strongestTrigger.question}
                </p>
                <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
                  Bu senaryoda verdiÄŸin tepki, kiÅŸisel haritandaki en yÃ¼ksek yoÄŸunluklu alanlardan biri.
                </p>
                <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-[9px] font-black text-primary">
                  YoÄŸunluk %{insights.strongestTrigger.intensity}
                </span>
              </section>
            )}

            <section className="rounded-[20px] border border-border bg-background p-4">
              <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-primary">
                Tepki biÃ§imin
              </p>
              <p className="mt-2 text-[11px] font-semibold leading-5">
                {insights.reactionPattern}
              </p>
              <p className="mt-3 text-[9px] text-muted-foreground">
                {insights.highIntensityCount} yÃ¼ksek yoÄŸunluklu Â· {insights.lowIntensityCount} dÃ¼ÅŸÃ¼k yoÄŸunluklu cevap
              </p>
            </section>

            {insights.calmestArea && (
              <section className="rounded-[20px] border border-border bg-background p-4">
                <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-emerald-700">
                  En sakin olduÄŸun alan
                </p>
                <p className="mt-2 text-[12px] font-black leading-5">
                  {insights.calmestArea.question}
                </p>
                <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
                  Burada daha kontrollÃ¼ kalÄ±yorsun. Bu alan, genel skorunun her durumda aynÄ± tepkiyi vermediÄŸini gÃ¶steriyor.
                </p>
              </section>
            )}

            {insights.redZone.length > 0 && (
              <section className="rounded-[20px] border border-border bg-background p-4">
                <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-rose-600">
                  KÄ±rmÄ±zÄ± bÃ¶lgen
                </p>
                <div className="mt-3 space-y-2">
                  {insights.redZone.map(
                    (question) => (
                      <div
                        key={question}
                        className="rounded-[14px] bg-white px-3 py-3 text-[10px] font-bold leading-4"
                      >
                        {question}
                      </div>
                    ),
                  )}
                </div>
              </section>
            )}

            <section className="rounded-[20px] border border-primary/20 bg-primary/5 p-4">
              <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-primary">
                SÃ¼rpriz iÃ§gÃ¶rÃ¼
              </p>
              <p className="mt-2 text-[11px] font-semibold leading-5">
                {insights.surpriseInsight}
              </p>
            </section>

            <button
              type="button"
              onClick={onBack}
              className="flex h-11 w-full items-center justify-center rounded-full border border-border bg-white text-[9px] font-bold text-muted-foreground"
            >
              Ãœcretsiz sonucuma dÃ¶n
            </button>
          </div>
        </article>
      );
    }

    if (
      paidOfferResult.kind ===
        "story"
    ) {
      return (
        <PaidStoryContinuation
          result={paidOfferResult}
          onBack={onBack}
        />
      );
    }

    if (
      paidOfferResult.kind ===
        "guess"
    ) {
      return (
        <article className="overflow-hidden rounded-[30px] border border-border bg-white shadow-[0_24px_70px_rgba(35,16,55,0.13)]">
          <div className="bg-black p-7 text-white">
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/60">
              Ã–deme doÄŸrulandÄ±
            </p>

            <h2 className="mt-5 text-[28px] font-black leading-[1] tracking-[-0.05em]">
              {paidOfferResult.offerTitle ||
                "Ä°Ã§eriÄŸin aÃ§Ä±ldÄ±"}
            </h2>
          </div>

          <div className="p-6">
            <p className="whitespace-pre-wrap text-[13px] font-semibold leading-6">
              {paidOfferResult.premiumDescription ||
                paidOfferResult.offerDescription ||
                "Ã–deme baÅŸarÄ±yla tamamlandÄ±."}
            </p>

            <button
              type="button"
              onClick={onBack}
              className="mt-4 h-11 w-full rounded-full border border-border text-[9px] font-black"
            >
              Ãœcretsiz sonucuma dÃ¶n
            </button>
          </div>
        </article>
      );
    }

    return (
      <article className="overflow-hidden rounded-[30px] border border-border bg-white shadow-[0_24px_70px_rgba(35,16,55,0.13)]">
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 p-7 text-white">
          <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/75">
            {paidOfferResult.kind ===
            "test_archetype"
              ? "Premium eÅŸleÅŸme analizi"
              : "Premium profil analizi"}
          </p>

          <div className="mt-7">
            <span className="text-5xl">â—†</span>

            <h2 className="mt-5 text-[28px] font-black leading-[1] tracking-[-0.05em]">
              {paidOfferResult.resultTitle}
            </h2>

            {paidOfferResult.winningProfile && (
              <p className="mt-4 text-[12px] leading-5 text-white/85">
                CevaplarÄ±nÄ±n %{paidOfferResult.winningProfile.percentage} kadarÄ± en gÃ¼Ã§lÃ¼ olarak â€œ{paidOfferResult.winningProfile.title}â€ profiline iÅŸaret ediyor.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 p-6">
          <section className="rounded-[20px] border border-border bg-background p-4">
            <p className="text-[10px] font-black">
              Profil daÄŸÄ±lÄ±mÄ±n
            </p>

            <div className="mt-4 space-y-3">
              {paidOfferResult.breakdown.map(
                (item) => (
                  <div
                    key={item.profileId}
                    className="rounded-[15px] border border-border bg-white p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-black">
                        {item.title}
                      </p>

                      <span className="text-[10px] font-black text-primary">
                        %{item.percentage}
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>

                    {item.description && (
                      <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="rounded-[20px] border border-border bg-white p-4">
            <p className="text-[10px] font-black">
              CevaplarÄ±nÄ±n iÅŸaret ettiÄŸi profiller
            </p>

            <div className="mt-3 space-y-2">
              {paidOfferResult.answers.map(
                (item, index) => (
                  <div
                    key={`${item.question}-${index}`}
                    className="rounded-[14px] border border-border bg-background p-3"
                  >
                    <p className="text-[10px] font-black">
                      {item.question}
                    </p>

                    <p className="mt-2 text-[9px] font-semibold text-muted-foreground">
                      Senin cevabÄ±n: {item.answer}
                    </p>

                    <p className="mt-1 text-[9px] font-bold text-primary">
                      {item.profileTitle
                        ? `Ä°ÅŸaret ettiÄŸi profil: ${item.profileTitle}`
                        : "Bu cevap sonuÃ§ daÄŸÄ±lÄ±mÄ±na katkÄ± saÄŸladÄ±."}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>

          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-full items-center justify-center rounded-full border border-border bg-white text-[9px] font-bold text-muted-foreground"
          >
            Ãœcretsiz sonucuma dÃ¶n
          </button>
        </div>
      </article>
    );
  }

  if (
    paymentResult === "failed" ||
    paymentResult === "cancelled"
  ) {
    return (
      <article className="overflow-hidden rounded-[30px] border border-border bg-white shadow-[0_24px_70px_rgba(35,16,55,0.13)]">
        <div className="p-7">
          <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-red-500">
            Ã–deme tamamlanmadÄ±
          </p>

          <h2 className="mt-4 text-[25px] font-black tracking-[-0.04em]">
            Tekrar deneyebilirsin
          </h2>

          <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
            Ä°ÅŸlem baÅŸarÄ±sÄ±z oldu veya Ã¶deme ekranÄ± kapatÄ±ldÄ±.
          </p>

          <button
            type="button"
            disabled={orderLoading}
            onClick={startPayment}
            className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-black text-[10px] font-bold text-white transition enabled:hover:bg-primary disabled:cursor-wait disabled:bg-black/40"
          >
            {orderLoading
              ? "SipariÅŸ hazÄ±rlanÄ±yor..."
              : "Ã–demeyi tekrar dene"}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-full border border-border bg-white text-[9px] font-bold text-muted-foreground"
          >
            Ãœcretsiz sonucuma dÃ¶n
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-[30px] border border-border bg-white shadow-[0_24px_70px_rgba(35,16,55,0.13)]">
      <div className="bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 p-7 text-white">
        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/70">
          Sonucundan sonra
        </p>

        <div className="mt-10">
          <span className="text-5xl">âœ¦</span>

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
              Teklif fiyatÄ±
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
          disabled={orderLoading}
          onClick={startPayment}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-black text-[10px] font-bold text-white transition enabled:hover:bg-primary disabled:cursor-wait disabled:bg-black/40"
        >
          {orderLoading
            ? "SipariÅŸ hazÄ±rlanÄ±yor..."
            : `9 TL ile aÃ§`}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="mt-2 flex h-11 w-full items-center justify-center rounded-full border border-border bg-white text-[9px] font-bold text-muted-foreground"
        >
          Ãœcretsiz sonucuma dÃ¶n
        </button>
      </div>
    </article>
  );
}

function calculateExperienceOutcome(
  experience: PublishedExperience,
  participantAnswers: Record<
    number,
    number
  >,
) {
  if (
    experience.type ===
    "compatibility"
  ) {
    const score =
      calculateCompatibilityScore(
        experience.questions,
        experience.creatorAnswers,
        participantAnswers,
      );

    return {
      score,
      result: findScoreResult(
        score,
        experience.results,
      ),
    };
  }

  const score =
    calculateScoreTestResult(
      experience.questions,
      experience.creatorAnswers,
      participantAnswers,
    );

  return {
    score,
    result: findScoreResult(
      score,
      experience.results,
    ),
  };
}

function calculateCompatibilityScore(
  questions: Question[],
  creatorAnswers: Record<
    number,
    number
  >,
  participantAnswers: Record<
    number,
    number
  >,
) {
  if (questions.length === 0) {
    return 0;
  }

  const comparableQuestions =
    questions.filter(
      (question) =>
        creatorAnswers[
          question.id
        ] !== undefined &&
        participantAnswers[
          question.id
        ] !== undefined,
    );

  if (
    comparableQuestions.length === 0
  ) {
    return 0;
  }

  const matchingAnswers =
    comparableQuestions.filter(
      (question) =>
        creatorAnswers[
          question.id
        ] ===
        participantAnswers[
          question.id
        ],
    ).length;

  return Math.round(
    (matchingAnswers /
      comparableQuestions.length) *
      100,
  );
}

function calculateScoreTestResult(
  questions: Question[],
  correctAnswers: Record<
    number,
    number
  >,
  participantAnswers: Record<
    number,
    number
  >,
) {
  if (questions.length === 0) {
    return 0;
  }

  const answeredQuestions =
    questions.filter(
      (question) =>
        participantAnswers[
          question.id
        ] !== undefined,
    );

  if (
    answeredQuestions.length === 0
  ) {
    return 0;
  }

  const correctCount =
    answeredQuestions.filter(
      (question) =>
        correctAnswers[
          question.id
        ] !== undefined &&
        correctAnswers[
          question.id
        ] ===
          participantAnswers[
            question.id
          ],
    ).length;

  return Math.round(
    (correctCount /
      questions.length) *
      100,
  );
}

function findScoreResult(
  score: number,
  results: ResultDefinition[],
) {
  if (results.length === 0) {
    return {
      id: "result",
      range: "%0â€“100",
      title: "Sonucun hazÄ±r",
      description:
        "Experience tamamlandÄ±.",
    };
  }

  for (const result of results) {
    const parsed =
      parseResultRange(
        result.range,
      );

    if (
      parsed &&
      score >= parsed.min &&
      score <= parsed.max
    ) {
      return result;
    }
  }

  return (
    results.find(
      (result) =>
        score >= 80 &&
        result === results[0],
    ) ??
    results[
      results.length - 1
    ]
  );
}

function parseResultRange(
  range: string,
) {
  const values =
    range.match(/\d+/g);

  if (!values?.length) {
    return null;
  }

  const first = Number(
    values[0],
  );

  const second =
    values.length > 1
      ? Number(values[1])
      : first;

  if (
    !Number.isFinite(first) ||
    !Number.isFinite(second)
  ) {
    return null;
  }

  return {
    min: Math.min(
      first,
      second,
    ),
    max: Math.max(
      first,
      second,
    ),
  };
}

function getCreatorInitials(
  displayName: string,
) {
  const words = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "AQ";
  }

  return words
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase(),
    )
    .join("");
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
