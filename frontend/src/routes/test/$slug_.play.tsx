import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getTestBySlug } from "@/data/testData";
import { OfferCard } from "@/components/OfferCard";
import { PageShell } from "@/components/PageShell";
import type {
  AnswerRecord,
  QuizResult,
  ResultProfile,
  ScoreMap,
  Test,
} from "@/types";

export const Route = createFileRoute("/test/$slug_/play")({
  component: TestPlayPage,
});

function calculateResult(test: Test, answers: AnswerRecord): QuizResult {
  const scores: ScoreMap = {};

  for (const question of test.questions) {
    const selectedAnswerId = answers[question.id];

    if (!selectedAnswerId) {
      continue;
    }

    const selectedAnswer = question.answers.find(
      (answer) => answer.id === selectedAnswerId,
    );

    if (!selectedAnswer) {
      continue;
    }

    for (const [profileKey, score] of Object.entries(selectedAnswer.scores)) {
      scores[profileKey] = (scores[profileKey] ?? 0) + score;
    }
  }

  const profileKeys = test.resultProfiles.map((profile) => profile.key);

  for (const profileKey of profileKeys) {
    scores[profileKey] = scores[profileKey] ?? 0;
  }

  const winnerKey =
    profileKeys.reduce((winner, currentKey) => {
      const winnerScore = scores[winner] ?? 0;
      const currentScore = scores[currentKey] ?? 0;

      return currentScore > winnerScore ? currentKey : winner;
    }, profileKeys[0] ?? "") || "";

  const totalScore = Object.values(scores).reduce(
    (total, score) => total + Math.max(score, 0),
    0,
  );

  const percentages: ScoreMap = {};

  for (const profileKey of profileKeys) {
    const score = Math.max(scores[profileKey] ?? 0, 0);

    percentages[profileKey] =
      totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
  }

  return {
    winnerKey,
    scores,
    percentages,
  };
}

function getWinningProfile(
  test: Test,
  result: QuizResult,
): ResultProfile | undefined {
  return test.resultProfiles.find(
    (profile) => profile.key === result.winnerKey,
  );
}

function TestPlayPage() {
  const { slug } = Route.useParams();
  const foundTest = getTestBySlug(slug);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  if (!foundTest) {
    return (
      <PageShell>
        <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            Experience bulunamadı
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">
            Bu test mevcut değil
          </h1>

          <Link to="/" className="btn-primary mt-6">
            Ana sayfaya dön
          </Link>
        </main>
      </PageShell>
    );
  }

  const test = foundTest;

  if (test.questions.length === 0) {
    return (
      <PageShell>
        <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Bu testte henüz soru yok
          </h1>

          <Link
            to="/test/$slug"
            params={{ slug: test.slug }}
            className="btn-primary mt-6"
          >
            Teste geri dön
          </Link>
        </main>
      </PageShell>
    );
  }

  if (test.resultProfiles.length === 0) {
    return (
      <PageShell>
        <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Bu testin sonuç profilleri henüz hazır değil
          </h1>

          <Link
            to="/test/$slug"
            params={{ slug: test.slug }}
            className="btn-primary mt-6"
          >
            Teste geri dön
          </Link>
        </main>
      </PageShell>
    );
  }

  if (result) {
    const winningProfile = getWinningProfile(test, result);

    if (!winningProfile) {
      return (
        <PageShell>
          <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Sonuç oluşturulamadı
            </h1>

            <button
              type="button"
              onClick={() => {
                setAnswers({});
                setCurrentQuestionIndex(0);
                setResult(null);
              }}
              className="btn-primary mt-6"
            >
              Testi yeniden çöz
            </button>
          </main>
        </PageShell>
      );
    }

    const winnerPercentage = result.percentages[winningProfile.key] ?? 0;

    return (
      <PageShell>
        <main className="mx-auto w-full max-w-2xl">
          <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            <div
              className="relative flex min-h-64 items-end overflow-hidden bg-gradient-brand p-6 sm:p-8"
              style={
                winningProfile.color
                  ? { background: winningProfile.color }
                  : undefined
              }
            >
              {winningProfile.image ? (
                <>
                  <img
                    src={winningProfile.image}
                    alt={winningProfile.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </>
              ) : null}

              <div className="relative z-10 text-primary-foreground">
                <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-80">
                  Ücretsiz sonucun
                </p>

                <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                  {winningProfile.name}
                </h1>
              </div>
            </div>

            <div className="space-y-7 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-5 rounded-2xl bg-gradient-brand-soft p-5">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    En güçlü eşleşmen
                  </p>

                  <p className="mt-1 text-xl font-black text-foreground">
                    %{winnerPercentage}
                  </p>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary bg-background text-lg font-black text-primary">
                  %{winnerPercentage}
                </div>
              </div>

              <section>
                <h2 className="text-xl font-black tracking-tight text-foreground">
                  {winningProfile.shortDescription}
                </h2>

                <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
                  {winningProfile.fullDescription}
                </p>
              </section>

              {winningProfile.strengths.length > 0 ? (
                <section>
                  <h2 className="text-lg font-black tracking-tight text-foreground">
                    Güçlü yönlerin
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {winningProfile.strengths.map((strength) => (
                      <span
                        key={strength}
                        className="rounded-full bg-gradient-brand-soft px-3 py-2 text-sm font-semibold text-foreground"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              {winningProfile.weaknesses.length > 0 ? (
                <section>
                  <h2 className="text-lg font-black tracking-tight text-foreground">
                    Dikkat etmen gerekenler
                  </h2>

                  <div className="mt-3 space-y-2">
                    {winningProfile.weaknesses.map((weakness) => (
                      <div
                        key={weakness}
                        className="rounded-2xl border border-border bg-background p-4 text-sm font-medium leading-relaxed text-muted-foreground"
                      >
                        {weakness}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {winningProfile.roleDescription ? (
                <section className="rounded-2xl border border-border bg-background p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    Rolün
                  </p>

                  <p className="mt-2 leading-relaxed text-foreground">
                    {winningProfile.roleDescription}
                  </p>
                </section>
              ) : null}

              {winningProfile.relationshipStyle ? (
                <section className="rounded-2xl border border-border bg-background p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    İlişki tarzın
                  </p>

                  <p className="mt-2 leading-relaxed text-foreground">
                    {winningProfile.relationshipStyle}
                  </p>
                </section>
              ) : null}

              <div className="rounded-2xl border border-primary/20 bg-gradient-brand-soft p-5">
                <p className="font-black text-foreground">
                  Sonucun tamamen ücretsiz
                </p>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Bu sonuç experience’ın tamamlanmış değeridir. Sonraki teklifler
                  yalnızca ek değer sunar.
                </p>
              </div>

              <OfferCard price={19} currency="TL" />

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setAnswers({});
                    setCurrentQuestionIndex(0);
                    setResult(null);
                  }}
                  className="rounded-2xl border border-border bg-background px-5 py-3 font-semibold text-foreground transition hover:border-primary"
                >
                  Yeniden çöz
                </button>

                <Link to="/" className="btn-primary">
                  Ana sayfaya dön
                </Link>
              </div>
            </div>
          </article>
        </main>
      </PageShell>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const selectedAnswerId = answers[currentQuestion.id];
  const questionNumber = currentQuestionIndex + 1;
  const progress = (questionNumber / test.questions.length) * 100;
  const isLastQuestion =
    currentQuestionIndex === test.questions.length - 1;

  function handleAnswerSelect(answerId: string) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: answerId,
    }));
  }

  function handleNextQuestion() {
    if (!selectedAnswerId) {
      return;
    }

    if (isLastQuestion) {
      const calculatedResult = calculateResult(test, answers);
      setResult(calculatedResult);
      return;
    }

    setCurrentQuestionIndex((index) => index + 1);
  }

  function handlePreviousQuestion() {
    if (currentQuestionIndex === 0) {
      return;
    }

    setCurrentQuestionIndex((index) => index - 1);
  }

  return (
    <PageShell>
      <main className="mx-auto w-full max-w-2xl">
        <header className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-4">
            <Link
              to="/test/$slug"
              params={{ slug: test.slug }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Testten çık
            </Link>

            <span className="text-sm font-semibold text-muted-foreground">
              {questionNumber} / {test.questions.length}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <article className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <div className="mb-7">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Soru {questionNumber}
            </p>

            <h1 className="text-2xl font-black leading-tight tracking-tight text-foreground sm:text-3xl">
              {currentQuestion.text}
            </h1>
          </div>

          {currentQuestion.image ? (
            <img
              src={currentQuestion.image}
              alt=""
              className="mb-7 aspect-video w-full rounded-2xl object-cover"
            />
          ) : null}

          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => {
              const isSelected = selectedAnswerId === answer.id;

              return (
                <button
                  key={answer.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleAnswerSelect(answer.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left text-[15px] font-semibold leading-relaxed transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isSelected
                      ? "border-primary bg-gradient-brand-soft text-foreground"
                      : "border-border bg-background text-foreground hover:border-primary"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {isSelected ? (
                      <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                    ) : null}
                  </span>

                  <span>{answer.text}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center gap-3">
            {currentQuestionIndex > 0 ? (
              <button
                type="button"
                onClick={handlePreviousQuestion}
                className="rounded-2xl border border-border bg-background px-5 py-3 font-semibold text-foreground transition hover:border-primary"
              >
                Geri
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={!selectedAnswerId}
              className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLastQuestion ? "Sonucumu Gör" : "Devam Et"}
            </button>
          </div>
        </article>
      </main>
    </PageShell>
  );
}