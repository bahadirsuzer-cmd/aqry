import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Test } from "@/types";
import { useQuizSession } from "@/hooks/useQuizSession";
import { getProfileByKey } from "@/data/testData";
import { ResultPreviewPage } from "./ResultPreviewPage";
import { FullResultPage } from "./FullResultPage";

interface ResultRouteProps {
  test: Test;
}

export function ResultRoute({ test }: ResultRouteProps) {
  const navigate = useNavigate();
  const session = useQuizSession(test);

  const incomplete = session.isHydrated && (!session.isCompleted || !session.result);

  useEffect(() => {
    if (incomplete) {
      navigate({ to: "/test/$slug", params: { slug: test.slug }, replace: true });
    }
  }, [incomplete, navigate, test.slug]);

  if (!session.isHydrated || !session.result || !session.isCompleted) {
    return <div className="min-h-screen bg-background" />;
  }

  const profile = getProfileByKey(test, session.result.winnerKey);
  if (!profile) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!session.isUnlocked) {
    return (
      <ResultPreviewPage
        test={test}
        profile={profile}
        result={session.result}
        onUnlock={session.unlockResult}
      />
    );
  }

  return (
    <FullResultPage
      test={test}
      profile={profile}
      result={session.result}
      onRestart={session.restartQuiz}
    />
  );
}
