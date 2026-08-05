import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Test } from "@/types";
import { PageShell } from "@/components/PageShell";
import { CreatorRow } from "@/components/CreatorRow";
import { useQuizSession } from "@/hooks/useQuizSession";
import { trackEvent } from "@/utils/analytics";

interface TestLandingPageProps {
  test: Test;
}

export function TestLandingPage({ test }: TestLandingPageProps) {
  const navigate = useNavigate();
  const session = useQuizSession(test);

  useEffect(() => {
    trackEvent("test_viewed", {
      testId: test.id,
      testSlug: test.slug,
      creatorId: test.creator.id,
      totalQuestions: test.questions.length,
    });
  }, [test]);

  const hasProgress = session.isHydrated && session.isStarted && !session.isCompleted;

  const handleStart = () => {
    session.startQuiz();
    navigate({ to: "/test/$slug/quiz", params: { slug: test.slug } });
  };

  return (
    <PageShell narrow>
      <div className="animate-rise space-y-7 text-center">
        <div className="h-44 w-full rounded-3xl bg-gradient-brand shadow-card" />

        <div className="space-y-3">
          <h1 className="text-[26px] font-black leading-tight tracking-tight text-foreground">
            {test.title}
          </h1>
          <p className="text-base font-medium text-primary">{test.subtitle}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{test.description}</p>
        </div>

        <div className="flex justify-center">
          <CreatorRow
            creator={test.creator}
            participants={test.totalParticipants}
            duration={test.estimatedDuration}
          />
        </div>

        <div className="space-y-3">
          <button type="button" onClick={handleStart} className="btn-primary">
            {hasProgress ? "Teste devam et" : "Teste başla"}
          </button>
          {hasProgress ? (
            <button
              type="button"
              onClick={session.restartQuiz}
              className="btn-ghost"
            >
              Baştan başla
            </button>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {test.questions.length} soru · {test.estimatedDuration}
          </p>
        </div>
      </div>
    </PageShell>
  );
}
