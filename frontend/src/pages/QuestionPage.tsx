import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Test } from "@/types";
import { AqryLogo } from "@/components/AqryLogo";
import { ProgressBar } from "@/components/ProgressBar";
import { AnswerOption } from "@/components/AnswerOption";
import { useQuizSession } from "@/hooks/useQuizSession";
import { AnalyzingPage } from "./AnalyzingPage";

interface QuestionPageProps {
  test: Test;
}

export function QuestionPage({ test }: QuestionPageProps) {
  const navigate = useNavigate();
  const session = useQuizSession(test);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  // Already finished earlier (e.g. re-entering the quiz URL) → go to result.
  useEffect(() => {
    if (session.isHydrated && session.isCompleted && !analyzing) {
      navigate({ to: "/test/$slug/result", params: { slug: test.slug }, replace: true });
    }
  }, [analyzing, navigate, session.isCompleted, session.isHydrated, test.slug]);

  const question = test.questions[session.currentQuestionIndex];

  if (!session.isHydrated || !question) {
    return <div className="min-h-screen bg-background" />;
  }

  if (analyzing) {
    return <AnalyzingPage />;
  }

  const isLast = session.currentQuestionIndex === test.questions.length - 1;

  const handleSelect = (answerId: string) => {
    if (isAdvancing) return;
    session.selectAnswer(answerId);
    setIsAdvancing(true);

    const advance = window.setTimeout(() => {
      setIsAdvancing(false);
      if (isLast) {
        setAnalyzing(true);
        session.goToNextQuestion();
        const done = window.setTimeout(() => {
          navigate({ to: "/test/$slug/result", params: { slug: test.slug }, replace: true });
        }, 1500);
        timers.current.push(done);
      } else {
        session.goToNextQuestion();
      }
    }, 350);
    timers.current.push(advance);
  };

  const handlePrevious = () => {
    if (session.currentQuestionIndex === 0) {
      navigate({ to: "/test/$slug", params: { slug: test.slug } });
      return;
    }
    session.goToPreviousQuestion();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[520px] px-5 py-5">
        <div className="mb-6 flex items-center justify-between">
          <AqryLogo />
        </div>

        <ProgressBar current={session.currentQuestionIndex + 1} total={test.questions.length} />

        <div key={question.id} className="animate-rise mt-7 space-y-6">
          <h1 className="text-xl font-bold leading-snug tracking-tight text-foreground">
            {question.text}
          </h1>

          <div className="space-y-3">
            {question.answers.map((answer, index) => (
              <AnswerOption
                key={answer.id}
                answer={answer}
                index={index}
                selected={session.selectedAnswer === answer.id}
                disabled={isAdvancing}
                onSelect={handleSelect}
              />
            ))}
          </div>

          <button type="button" onClick={handlePrevious} className="btn-ghost">
            Önceki soru
          </button>
        </div>
      </div>
    </div>
  );
}
