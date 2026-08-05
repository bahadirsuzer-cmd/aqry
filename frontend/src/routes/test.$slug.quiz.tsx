import { useState } from "react";
import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { AqryLogo } from "@/components/AqryLogo";
import { getTestBySlug } from "@/data/testData";

export const Route = createFileRoute("/test/$slug/quiz")({
  component: QuizPage,
});

interface QuizOption {
  id: string;
  label: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

const questions: QuizQuestion[] = [
  {
    id: 1,
    question: "Arkadaş grubunda genellikle hangi rolü üstlenirsin?",
    options: [
      {
        id: "a",
        label: "Her şeyi planlayan ve kontrol altında tutan kişi benim.",
      },
      {
        id: "b",
        label: "Ortamın enerjisini yükselten ve dikkat çeken kişi benim.",
      },
      {
        id: "c",
        label: "Herkesi dinleyen ve sorunları çözmeye çalışan kişi benim.",
      },
      {
        id: "d",
        label: "Olayları izler, gerektiğinde sürprizimi yaparım.",
      },
    ],
  },
  {
    id: 2,
    question: "Beklenmedik bir sorun çıktığında ilk tepkin ne olur?",
    options: [
      {
        id: "a",
        label: "Hemen bir çözüm planı hazırlamaya başlarım.",
      },
      {
        id: "b",
        label: "Olayı eğlenceli hâle getirmeye çalışırım.",
      },
      {
        id: "c",
        label: "Önce çevremdeki insanların nasıl hissettiğine bakarım.",
      },
      {
        id: "d",
        label: "Bir süre bekler, en doğru hamleyi sonra yaparım.",
      },
    ],
  },
  {
    id: 3,
    question: "Seni en iyi tanımlayan özellik hangisi?",
    options: [
      {
        id: "a",
        label: "Mükemmeliyetçi",
      },
      {
        id: "b",
        label: "Özgüvenli",
      },
      {
        id: "c",
        label: "Fedakâr",
      },
      {
        id: "d",
        label: "Gizemli",
      },
    ],
  },
];

function QuizPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();

  const test = getTestBySlug(slug);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionNumber = currentQuestionIndex + 1;
  const totalQuestions = questions.length;

  const progressPercentage =
    (currentQuestionNumber / totalQuestions) * 100;

  const isLastQuestion =
    currentQuestionIndex === totalQuestions - 1;

  function handleSelectOption(optionId: string) {
    setSelectedOptionId(optionId);
  }

  function handleContinue() {
    if (!selectedOptionId) {
      return;
    }

    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: selectedOptionId,
    };

    setAnswers(updatedAnswers);

    if (isLastQuestion) {
      sessionStorage.setItem(
        `aqry-quiz-${slug}`,
        JSON.stringify(updatedAnswers),
      );

      navigate({
        to: "/test/$slug/result",
        params: { slug },
      });

      return;
    }

    const nextQuestionIndex = currentQuestionIndex + 1;
    const nextQuestion = questions[nextQuestionIndex];

    setCurrentQuestionIndex(nextQuestionIndex);
    setSelectedOptionId(updatedAnswers[nextQuestion.id] ?? null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <span className="absolute -right-24 top-24 select-none text-[180px] font-black tracking-[-0.08em] text-primary/[0.018] sm:text-[260px]">
          AQRY.
        </span>

        <span className="absolute -left-20 bottom-0 select-none text-[160px] font-black tracking-[-0.08em] text-primary/[0.018] sm:text-[220px]">
          AQRY.
        </span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1120px] px-5 pb-10 sm:px-8">
        <header className="flex h-[60px] items-center gap-3 sm:h-[68px]">
          <AqryLogo />

          <span className="hidden border-l border-primary/20 pl-3 text-[10px] font-bold uppercase tracking-[0.18em] text-primary md:block">
            Desperate Housewives Quiz
          </span>
        </header>

        <main className="pb-6 pt-1 sm:pb-8 sm:pt-1">
          <div className="grid items-start gap-6 lg:-mt-8 lg:grid-cols-[minmax(0,760px)_280px]">
            <div className="min-w-0">
              <section className="mb-4 sm:mb-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Soru {currentQuestionNumber} / {totalQuestions}
                  </p>

                  <p className="text-xs font-semibold text-muted-foreground">
                    {totalQuestions - currentQuestionNumber} soru kaldı
                  </p>
                </div>

                <div className="mt-4 h-[5px] overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-400 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </section>

              <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(38,16,65,0.085)] sm:p-8">
                <h1 className="max-w-[620px] text-[27px] font-black leading-[1.06] tracking-[-0.05em] text-foreground sm:text-[34px]">
                  {currentQuestion.question}
                </h1>

                <div className="mt-6 grid gap-3 sm:mt-7">
                  {currentQuestion.options.map((option) => {
                    const isSelected =
                      selectedOptionId === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectOption(option.id)}
                        aria-pressed={isSelected}
                        className={`group flex min-h-[64px] w-full items-center gap-4 rounded-[20px] border px-4 py-3.5 text-left transition duration-200 sm:px-5 ${
                          isSelected
                            ? "border-primary bg-primary/[0.055] shadow-[0_8px_24px_rgba(124,58,237,0.10)]"
                            : "border-border bg-background hover:-translate-y-[1px] hover:border-primary/40 hover:bg-muted/30 hover:shadow-md"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-black transition duration-200 ${
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                          }`}
                        >
                          {option.id.toUpperCase()}
                        </span>

                        <span className="text-sm font-semibold leading-6 text-foreground sm:text-[15px]">
                          {option.label}
                        </span>

                        <span
                          aria-hidden="true"
                          className={`ml-auto flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs transition duration-200 ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="mt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!selectedOptionId}
                  className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-black px-8 text-sm font-bold text-white transition duration-200 enabled:hover:-translate-y-0.5 enabled:hover:bg-black/85 enabled:hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-25 sm:w-auto"
                >
                  {isLastQuestion
                    ? "Sonucumu Gör"
                    : "Devam Et"}

                  <span aria-hidden="true">→</span>
                </button>
              </div>

              <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
                Sonucun ücretsizdir. Cevapların yalnızca bu Experience için
                kullanılır.
              </p>
            </div>

            {test ? (
              <aside className="hidden overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_18px_50px_rgba(38,16,65,0.07)] lg:block">
                <div className="px-6 pb-6 pt-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Experience Creator
                  </p>

                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-bold text-white shadow-sm ring-4 ring-primary/5">
                      {test.creator.avatar ? (
                        <img
                          src={test.creator.avatar}
                          alt={test.creator.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>
                          {test.creator.name
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="truncate text-lg font-black tracking-[-0.035em] text-foreground">
                          {test.creator.name}
                        </h2>

                        <span
                          aria-label="Doğrulanmış creator"
                          className="text-xs text-fuchsia-500"
                        >
                          ✿
                        </span>
                      </div>

                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        @{test.creator.username.replace(/^@/, "")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border px-6 py-5">
                  <div className="rounded-[20px] bg-muted/50 px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Bu Experience
                    </p>

                    <p className="mt-2 text-sm font-bold leading-5 text-foreground">
                      {test.title}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-muted/40 p-3 text-center">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        Süre
                      </p>

                      <p className="mt-1 text-sm font-bold text-foreground">
                        2 dk
                      </p>
                    </div>

                    <div className="rounded-2xl bg-muted/40 p-3 text-center">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        Soru
                      </p>

                      <p className="mt-1 text-sm font-bold text-foreground">
                        10
                      </p>
                    </div>

                    <div className="rounded-2xl bg-muted/40 p-3 text-center">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        Sonuç
                      </p>

                      <p className="mt-1 text-sm font-bold text-foreground">
                        Ücretsiz
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <a
                    href={`/${test.creator.username.replace(/^@/, "")}`}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-bold text-foreground transition duration-200 hover:border-primary/30 hover:bg-primary/[0.035]"
                  >
                    Profili Gör

                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </aside>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}