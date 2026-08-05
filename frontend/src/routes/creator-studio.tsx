import { CreatorNavigation } from "@/components/CreatorNavigation";
import { runAiAction } from "@/services/ai";
import { supabase } from "@/services/supabase";
import type { ExperienceBlueprint } from "@/types/experienceBlueprint";
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  getCurrentCreator,
  signOutCreator,
} from "@/services/auth";

type StudioTemplate = {
  key: string;
  title: string;
  example: string;
  description: string;
  icon: string;
  accent: string;
  href: string | null;
  available: boolean;
};

const STANDARD_OFFER_PRICE = 9;

const templates: StudioTemplate[] = [
  {
    key: "compatibility",
    title: "Uyumluluk",
    example: "Benimle ne kadar uyumlusun?",
    description:
      "Creator ve katılımcının cevaplarını karşılaştıran bir Experience oluştur.",
    icon: "♥",
    accent:
      "from-fuchsia-500 via-pink-500 to-rose-500",
    href: "/compatibility-builder",
    available: true,
  },
  {
    key: "tests",
    title: "Testler",
    example: "Ne kadar Fenerbahçelisin?",
    description:
      "Sorular sor, puanla ve kullanıcıya tamamlanmış bir sonuç göster.",
    icon: "✦",
    accent:
      "from-violet-600 via-purple-600 to-fuchsia-500",
    href: "/test-builder",
    available: true,
  },
  {
    key: "puzzle",
    title: "Puzzle",
    example: "Bunu 30 saniyede çözebilir misin?",
    description:
      "Mantık, görsel veya dikkat bulmacalarıyla hızlı ve paylaşılabilir Experience'lar oluştur.",
    icon: "◈",
    accent:
      "from-rose-500 via-orange-500 to-amber-400",
    href: null,
    available: false,
  },
  {
    key: "recommendations",
    title: "Öneriler",
    example: "Sana hangi film uygun?",
    description:
      "Cevaplara göre kişiselleştirilmiş bir öneri veya seçim üret.",
    icon: "◆",
    accent:
      "from-cyan-500 via-blue-500 to-indigo-600",
    href: null,
    available: false,
  },
  {
    key: "decision",
    title: "Görüş & Karar",
    example: "Sen olsan ne yapardın?",
    description:
      "Kullanıcıyı birkaç karar adımından geçir ve sonunda görüş haritası çıkar.",
    icon: "↗",
    accent:
      "from-amber-400 via-orange-500 to-rose-500",
    href: null,
    available: false,
  },
  {
    key: "stories",
    title: "Hikâyeler",
    example: "Bu hikâyede sen ne yapardın?",
    description:
      "Seçimlerle ilerleyen, sonucu olan etkileşimli bir hikâye oluştur.",
    icon: "◫",
    accent:
      "from-slate-800 via-zinc-800 to-black",
    href: null,
    available: false,
  },
  {
    key: "content",
    title: "İçerik",
    example: "Bunu biliyor muydun?",
    description:
      "Kaydırmalı, merak uyandıran ve etkileşimli içerikler hazırla.",
    icon: "◎",
    accent:
      "from-emerald-500 via-teal-500 to-cyan-500",
    href: null,
    available: false,
  },
  {
    key: "guided",
    title: "Yönlendirmeli",
    example: "Senin için en doğru yol hangisi?",
    description:
      "Kullanıcıyı adım adım ilerlet ve kişisel bir sonuca ulaştır.",
    icon: "→",
    accent:
      "from-indigo-500 via-violet-500 to-purple-600",
    href: null,
    available: false,
  },
];

export const Route = createFileRoute(
  "/creator-studio",
)({
  component: CreatorStudioPage,
});


function mapBlueprintQuestions(
  blueprint: ExperienceBlueprint,
) {
  return blueprint.questions.map(
    (question, index) => ({
      id: index + 1,
      text: question.text,
      options: question.options.map(
        (option) => option.text,
      ),
    }),
  );
}

function mapBlueprintResults(
  blueprint: ExperienceBlueprint,
) {
  return blueprint.resultModel.profiles.map(
    (profile, index) => {
      const min =
        profile.minScore ?? 0;

      const max =
        profile.maxScore ?? 100;

      return {
        id:
          profile.id ||
          `result-${index + 1}`,
        range: `%${min}–${max}`,
        title: profile.title,
        description:
          profile.description,
      };
    },
  );
}

function saveCompatibilityBlueprint(
  blueprint: ExperienceBlueprint,
) {
  const questions =
    mapBlueprintQuestions(
      blueprint,
    );

  const creatorAnswers: Record<
    number,
    number
  > = {};

  for (
    let index = 0;
    index <
    blueprint.questions.length;
    index += 1
  ) {
    const sourceQuestion =
      blueprint.questions[index];

    const creatorOptionId =
      blueprint.compatibility
        ?.creatorAnswers[
        sourceQuestion.id
      ];

    if (!creatorOptionId) {
      continue;
    }

    const optionIndex =
      sourceQuestion.options.findIndex(
        (option) =>
          option.id ===
          creatorOptionId,
      );

    if (optionIndex >= 0) {
      creatorAnswers[index + 1] =
        optionIndex;
    }
  }

  window.sessionStorage.setItem(
    "aqry-compatibility-builder",
    JSON.stringify({
      title: blueprint.title,
      description:
        blueprint.description,
      questions,
      creatorAnswers,
      answersLocked: false,
      coverStyle: "purple",
      coverImageUrl: "",
      coverLabel: "Uyumluluk",
      results:
        mapBlueprintResults(
          blueprint,
        ),
      offerEnabled:
        blueprint.offer?.enabled ??
        false,
      offerTitle:
        blueprint.offer?.title ??
        "Detaylı uyum haritanı gör",
      offerDescription:
        blueprint.offer
          ?.description ??
        "Hangi konularda uyuştuğunuzu ve hangi alanlarda farklılaştığınızı gör.",
      offerPrice: STANDARD_OFFER_PRICE,
      sourceExperienceId: null,
    }),
  );
}

function saveScoreTestBlueprint(
  blueprint: ExperienceBlueprint,
) {
  const questions =
    mapBlueprintQuestions(
      blueprint,
    );

  const correctAnswers: Record<
    number,
    number
  > = {};

  for (
    let index = 0;
    index <
    blueprint.questions.length;
    index += 1
  ) {
    const sourceQuestion =
      blueprint.questions[index];

    const correctIndex =
      sourceQuestion.options.findIndex(
        (option) =>
          option.signals.some(
            (signal) =>
              signal.key ===
                "correct" &&
              signal.weight > 0,
          ),
      );

    if (correctIndex >= 0) {
      correctAnswers[index + 1] =
        correctIndex;
    }
  }

  window.sessionStorage.setItem(
    "aqry-test-builder",
    JSON.stringify({
      title: blueprint.title,
      description:
        blueprint.description,
      questions,
      correctAnswers,
      answersLocked: false,
      coverStyle: "purple",
      coverImageUrl: "",
      coverLabel: "Test",
      results:
        mapBlueprintResults(
          blueprint,
        ),
      offerEnabled:
        blueprint.offer?.enabled ??
        false,
      offerTitle:
        blueprint.offer?.title ??
        "Detaylı performans raporunu gör",
      offerDescription:
        blueprint.offer
          ?.description ??
        "Sonucunun detaylarını gör.",
      offerPrice: STANDARD_OFFER_PRICE,
    }),
  );
}


function findBestProfileForOption(
  blueprint: ExperienceBlueprint,
  questionIndex: number,
  optionIndex: number,
) {
  const option =
    blueprint.questions[
      questionIndex
    ]?.options[
      optionIndex
    ];

  if (!option) {
    return "";
  }

  let bestProfileId = "";
  let bestScore =
    Number.NEGATIVE_INFINITY;

  for (const profile of
    blueprint.resultModel.profiles) {
    const rules =
      profile.signalRules ?? [];

    if (rules.length === 0) {
      continue;
    }

    let score = 0;
    let matchedRuleCount = 0;

    for (const rule of rules) {
      const signal =
        option.signals.find(
          (item) =>
            item.key ===
            rule.key,
        );

      if (!signal) {
        continue;
      }

      matchedRuleCount += 1;

      const normalizedWeight =
        Math.max(
          0,
          Math.min(
            1,
            signal.weight,
          ),
        );

      const signalValue =
        normalizedWeight * 100;

      if (
        rule.min !== undefined
      ) {
        score +=
          signalValue >= rule.min
            ? normalizedWeight * 100
            : -(
                rule.min -
                signalValue
              );
      } else {
        score +=
          normalizedWeight * 50;
      }

      if (
        rule.max !== undefined
      ) {
        score +=
          signalValue <= rule.max
            ? 25
            : -(
                signalValue -
                rule.max
              );
      }
    }

    if (matchedRuleCount === 0) {
      continue;
    }

    score /=
      matchedRuleCount;

    if (score > bestScore) {
      bestScore = score;
      bestProfileId =
        profile.id;
    }
  }

  if (bestProfileId) {
    return bestProfileId;
  }

  return (
    blueprint.resultModel
      .profiles[0]?.id ?? ""
  );
}

function saveProfileTestBlueprint(
  blueprint: ExperienceBlueprint,
) {
  const questions =
    mapBlueprintQuestions(
      blueprint,
    );

  const profileAssignments:
    Record<
      number,
      Record<number, string>
    > = {};

  for (
    let questionIndex = 0;
    questionIndex <
    blueprint.questions.length;
    questionIndex += 1
  ) {
    const mappedQuestionId =
      questionIndex + 1;

    profileAssignments[
      mappedQuestionId
    ] = {};

    const sourceQuestion =
      blueprint.questions[
        questionIndex
      ];

    for (
      let optionIndex = 0;
      optionIndex <
      sourceQuestion.options.length;
      optionIndex += 1
    ) {
      const profileId =
        findBestProfileForOption(
          blueprint,
          questionIndex,
          optionIndex,
        );

      if (profileId) {
        profileAssignments[
          mappedQuestionId
        ][optionIndex] =
          profileId;
      }
    }
  }

  window.sessionStorage.setItem(
    "aqry-test-builder",
    JSON.stringify({
      title: blueprint.title,
      description:
        blueprint.description,
      questions,
      correctAnswers: {},
      testMode: "profile",
      profileAssignments,
      answersLocked: false,
      coverStyle: "purple",
      coverImageUrl: "",
      coverLabel: "Test",
      results:
        mapBlueprintResults(
          blueprint,
        ),
      offerEnabled:
        blueprint.offer?.enabled ??
        false,
      offerTitle:
        blueprint.offer?.title ??
        "Detaylı sonucunu gör",
      offerDescription:
        blueprint.offer
          ?.description ??
        "Cevaplarının hangi özelliklere işaret ettiğini daha ayrıntılı gör.",
      offerPrice: STANDARD_OFFER_PRICE,
      generatedBlueprint:
        blueprint,
    }),
  );
}

function saveTestBlueprint(
  blueprint: ExperienceBlueprint,
) {
  const strategy =
    blueprint.test?.strategy ??
    (blueprint.resultModel.mode ===
    "score"
      ? "score"
      : blueprint.resultModel.mode ===
          "spectrum"
        ? "spectrum"
        : "archetype");

  const questions =
    mapBlueprintQuestions(
      blueprint,
    );

  const correctAnswers: Record<
    number,
    number
  > = {};

  if (strategy === "score") {
    blueprint.questions.forEach(
      (question, questionIndex) => {
        const correctIndex =
          question.options.findIndex(
            (option) =>
              option.signals.some(
                (signal) =>
                  signal.key ===
                    "correct" &&
                  signal.weight > 0,
              ),
          );

        if (correctIndex >= 0) {
          correctAnswers[
            questionIndex + 1
          ] = correctIndex;
        }
      },
    );
  }

  window.sessionStorage.setItem(
    "aqry-test-builder",
    JSON.stringify({
      title: blueprint.title,
      description:
        blueprint.description,
      questions,
      correctAnswers,
      testMode: strategy,
      answersLocked: false,
      coverStyle: "purple",
      coverImageUrl: "",
      coverLabel:
        strategy === "score"
          ? "Bilgi Testi"
          : strategy === "spectrum"
            ? "Seviye Testi"
            : "Karakter Testi",
      results:
        mapBlueprintResults(
          blueprint,
        ),
      offerEnabled:
        blueprint.offer?.enabled ??
        false,
      offerTitle:
        blueprint.offer?.title ??
        "Detaylı sonucunu gör",
      offerDescription:
        blueprint.offer
          ?.description ??
        "Sonucunun detaylarını gör.",
      offerPrice: STANDARD_OFFER_PRICE,
      sourceExperienceId: null,
      sourceBlueprint:
        blueprint,
    }),
  );
}

function openBlueprintInBuilder(
  blueprint: ExperienceBlueprint,
) {
  window.sessionStorage.setItem(
    "aqry-generated-blueprint",
    JSON.stringify(blueprint),
  );

  if (
    blueprint.type ===
    "compatibility"
  ) {
    saveCompatibilityBlueprint(
      blueprint,
    );

    window.location.href =
      "/compatibility-builder";

    return true;
  }

  if (blueprint.type === "test") {
    saveTestBlueprint(blueprint);

    window.location.href =
      "/test-builder";

    return true;
  }

  return false;
}

function startFreshBuilder(
  builder:
    | "compatibility"
    | "test",
) {
  if (
    builder === "compatibility"
  ) {
    window.sessionStorage.removeItem(
      "aqry-compatibility-builder",
    );

    window.sessionStorage.removeItem(
      "aqry-generated-blueprint",
    );

    window.location.href =
      "/compatibility-builder";

    return;
  }

  window.sessionStorage.removeItem(
    "aqry-test-builder",
  );

  window.sessionStorage.removeItem(
    "aqry-generated-blueprint",
  );

  window.location.href =
    "/test-builder";
}


type CoreResultCardConfig = {
  key: string;
  title: string;
  eyebrow: string;
  description: string;
  examples: string[];
  tone:
    | "emerald"
    | "pink"
    | "violet"
    | "blue"
    | "orange"
    | "teal";
  action: () => void;
  available: boolean;
};

function CreatorStudioPage() {
  const [loading, setLoading] =
    useState(true);

  const [
    isFirstExperience,
    setIsFirstExperience,
  ] = useState(false);

  const [aiInput, setAiInput] =
    useState("");

  const [aiLoading, setAiLoading] =
    useState(false);

  const [aiResult, setAiResult] =
    useState<string | null>(null);

  const [aiError, setAiError] =
    useState<string | null>(null);

  const [aiCredits, setAiCredits] =
    useState<{
      used: number;
      remaining: number;
    } | null>(null);

  async function handleAiGenerate() {
    const input = aiInput.trim();

    if (!input || aiLoading) {
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const response =
        await runAiAction(
          "generate_experience",
          input,
        );

      setAiCredits({
        used: response.credits.used,
        remaining:
          response.credits.remaining,
      });

      if (!response.blueprint) {
        throw new Error(
          "Product Brain geçerli Blueprint döndürmedi.",
        );
      }

      const opened =
        openBlueprintInBuilder(
          response.blueprint,
        );

      if (!opened) {
        setAiResult(
          `${response.blueprint.type} Blueprint’i başarıyla üretildi. Bu Experience Builder henüz bağlanmadı.`,
        );
      }
    } catch (error) {
      console.error(error);

      setAiError(
        error instanceof Error
          ? error.message
          : "AI isteği tamamlanamadı.",
      );
    } finally {
      setAiLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function protectRoute() {
      const creator =
        await getCurrentCreator();

      if (!creator) {
        window.location.href =
          "/creator-auth";

        return;
      }

      const {
        count,
        error: experienceCountError,
      } = await supabase
        .from("experiences")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq(
          "creator_id",
          creator.id,
        );

      if (experienceCountError) {
        console.error(
          "Creator Experience sayısı alınamadı:",
          experienceCountError,
        );
      }

      if (!cancelled) {
        setIsFirstExperience(
          !experienceCountError &&
            (count ?? 0) === 0,
        );
        setLoading(false);
      }
    }

    void protectRoute();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#fbfbfd] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();

          window.location.href =
            "/creator-auth";
        }}
      />

      <div className="mx-auto max-w-[1380px] px-4 pb-14 pt-5 sm:px-6 lg:px-8">
        {loading ? (
          <section className="rounded-[24px] border border-border bg-white p-10 text-center">
            <p className="text-sm font-bold text-muted-foreground">
              Studio hazırlanıyor...
            </p>
          </section>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-[30px] border border-border bg-white p-7 shadow-[0_18px_55px_rgba(22,12,34,0.05)] sm:p-9 lg:p-10">
              <div className="absolute right-[-90px] top-[-100px] h-64 w-64 rounded-full bg-violet-100 blur-3xl" />
              <div className="absolute bottom-[-120px] left-[45%] h-64 w-64 rounded-full bg-pink-100 blur-3xl" />

              <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                    Creator Studio
                  </p>

                  <h1 className="mt-4 max-w-[820px] text-[40px] font-black leading-[0.95] tracking-[-0.06em] sm:text-[52px] lg:text-[58px]">
                    Takipçilerin için bir Experience oluştur.
                  </h1>

                  <p className="mt-5 max-w-[760px] text-[14px] leading-6 text-muted-foreground">
                    Sonucu ücretsiz göster. İstersen sonucundan sonra ücretli bir teklif ekle.
                    Trafiğini dışarıdan getir, AQRYO’da etkileşime ve gelire dönüştür.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <button
                    type="button"
                    onClick={() => {
                      document
                        .getElementById("core-types")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }}
                    className="flex min-h-[72px] items-center justify-between rounded-[20px] bg-black px-5 text-left text-white transition hover:bg-primary"
                  >
                    <div>
                      <p className="text-[13px] font-black">
                        Kendin oluştur
                      </p>
                      <p className="mt-1 text-[9px] leading-4 text-white/60">
                        Sonuç mantığını seç ve içeriğini kur.
                      </p>
                    </div>
                    <span className="text-[18px]">→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      document
                        .getElementById("ai-create")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }}
                    className="flex min-h-[72px] items-center justify-between rounded-[20px] border border-primary/20 bg-primary/[0.05] px-5 text-left transition hover:border-primary/40 hover:bg-primary/[0.08]"
                  >
                    <div>
                      <p className="text-[13px] font-black text-primary">
                        AI ile oluştur
                      </p>
                      <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                        Fikrini yaz, yapıyı AQRYO hazırlasın.
                      </p>
                    </div>
                    <span className="text-[18px] text-primary">✦</span>
                  </button>
                </div>
              </div>
            </section>

            {isFirstExperience ? (
              <section className="mt-6 rounded-[24px] border border-primary/15 bg-primary/[0.045] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.13em] text-primary">
                    İlk Experience’ın
                  </p>

                  <h2 className="mt-2 text-[20px] font-black tracking-[-0.04em]">
                    3 adımda yayına çık.
                  </h2>

                  <p className="mt-2 max-w-[720px] text-[11px] leading-5 text-muted-foreground">
                    Sonuç biçimini seç → içeriğini oluştur → paylaş.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    document
                      .getElementById(
                        "core-types",
                      )
                      ?.scrollIntoView({
                        behavior:
                          "smooth",
                      });
                  }}
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-[9px] font-black text-white transition hover:bg-primary sm:mt-0 sm:shrink-0"
                >
                  İlk Experience’ımı oluştur →
                </button>
              </section>
            ) : null}

            <section
              id="core-types"
              className="mt-10"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">
                    Kendin oluştur
                  </p>

                  <h2 className="mt-1 text-[30px] font-black tracking-[-0.05em]">
                    Sonuç biçimini seç
                  </h2>
                </div>

                <p className="max-w-[560px] text-[12px] leading-5 text-muted-foreground sm:text-right">
                  Aynı konu farklı sonuç mantıklarıyla bambaşka Experience’lara dönüşebilir.
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {([
                  {
                    key: "tests-score",
                    title: "Doğru cevap / Skor",
                    eyebrow: "Bilgi · quiz · doğru/yanlış",
                    description:
                      "Doğru cevapları olan sorular oluştur. Kullanıcı cevapladıkça skoru oluşsun.",
                    examples: [
                      "10 soruda ne kadar tarih biliyorsun?",
                      "90’lar dizilerini tanıyor musun?",
                      "Bu logolar hangi markalara ait?",
                    ],
                    tone: "emerald",
                    action: () =>
                      startFreshBuilder("test"),
                    available: true,
                  },
                  {
                    key: "tests-spectrum",
                    title: "Ne kadar X’sin?",
                    eyebrow: "Seviye · yoğunluk · eğilim",
                    description:
                      "Her cevap aynı özelliği biraz artırır ya da azaltır. Sonunda bir seviye çıkar.",
                    examples: [
                      "Ne kadar kıskançsın?",
                      "Ne kadar ghostlayan birisin?",
                      "Ne kadar sabırlısın?",
                    ],
                    tone: "pink",
                    action: () => {
                      window.sessionStorage.removeItem("aqry-test-builder");
                      window.sessionStorage.removeItem("aqry-generated-blueprint");
                      window.sessionStorage.setItem(
                        "aqry-test-builder",
                        JSON.stringify({
                          testMode: "spectrum",
                          sourceExperienceId: null,
                        }),
                      );
                      window.location.href =
                        "/test-builder";
                    },
                    available: true,
                  },
                  {
                    key: "tests-archetype",
                    title: "Hangi X’sin?",
                    eyebrow: "Karakter · öneri · eşleşme",
                    description:
                      "Cevapların farklı sonuçlara ağırlık verir. Sana en çok uyan sonuç kazanır.",
                    examples: [
                      "Hangi Friends karakterisin?",
                      "Hangi şehir sana uygun?",
                      "Hangi film sana göre?",
                    ],
                    tone: "violet",
                    action: () => {
                      window.sessionStorage.removeItem("aqry-test-builder");
                      window.sessionStorage.removeItem("aqry-generated-blueprint");
                      window.sessionStorage.setItem(
                        "aqry-test-builder",
                        JSON.stringify({
                          testMode: "archetype",
                          sourceExperienceId: null,
                        }),
                      );
                      window.location.href =
                        "/test-builder";
                    },
                    available: true,
                  },
                  {
                    key: "reference",
                    title: "Bana ne kadar yakınsın?",
                    eyebrow: "Creator referansı",
                    description:
                      "Creator’ın kendi cevapları referans olur. Katılımcının ne kadar yaklaştığı ölçülür.",
                    examples: [
                      "Benimle ne kadar uyumlusun?",
                      "Zevklerimiz ne kadar benziyor?",
                      "Beni ne kadar iyi tanıyorsun?",
                    ],
                    tone: "blue",
                    action: () =>
                      startFreshBuilder("compatibility"),
                    available: true,
                  },
                  {
                    key: "guess",
                    title: "Tahmin et / Bu nedir?",
                    eyebrow: "Görsel · ipucu · serbest cevap",
                    description:
                      "Bir görsel veya ipucu yayınla. Katılımcı cevabını kendisi yazsın.",
                    examples: [
                      "Bu meyvenin adı ne?",
                      "Bu eşyanın adı ne olabilir?",
                      "Bu tatlının adı nedir?",
                    ],
                    tone: "orange",
                    action: () => {
                      window.sessionStorage.removeItem(
                        "aqry-guess-builder",
                      );
                      window.location.href =
                        "/guess-builder";
                    },
                    available: true,
                  },
                  {
                    key: "story",
                    title: "Story / İçerik",
                    eyebrow: "Metin · görsel · içerik akışı",
                    description:
                      "Metin, görsel veya kısa içerik akışı oluştur. Hesaplama motoru gerekmez.",
                    examples: [
                      "Başıma gelen inanılmaz olay...",
                      "5 maddede başarılı olmanın sırrı",
                      "Mini rehber: ilk buluşma ipuçları",
                    ],
                    tone: "teal",
                    action: () => {
                      window.sessionStorage.removeItem(
                        "aqry-story-builder",
                      );
                      window.location.href =
                        "/story-builder";
                    },
                    available: true,
                  },
                ] satisfies CoreResultCardConfig[]).map((card, index) => (
                  <CoreResultCard
                    {...card}
                    prominent={
                      index === 1 ||
                      index === 4
                    }
                  />
                ))}
              </div>
            </section>

            <section
              id="ai-create"
              className="mt-8 overflow-hidden rounded-[28px] border border-primary/15 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-white"
            >
              <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="p-6 sm:p-7">
                  <p className="text-[10px] font-black uppercase tracking-[0.13em] text-primary">
                    AI ile oluştur
                  </p>

                  <h3 className="mt-2 text-[24px] font-black tracking-[-0.04em]">
                    Fikrini yaz, yapıyı AQRYO seçsin.
                  </h3>

                  <div className="mt-4 rounded-[20px] border border-white bg-white/80 p-3 shadow-sm">
                    <textarea
                      rows={3}
                      value={aiInput}
                      maxLength={5000}
                      onChange={(event) =>
                        setAiInput(
                          event.target.value,
                        )
                      }
                      placeholder="Örn. ‘Koskoca Türkiye’de bunun adını bilen çıkmadı?’ gibi görselli bir içerik oluştur..."
                      className="w-full resize-none bg-transparent px-2 py-2 text-[13px] font-semibold leading-6 outline-none placeholder:font-medium placeholder:text-muted-foreground/60"
                    />

                    <div className="mt-2 flex flex-col gap-3 border-t border-border/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground">
                          Tam AI Experience üretimi · 3 kredi
                        </p>

                        {aiCredits ? (
                          <p className="mt-1 text-[10px] font-black text-primary">
                            Bugün kullanılan: {aiCredits.used}/12 · Kalan: {aiCredits.remaining}
                          </p>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        disabled={
                          aiLoading ||
                          aiInput.trim().length ===
                            0
                        }
                        onClick={() => {
                          void handleAiGenerate();
                        }}
                        className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-[10px] font-black text-white transition enabled:hover:bg-black disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        {aiLoading
                          ? "AQRYO düşünüyor..."
                          : "AI ile oluştur ✦"}
                      </button>
                    </div>
                  </div>

                  {aiError ? (
                    <div className="mt-3 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3">
                      <p className="text-[10px] font-black text-red-700">
                        {aiError}
                      </p>
                    </div>
                  ) : null}

                  {aiResult ? (
                    <div className="mt-3 rounded-[16px] border border-primary/15 bg-white px-4 py-3">
                      <p className="text-[10px] font-semibold leading-5">
                        {aiResult}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center border-t border-primary/10 p-7 lg:border-l lg:border-t-0">
                  <div>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-[15px] bg-primary text-[18px] text-white">
                      ✦
                    </span>

                    <p className="mt-4 text-[14px] font-black">
                      Bir cümle yeter.
                    </p>

                    <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
                      AQRYO yapıyı seçer, soruları ve sonucu hazırlar.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}


function MiniStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[16px] bg-white/12 p-3 backdrop-blur">
      <p className="text-[20px] font-black">
        {value}
      </p>
      <p className="mt-1 text-[8px] font-bold leading-4 text-white/70">
        {label}
      </p>
    </div>
  );
}

function CoreResultCard({
  title,
  eyebrow,
  description,
  examples,
  tone,
  action,
  available,
  prominent,
}: {
  title: string;
  eyebrow: string;
  description: string;
  examples: string[];
  tone:
    | "emerald"
    | "pink"
    | "violet"
    | "blue"
    | "orange"
    | "teal";
  action: () => void;
  available: boolean;
  prominent?: boolean;
}) {
  const toneMap = {
    emerald: {
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
      hover: "hover:border-emerald-200",
      wash: "from-emerald-50/70",
    },
    pink: {
      text: "text-pink-700",
      dot: "bg-pink-500",
      badge: "bg-pink-50 text-pink-700 border-pink-100",
      hover: "hover:border-pink-200",
      wash: "from-pink-50/70",
    },
    violet: {
      text: "text-violet-700",
      dot: "bg-violet-500",
      badge: "bg-violet-50 text-violet-700 border-violet-100",
      hover: "hover:border-violet-200",
      wash: "from-violet-50/70",
    },
    blue: {
      text: "text-blue-700",
      dot: "bg-blue-500",
      badge: "bg-blue-50 text-blue-700 border-blue-100",
      hover: "hover:border-blue-200",
      wash: "from-blue-50/70",
    },
    orange: {
      text: "text-orange-700",
      dot: "bg-orange-500",
      badge: "bg-orange-50 text-orange-700 border-orange-100",
      hover: "hover:border-orange-200",
      wash: "from-orange-50/70",
    },
    teal: {
      text: "text-teal-700",
      dot: "bg-teal-500",
      badge: "bg-teal-50 text-teal-700 border-teal-100",
      hover: "hover:border-teal-200",
      wash: "from-teal-50/70",
    },
  }[tone];

  return (
    <button
      type="button"
      disabled={!available}
      onClick={action}
      className={`group relative overflow-hidden rounded-[24px] border border-border bg-gradient-to-br ${toneMap.wash} via-white to-white p-5 text-left shadow-[0_12px_35px_rgba(22,12,34,0.035)] transition md:aspect-square ${
        available
          ? `${toneMap.hover} hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(22,12,34,0.07)]`
          : "cursor-not-allowed opacity-55"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${toneMap.dot}`}
          />
          <p className="truncate text-[11px] font-black uppercase tracking-[0.1em] text-foreground/55">
            {eyebrow}
            {!available ? " · Yakında" : ""}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-black ${toneMap.badge}`}
        >
          {title}
        </span>
      </div>

      <p className="mt-5 max-w-[620px] text-[15px] font-semibold leading-6 text-foreground/80">
        {description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {examples.map((example) => (
          <span
            key={example}
            className="rounded-full border border-border bg-white px-3 py-2 text-[11px] font-semibold text-foreground/75"
          >
            {example}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-end">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-[14px] font-black ${toneMap.text}`}
        >
          {available ? "→" : "…"}
        </span>
      </div>
    </button>
  );
}