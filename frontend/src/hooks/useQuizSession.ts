import { useCallback, useEffect, useMemo, useState } from "react";
import type { QuizResult, QuizSessionState, Test } from "@/types";
import { calculateResult } from "@/utils/calculateResult";
import { clearSession, emptySession, loadSession, saveSession } from "@/utils/storage";
import { trackEvent } from "@/utils/analytics";

export interface UseQuizSession {
  currentQuestionIndex: number;
  answers: Record<string, string>;
  selectedAnswer: string | null;
  result: QuizResult | null;
  isStarted: boolean;
  isCompleted: boolean;
  isUnlocked: boolean;
  isHydrated: boolean;
  totalQuestions: number;
  startQuiz: () => void;
  selectAnswer: (answerId: string) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  unlockResult: () => void;
  restartQuiz: () => void;
}

export function useQuizSession(test: Test): UseQuizSession {
  const [state, setState] = useState<QuizSessionState>(emptySession);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setState(loadSession(test.slug));
    setIsHydrated(true);
  }, [test.slug]);

  useEffect(() => {
    if (!isHydrated) return;
    saveSession(test.slug, state);
  }, [isHydrated, state, test.slug]);

  const totalQuestions = test.questions.length;
  const currentQuestion = test.questions[state.currentQuestionIndex];

  const selectedAnswer = useMemo(() => {
    if (!currentQuestion) return null;
    return state.answers[currentQuestion.id] ?? null;
  }, [currentQuestion, state.answers]);

  const baseEvent = useMemo(
    () => ({
      testId: test.id,
      testSlug: test.slug,
      creatorId: test.creator.id,
      totalQuestions,
    }),
    [test, totalQuestions],
  );

  const startQuiz = useCallback(() => {
    trackEvent("test_started", baseEvent);
    setState((prev) => ({ ...prev, isStarted: true }));
  }, [baseEvent]);

  const selectAnswer = useCallback(
    (answerId: string) => {
      const question = test.questions[state.currentQuestionIndex];
      if (!question) return;
      trackEvent("question_answered", {
        ...baseEvent,
        questionId: question.id,
        answerId,
        currentQuestion: state.currentQuestionIndex + 1,
      });
      setState((prev) => ({
        ...prev,
        isStarted: true,
        answers: { ...prev.answers, [question.id]: answerId },
      }));
    },
    [baseEvent, state.currentQuestionIndex, test.questions],
  );

  const goToNextQuestion = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentQuestionIndex + 1;
      if (nextIndex < totalQuestions) {
        return { ...prev, currentQuestionIndex: nextIndex };
      }
      const result = calculateResult(test, prev.answers);
      trackEvent("test_completed", {
        ...baseEvent,
        resultId: result.winnerKey,
      });
      return { ...prev, isCompleted: true, result };
    });
  }, [baseEvent, test, totalQuestions]);

  const goToPreviousQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1),
    }));
  }, []);

  const unlockResult = useCallback(() => {
    trackEvent("unlock_clicked", { ...baseEvent, resultId: state.result?.winnerKey });
    setState((prev) => ({ ...prev, isUnlocked: true }));
    trackEvent("result_unlocked", { ...baseEvent, resultId: state.result?.winnerKey });
  }, [baseEvent, state.result]);

  const restartQuiz = useCallback(() => {
    trackEvent("quiz_restarted", baseEvent);
    clearSession(test.slug);
    setState(emptySession);
  }, [baseEvent, test.slug]);

  return {
    currentQuestionIndex: state.currentQuestionIndex,
    answers: state.answers,
    selectedAnswer,
    result: state.result,
    isStarted: state.isStarted,
    isCompleted: state.isCompleted,
    isUnlocked: state.isUnlocked,
    isHydrated,
    totalQuestions,
    startQuiz,
    selectAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    unlockResult,
    restartQuiz,
  };
}
