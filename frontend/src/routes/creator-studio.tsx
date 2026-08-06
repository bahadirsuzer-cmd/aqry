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
    example: "Ne kadar fanatiksin?",
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


type InspirationVisualType =
  | "love"
  | "fan"
  | "mind"
  | "story"
  | "spot"
  | "movie"
  | "code";

function InspirationCardVisual({
  type,
  featured = false,
}: {
  type: InspirationVisualType;
  featured?: boolean;
}) {
  const frameClass = featured
    ? "h-[220px] w-full rounded-[28px]"
    : "h-[150px] w-full rounded-[22px]";

  if (type === "love") {
    return (
      <div
        className={`${frameClass} relative overflow-hidden border border-rose-200 bg-gradient-to-br from-rose-100 via-fuchsia-50 to-pink-100`}
      >
        <div className="absolute -left-10 top-5 h-32 w-32 rounded-full bg-rose-200/60 blur-2xl" />
        <div className="absolute right-2 top-2 h-28 w-28 rounded-full bg-fuchsia-200/60 blur-2xl" />
        <div className="absolute left-6 top-6 rounded-full border border-white/80 bg-white/85 px-3 py-1 text-[12px] font-black uppercase tracking-[0.1em] text-rose-600">
          Uyum testi
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-6">
          <div>
            <p className="text-[14px] font-bold text-rose-600">
              İki kişi · tek sonuç
            </p>
            <p className="mt-1 text-[30px] font-black leading-none tracking-[-0.05em] text-rose-950">
              Aşk Metre
            </p>
          </div>

          <svg
            viewBox="0 0 180 140"
            className="h-[120px] w-[160px] shrink-0"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="55" cy="62" r="33" fill="#fecdd3" />
            <circle cx="125" cy="62" r="33" fill="#e9d5ff" />
            <circle cx="55" cy="51" r="13" fill="#fb7185" />
            <path d="M30 105C35 82 44 74 55 74C66 74 75 82 80 105" fill="#f43f5e" />
            <circle cx="125" cy="51" r="13" fill="#a855f7" />
            <path d="M100 105C105 82 114 74 125 74C136 74 145 82 150 105" fill="#9333ea" />
            <path
              d="M90 118C70 104 58 92 58 74C58 63 66 55 77 55C84 55 89 58 90 64C91 58 96 55 103 55C114 55 122 63 122 74C122 92 110 104 90 118Z"
              fill="#e11d48"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (type === "fan") {
    return (
      <div className={`${frameClass} relative overflow-hidden border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50`}>
        <svg viewBox="0 0 320 160" className="h-full w-full" fill="none" aria-hidden="true">
          <rect x="0" y="0" width="320" height="160" rx="22" fill="url(#fan-bg)" />
          <defs>
            <linearGradient id="fan-bg" x1="0" y1="0" x2="320" y2="160" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fffbeb" />
              <stop offset="1" stopColor="#fff7ed" />
            </linearGradient>
          </defs>
          <path d="M128 30H192V50C192 72 174 90 152 90H168C146 90 128 72 128 50V30Z" fill="#f59e0b" />
          <path d="M142 90H178L172 114H148L142 90Z" fill="#d97706" />
          <rect x="151" y="112" width="18" height="18" rx="5" fill="#92400e" />
          <rect x="137" y="128" width="46" height="8" rx="4" fill="#78350f" />
          <path d="M118 42H128V54C128 67 118 77 105 77H95V58C95 49 102 42 111 42H118Z" fill="#fbbf24" />
          <path d="M192 42H202C211 42 218 49 218 58V77H208C195 77 192 67 192 54V42Z" fill="#fbbf24" />
          <circle cx="248" cy="45" r="18" fill="#fde68a" />
          <path d="M248 34V56M237 45H259" stroke="#d97706" strokeWidth="5" strokeLinecap="round" />
          <rect x="34" y="118" width="252" height="10" rx="5" fill="#fde68a" />
          <rect x="34" y="118" width="196" height="10" rx="5" fill="#f59e0b" />
        </svg>
      </div>
    );
  }

  if (type === "mind") {
    return (
      <div className={`${frameClass} relative overflow-hidden border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50`}>
        <svg viewBox="0 0 320 160" className="h-full w-full" fill="none" aria-hidden="true">
          <circle cx="160" cy="79" r="49" fill="#ede9fe" />
          <path d="M135 96V60C135 43 146 32 160 32C174 32 185 43 185 60V96H175V121H145V96H135Z" fill="#7c3aed" />
          <circle cx="149" cy="63" r="6" fill="#c4b5fd" />
          <circle cx="173" cy="56" r="6" fill="#c4b5fd" />
          <circle cx="171" cy="80" r="6" fill="#f0abfc" />
          <circle cx="151" cy="86" r="6" fill="#f0abfc" />
          <path d="M149 63L173 56L171 80L151 86L149 63Z" stroke="#f5d0fe" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="70" cy="42" r="12" fill="#ddd6fe" />
          <circle cx="250" cy="112" r="16" fill="#f5d0fe" />
        </svg>
      </div>
    );
  }

  if (type === "story") {
    return (
      <div className={`${frameClass} relative overflow-hidden border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50`}>
        <svg viewBox="0 0 320 160" className="h-full w-full" fill="none" aria-hidden="true">
          <rect x="58" y="35" width="90" height="88" rx="18" fill="#dbeafe" stroke="#93c5fd" strokeWidth="3" transform="rotate(-7 58 35)" />
          <rect x="116" y="25" width="90" height="98" rx="18" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="3" transform="rotate(5 116 25)" />
          <rect x="172" y="40" width="90" height="84" rx="18" fill="white" stroke="#bae6fd" strokeWidth="3" />
          <rect x="189" y="58" width="56" height="8" rx="4" fill="#7dd3fc" />
          <rect x="189" y="75" width="44" height="7" rx="3.5" fill="#c7d2fe" />
          <rect x="189" y="91" width="51" height="7" rx="3.5" fill="#c7d2fe" />
          <circle cx="95" cy="77" r="18" fill="#38bdf8" />
          <path d="M89 68L105 77L89 86V68Z" fill="white" />
        </svg>
      </div>
    );
  }

  if (type === "spot") {
    return (
      <div className={`${frameClass} relative overflow-hidden border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50`}>
        <svg viewBox="0 0 320 160" className="h-full w-full" fill="none" aria-hidden="true">
          <rect x="44" y="30" width="170" height="100" rx="20" fill="white" stroke="#a7f3d0" strokeWidth="3" />
          <circle cx="82" cy="62" r="16" fill="#6ee7b7" />
          <rect x="118" y="48" width="64" height="28" rx="10" fill="#d1fae5" />
          <path d="M69 111L101 83L130 103L153 81L194 118H69V111Z" fill="#99f6e4" />
          <circle cx="221" cy="92" r="29" stroke="#059669" strokeWidth="8" />
          <path d="M242 113L272 143" stroke="#059669" strokeWidth="8" strokeLinecap="round" />
          <circle cx="184" cy="54" r="8" fill="#fb7185" />
        </svg>
      </div>
    );
  }

  if (type === "movie") {
    return (
      <div className={`${frameClass} relative overflow-hidden border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-pink-50`}>
        <svg viewBox="0 0 320 160" className="h-full w-full" fill="none" aria-hidden="true">
          <rect x="55" y="37" width="210" height="92" rx="20" fill="white" stroke="#f0abfc" strokeWidth="3" />
          <path d="M55 58H265" stroke="#f5d0fe" strokeWidth="18" />
          <path d="M72 40L90 58M112 40L130 58M152 40L170 58M192 40L210 58M232 40L250 58" stroke="#c026d3" strokeWidth="7" strokeLinecap="round" />
          <circle cx="160" cy="94" r="27" fill="#d946ef" />
          <path d="M151 80L174 94L151 108V80Z" fill="white" />
          <circle cx="241" cy="106" r="14" fill="#fce7f3" />
          <path d="M236 106L240 110L247 102" stroke="#db2777" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${frameClass} relative overflow-hidden border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-blue-50`}>
      <svg viewBox="0 0 320 160" className="h-full w-full" fill="none" aria-hidden="true">
        <rect x="48" y="29" width="108" height="108" rx="22" fill="white" stroke="#a5f3fc" strokeWidth="3" />
        {[0,1,2,3,4,5,6,7,8].map((i) => {
          const x = 66 + (i % 3) * 28;
          const y = 47 + Math.floor(i / 3) * 28;
          return <rect key={i} x={x} y={y} width="16" height="16" rx="4" fill={i % 2 === 0 ? "#67e8f9" : "#cffafe"} />;
        })}
        <rect x="191" y="66" width="66" height="56" rx="14" fill="#0891b2" />
        <path d="M205 66V52C205 41 213 33 224 33C235 33 243 41 243 52V66" stroke="#0891b2" strokeWidth="8" strokeLinecap="round" />
        <circle cx="224" cy="91" r="8" fill="white" />
      </svg>
    </div>
  );
}

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

  const [
    creationMode,
    setCreationMode,
  ] = useState<"ai" | "text">("ai");

  const [
    manualExpanded,
    setManualExpanded,
  ] = useState(false);

  const dailyFreeContentLimit = 3;
  const generatedToday = aiCredits
    ? Math.min(
        dailyFreeContentLimit,
        Math.floor(aiCredits.used / 3),
      )
    : 0;
  const remainingToday = Math.max(
    0,
    dailyFreeContentLimit - generatedToday,
  );

  function scrollToAiCreate(
    mode: "ai" | "text",
  ) {
    setCreationMode(mode);

    window.setTimeout(() => {
      document
        .getElementById("ai-create")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 0);
  }

  function openManualCreate() {
    setManualExpanded(true);

    window.setTimeout(() => {
      document
        .getElementById("manual-create")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 0);
  }

  function startSpectrumBuilder() {
    window.sessionStorage.removeItem(
      "aqry-test-builder",
    );
    window.sessionStorage.removeItem(
      "aqry-generated-blueprint",
    );
    window.sessionStorage.setItem(
      "aqry-test-builder",
      JSON.stringify({
        testMode: "spectrum",
        sourceExperienceId: null,
      }),
    );
    window.location.href = "/test-builder";
  }

  function startArchetypeBuilder() {
    window.sessionStorage.removeItem(
      "aqry-test-builder",
    );
    window.sessionStorage.removeItem(
      "aqry-generated-blueprint",
    );
    window.sessionStorage.setItem(
      "aqry-test-builder",
      JSON.stringify({
        testMode: "archetype",
        sourceExperienceId: null,
      }),
    );
    window.location.href = "/test-builder";
  }

  function startGuessBuilder() {
    window.sessionStorage.removeItem(
      "aqry-guess-builder",
    );
    window.location.href = "/guess-builder";
  }

  function startStoryBuilder() {
    window.sessionStorage.removeItem(
      "aqry-story-builder",
    );
    window.location.href = "/story-builder";
  }

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
          `${response.blueprint.type} Blueprint’i başarıyla üretildi. Bu içerik tipi için Builder henüz bağlanmadı.`,
        );
      }
    } catch (error) {
      console.error(error);

      setAiError(
        error instanceof Error
          ? error.message
          : "Yapay Zeka isteği tamamlanamadı.",
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

      if (!cancelled) {
        setLoading(false);
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
      }
    }

    void protectRoute();

    return () => {
      cancelled = true;
    };
  }, []);

  const manualCards = [
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
      tone: "emerald" as const,
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
      tone: "pink" as const,
      action: startSpectrumBuilder,
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
      tone: "violet" as const,
      action: startArchetypeBuilder,
      available: true,
    },
    {
      key: "reference",
      title: "Bana ne kadar yakınsın?",
      eyebrow: "Creator referansı",
      description:
        "Kendi cevaplarını referans al. Katılımcının sana ne kadar yaklaştığını ölç.",
      examples: [
        "Benimle ne kadar uyumlusun?",
        "Zevklerimiz ne kadar benziyor?",
        "Beni ne kadar iyi tanıyorsun?",
      ],
      tone: "blue" as const,
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
      tone: "orange" as const,
      action: startGuessBuilder,
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
      tone: "teal" as const,
      action: startStoryBuilder,
      available: true,
    },
  ];

  const inspirationExamples = [
    {
      label: "ÖZEL",
      title: "Aşk Metre",
      description:
        "İki kişinin cevaplarını karşılaştır. Uyum oranını göster, paylaşılabilir ve merak uyandıran bir sonuç üret.",
      action: () =>
        startFreshBuilder("compatibility"),
      featured: true,
      visual: "love" as InspirationVisualType,
    },
    {
      label: "SEVİYE",
      title: "Ne kadar fanatiksin?",
      description:
        "Tutku, davranış ve bağlılık sorularıyla takipçinin fanatiklik seviyesini göster.",
      action: startSpectrumBuilder,
      visual: "fan" as InspirationVisualType,
    },
    {
      label: "KİŞİLİK",
      title:
        "İnsanlar seni neden yanlış anlıyor?",
      description:
        "Cevaplardan merak uyandıran kişilik sonuçları üret.",
      action: startArchetypeBuilder,
      visual: "mind" as InspirationVisualType,
    },
    {
      label: "HİKÂYE",
      title:
        "Bu hikâyenin sonunu tahmin edebilir misin?",
      description:
        "Merak duygusuyla kullanıcıyı sonuna kadar taşı.",
      action: startStoryBuilder,
      visual: "story" as InspirationVisualType,
    },
    {
      label: "BULMACA",
      title: "Fotoğraftaki hatayı bul",
      description:
        "Hızlı çözülen, paylaşılabilir görsel içerikler üret.",
      action: startGuessBuilder,
      visual: "spot" as InspirationVisualType,
    },
    {
      label: "ÖNERİ",
      title: "Hangi film tam sana göre?",
      description:
        "Cevaplara göre kişisel bir sonuç veya öneri göster.",
      action: startArchetypeBuilder,
      visual: "movie" as InspirationVisualType,
    },
    {
      label: "ŞİFRE",
      title: "Şifreyi çöz",
      description:
        "Kod, ipucu ve mantık adımlarıyla çözülen bulmacalar üret.",
      action: startGuessBuilder,
      visual: "code" as InspirationVisualType,
    },
  ];

  return (
    <main className="min-h-screen bg-[#fbfbfd] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();

          window.location.href =
            "/creator-auth";
        }}
      />

      <div className="mx-auto max-w-[1380px] px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        {loading ? (
          <section className="rounded-[24px] border border-border bg-white p-10 text-center">
            <p className="text-[15px] font-bold text-muted-foreground">
              Studio hazırlanıyor...
            </p>
          </section>
        ) : (
          <>
            <section className="rounded-[24px] border border-primary/15 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 p-5 shadow-[0_12px_35px_rgba(22,12,34,0.04)] sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-primary text-[20px] text-white">
                    ✦
                  </span>

                  <div>
                    <p className="text-[16px] font-black text-foreground">
                      Her gün 3 Yapay Zeka üretimi ücretsiz
                    </p>
                    <p className="mt-1 text-[13px] font-medium leading-5 text-muted-foreground">
                      Günde 3 içeriğini Yapay Zeka ile ücretsiz oluştur. Manuel üretim her zaman sınırsızdır.
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-full border border-primary/15 bg-white px-4 py-2 text-[12px] font-black text-primary">
                    Daha fazla Yapay Zeka üret
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      scrollToAiCreate("ai")
                    }
                    className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-[13px] font-black text-white transition hover:bg-primary"
                  >
                    Planları gör →
                  </button>
                </div>
              </div>
            </section>

            <section className="relative mt-5 overflow-hidden rounded-[30px] border border-border bg-white p-7 shadow-[0_18px_55px_rgba(22,12,34,0.05)] sm:p-9 lg:p-10">
              <div className="absolute right-[-90px] top-[-100px] h-64 w-64 rounded-full bg-violet-100 blur-3xl" />
              <div className="absolute bottom-[-120px] left-[45%] h-64 w-64 rounded-full bg-pink-100 blur-3xl" />

              <div className="relative z-10">
                <p className="text-[12px] font-black uppercase tracking-[0.16em] text-primary">
                  Creator Studio
                </p>

                <h1 className="mt-3 max-w-[920px] text-[38px] font-black leading-[0.98] tracking-[-0.055em] sm:text-[50px] lg:text-[56px]">
                  İçeriğini üret. Paylaş. Para kazanmaya başla.
                </h1>

                <p className="mt-5 max-w-[800px] text-[16px] font-medium leading-7 text-muted-foreground">
                  Yapay Zeka ile saniyeler içinde oluştur, hazır metnini içeriğe dönüştür veya manuel olarak sınırsız üret.
                </p>

                {isFirstExperience ? (
                  <p className="mt-3 text-[13px] font-bold text-primary">
                    İlk içeriğini birkaç dakika içinde yayına alabilirsin.
                  </p>
                ) : null}

                <div className="mt-8 grid gap-4 lg:grid-cols-3">
                  <button
                    type="button"
                    onClick={() =>
                      scrollToAiCreate("ai")
                    }
                    className="group rounded-[24px] bg-black p-6 text-left text-white transition hover:-translate-y-0.5 hover:bg-primary"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-white/12 text-[22px]">
                        ✦
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-black text-white/90">
                        Bugün {remainingToday} ücretsiz üretim kaldı
                      </span>
                    </div>

                    <h2 className="mt-6 text-[24px] font-black tracking-[-0.04em]">
                      Yapay Zeka ile oluştur
                    </h2>
                    <p className="mt-2 text-[14px] font-medium leading-6 text-white/75">
                      Fikrini yaz. Soruları, yapıyı ve sonucu AQRYO hazırlasın.
                    </p>
                    <span className="mt-6 inline-flex text-[13px] font-black">
                      Yapay Zeka ile başla →
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      scrollToAiCreate("text")
                    }
                    className="group rounded-[24px] border border-border bg-gradient-to-br from-violet-50 via-white to-white p-6 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_40px_rgba(22,12,34,0.06)]"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-primary/[0.08] text-[22px] text-primary">
                      ▤
                    </span>

                    <h2 className="mt-6 text-[24px] font-black tracking-[-0.04em]">
                      Metinden oluştur
                    </h2>
                    <p className="mt-2 text-[14px] font-medium leading-6 text-muted-foreground">
                      Hazır metnini yapıştır. AQRYO bunu etkileşimli bir içeriğe dönüştürsün.
                    </p>
                    <span className="mt-6 inline-flex text-[13px] font-black text-primary">
                      Metin yapıştır →
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={openManualCreate}
                    className="group relative overflow-hidden rounded-[24px] border border-border bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_40px_rgba(22,12,34,0.06)]"
                  >
                    <span className="absolute -right-10 top-5 rotate-45 bg-red-600 px-12 py-2 text-[11px] font-black tracking-[0.12em] text-white shadow-sm">
                      SINIRSIZ
                    </span>

                    <div className="flex items-start justify-between gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-black/[0.05] text-[22px]">
                        ✎
                      </span>
                    </div>

                    <h2 className="mt-6 text-[24px] font-black tracking-[-0.04em]">
                      Kendin oluştur
                    </h2>
                    <p className="mt-2 text-[14px] font-medium leading-6 text-muted-foreground">
                      İçeriğini adım adım kendin hazırla. Manuel üretimde sınır yok.
                    </p>
                    <span className="mt-6 inline-flex text-[13px] font-black text-foreground">
                      Manuel oluştur →
                    </span>
                  </button>
                </div>
              </div>
            </section>

            <section
              id="ai-create"
              className="mt-8 scroll-mt-36 overflow-hidden rounded-[28px] border border-primary/15 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-white"
            >
              <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="p-6 sm:p-8">
                  <p className="text-[12px] font-black uppercase tracking-[0.13em] text-primary">
                    {creationMode === "ai"
                      ? "Yapay Zeka ile oluştur"
                      : "Metinden oluştur"}
                  </p>

                  <h3 className="mt-2 text-[28px] font-black tracking-[-0.04em] sm:text-[32px]">
                    {creationMode === "ai"
                      ? "Fikrini yaz. Gerisini AQRYO hazırlasın."
                      : "Hazır metnini yapıştır. AQRYO içeriğe dönüştürsün."}
                  </h3>

                  <p className="mt-2 max-w-[760px] text-[14px] font-medium leading-6 text-muted-foreground">
                    {creationMode === "ai"
                      ? "Tek cümleyle başlayabilirsin. Konuyu, tonu veya hedeflediğin etkileşimi söylemen yeterli."
                      : "Notunu, taslağını, hikâyeni veya hazır içeriğini yapıştır. Yapıyı AQRYO oluştursun."}
                  </p>

                  <div className="mt-5 rounded-[20px] border border-white bg-white/90 p-4 shadow-sm">
                    <textarea
                      rows={5}
                      value={aiInput}
                      maxLength={5000}
                      onChange={(event) =>
                        setAiInput(
                          event.target.value,
                        )
                      }
                      placeholder={
                        creationMode === "ai"
                          ? "Örn. İnsanların ilk izlenimde beni neden yanlış anladığını gösteren eğlenceli bir kişilik testi oluştur..."
                          : "Hazır metnini buraya yapıştır..."
                      }
                      className="w-full resize-none bg-transparent px-2 py-2 text-[15px] font-semibold leading-7 outline-none placeholder:font-medium placeholder:text-muted-foreground/70"
                    />

                    <div className="mt-3 flex flex-col gap-4 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[13px] font-bold text-foreground/80">
                          Bugün {remainingToday} ücretsiz Yapay Zeka üretimin kaldı.
                        </p>
                        <p className="mt-1 text-[12px] font-medium text-muted-foreground">
                          Her gün 3 Yapay Zeka üretimi ücretsizdir. Manuel içerik üretimi sınırsızdır.
                        </p>
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
                        className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-[14px] font-black text-white transition enabled:hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {aiLoading
                          ? "AQRYO hazırlıyor..."
                          : creationMode === "ai"
                            ? "Yapay Zeka ile oluştur ✦"
                            : "İçeriğe dönüştür →"}
                      </button>
                    </div>
                  </div>

                  {aiError ? (
                    <div className="mt-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3">
                      <p className="text-[13px] font-black leading-5 text-red-700">
                        {aiError}
                      </p>
                    </div>
                  ) : null}

                  {aiResult ? (
                    <div className="mt-4 rounded-[16px] border border-primary/15 bg-white px-4 py-3">
                      <p className="text-[13px] font-semibold leading-5">
                        {aiResult}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center border-t border-primary/10 p-7 lg:border-l lg:border-t-0">
                  <div>
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-primary text-[20px] text-white">
                      ✦
                    </span>

                    <p className="mt-4 text-[18px] font-black">
                      Üretmeye başlamak için bir fikir yeter.
                    </p>

                    <p className="mt-2 text-[13px] font-medium leading-6 text-muted-foreground">
                      AQRYO yapıyı seçer, içeriği hazırlar ve seni düzenleme ekranına götürür.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.15em] text-primary">
                    İlham al
                  </p>
                  <h2 className="mt-2 text-[32px] font-black tracking-[-0.05em]">
                    Ne üretebilirsin?
                  </h2>
                  <p className="mt-2 max-w-[720px] text-[14px] font-medium leading-6 text-muted-foreground">
                    Bir fikrin yoksa örneklerden başla. Aynısını oluşturabilir veya kendi fikrine göre değiştirebilirsin.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inspirationExamples.map(
                  (example) => (
                    <button
                      key={example.title}
                      type="button"
                      onClick={example.action}
                      className={`group rounded-[24px] border p-5 text-left shadow-[0_10px_30px_rgba(22,12,34,0.035)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(22,12,34,0.06)] ${
                        example.featured
                          ? "relative overflow-hidden border-rose-200 bg-gradient-to-r from-rose-50 via-fuchsia-50 to-violet-50 sm:col-span-2 lg:col-span-3"
                          : "border-border bg-white hover:border-primary/25"
                      }`}
                    >
                      {example.featured ? (
                        <span className="absolute -right-9 top-5 z-20 rotate-45 bg-red-600 px-12 py-2 text-[11px] font-black tracking-[0.12em] text-white shadow-sm">
                          ÖZEL
                        </span>
                      ) : null}

                      <div
                        className={
                          example.featured
                            ? "grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
                            : ""
                        }
                      >
                        <div>
                          <p
                            className={`text-[12px] font-black uppercase tracking-[0.12em] ${
                              example.featured
                                ? "text-rose-600"
                                : "text-primary"
                            }`}
                          >
                            {example.label}
                          </p>

                          <h3
                            className={`mt-3 font-black leading-tight tracking-[-0.035em] ${
                              example.featured
                                ? "text-[30px] text-rose-950 sm:text-[36px]"
                                : "text-[20px]"
                            }`}
                          >
                            {example.title}
                          </h3>

                          <p className="mt-2 text-[13px] font-medium leading-6 text-muted-foreground">
                            {example.description}
                          </p>

                          <span
                            className={`mt-5 inline-flex text-[13px] font-black ${
                              example.featured
                                ? "text-rose-600"
                                : "text-primary"
                            }`}
                          >
                            Bunun gibi oluştur →
                          </span>
                        </div>

                        <div className={example.featured ? "min-w-0" : "mt-5"}>
                          <InspirationCardVisual
                            type={example.visual}
                            featured={Boolean(example.featured)}
                          />
                        </div>
                      </div>
                    </button>
                  ),
                )}
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
      <p className="mt-1 text-[12px] font-bold leading-5 text-white/75">
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
          <p className="whitespace-normal text-[12px] font-black uppercase tracking-[0.1em] text-foreground/55">
            {eyebrow}
            {!available ? " · Yakında" : ""}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-black ${toneMap.badge}`}
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
            className="rounded-full border border-border bg-white px-3 py-2 text-[12px] font-semibold text-foreground/75"
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