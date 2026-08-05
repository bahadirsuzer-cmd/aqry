import type {
  BlueprintResultProfile,
  ExperienceBlueprint,
  TestResultStrategy,
} from "@/types/experienceBlueprint";

export type TestAnswerMap =
  Record<string, string>;

export type TestResultBreakdownItem = {
  key: string;
  label: string;
  rawScore: number;
  percentage: number;
};

export type TestEngineResult = {
  strategy: TestResultStrategy;
  score: number;
  result: BlueprintResultProfile | null;
  breakdown: TestResultBreakdownItem[];
};

function clamp01(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(1, value),
  );
}

function findSelectedOption(
  blueprint: ExperienceBlueprint,
  questionId: string,
  optionId: string,
) {
  const question =
    blueprint.questions.find(
      (item) =>
        item.id === questionId,
    );

  return question?.options.find(
    (option) =>
      option.id === optionId,
  );
}

function findResultByScore(
  score: number,
  profiles: BlueprintResultProfile[],
) {
  const matching =
    profiles.find((profile) => {
      const min =
        profile.minScore ?? 0;

      const max =
        profile.maxScore ?? 100;

      return (
        score >= min &&
        score <= max
      );
    });

  return (
    matching ??
    profiles[
      profiles.length - 1
    ] ??
    null
  );
}

function calculateScoreStrategy(
  blueprint: ExperienceBlueprint,
  answers: TestAnswerMap,
): TestEngineResult {
  let answered = 0;
  let correct = 0;

  for (const question of
    blueprint.questions) {
    const optionId =
      answers[question.id];

    if (!optionId) {
      continue;
    }

    const option =
      findSelectedOption(
        blueprint,
        question.id,
        optionId,
      );

    if (!option) {
      continue;
    }

    answered += 1;

    const correctSignal =
      option.signals.find(
        (signal) =>
          signal.key ===
          "correct",
      );

    if (
      correctSignal &&
      correctSignal.weight > 0
    ) {
      correct += 1;
    }
  }

  const score =
    answered > 0
      ? Math.round(
          (correct / answered) *
            100,
        )
      : 0;

  return {
    strategy: "score",
    score,
    result: findResultByScore(
      score,
      blueprint.resultModel
        .profiles,
    ),
    breakdown: [
      {
        key: "correct",
        label: "Doğru",
        rawScore: correct,
        percentage:
          answered > 0
            ? Math.round(
                (correct /
                  answered) *
                  100,
              )
            : 0,
      },
    ],
  };
}

function calculateSpectrumStrategy(
  blueprint: ExperienceBlueprint,
  answers: TestAnswerMap,
): TestEngineResult {
  const spectrumKey =
    blueprint.test?.spectrumKey;

  if (!spectrumKey) {
    throw new Error(
      "Spectrum testi için spectrumKey bulunamadı.",
    );
  }

  let total = 0;
  let answered = 0;

  for (const question of
    blueprint.questions) {
    const optionId =
      answers[question.id];

    if (!optionId) {
      continue;
    }

    const option =
      findSelectedOption(
        blueprint,
        question.id,
        optionId,
      );

    if (!option) {
      continue;
    }

    const signal =
      option.signals.find(
        (item) =>
          item.key ===
          spectrumKey,
      );

    if (!signal) {
      continue;
    }

    answered += 1;
    total += clamp01(
      signal.weight,
    );
  }

  const normalized =
    answered > 0
      ? total / answered
      : 0;

  const score = Math.round(
    normalized * 100,
  );

  return {
    strategy: "spectrum",
    score,
    result: findResultByScore(
      score,
      blueprint.resultModel
        .profiles,
    ),
    breakdown: [
      {
        key: spectrumKey,
        label: spectrumKey,
        rawScore: total,
        percentage: score,
      },
    ],
  };
}

function calculateArchetypeStrategy(
  blueprint: ExperienceBlueprint,
  answers: TestAnswerMap,
): TestEngineResult {
  const totals: Record<
    string,
    number
  > = {};

  for (const question of
    blueprint.questions) {
    const optionId =
      answers[question.id];

    if (!optionId) {
      continue;
    }

    const option =
      findSelectedOption(
        blueprint,
        question.id,
        optionId,
      );

    if (!option) {
      continue;
    }

    for (const signal of
      option.signals) {
      const weight =
        clamp01(signal.weight);

      if (weight <= 0) {
        continue;
      }

      totals[signal.key] =
        (totals[signal.key] ??
          0) + weight;
    }
  }

  const configuredKeys =
    blueprint.test
      ?.archetypeSignalKeys ??
    {};

  const candidates =
    blueprint.resultModel.profiles.map(
      (profile) => {
        const signalKey =
          configuredKeys[
            profile.id
          ] ??
          profile.id;

        return {
          profile,
          signalKey,
          rawScore:
            totals[signalKey] ?? 0,
        };
      },
    );

  const totalCandidateScore =
    candidates.reduce(
      (sum, item) =>
        sum + item.rawScore,
      0,
    );

  const sorted = [
    ...candidates,
  ].sort(
    (first, second) =>
      second.rawScore -
      first.rawScore,
  );

  const winner =
    sorted[0] ?? null;

  const score =
    winner &&
    totalCandidateScore > 0
      ? Math.round(
          (winner.rawScore /
            totalCandidateScore) *
            100,
        )
      : 0;

  const breakdown =
    sorted.map((item) => ({
      key: item.signalKey,
      label:
        item.profile.title,
      rawScore:
        item.rawScore,
      percentage:
        totalCandidateScore > 0
          ? Math.round(
              (item.rawScore /
                totalCandidateScore) *
                100,
            )
          : 0,
    }));

  return {
    strategy: "archetype",
    score,
    result:
      winner?.profile ?? null,
    breakdown,
  };
}

export function calculateTestResult(
  blueprint: ExperienceBlueprint,
  answers: TestAnswerMap,
): TestEngineResult {
  if (blueprint.type !== "test") {
    throw new Error(
      "Bu Blueprint bir Test değil.",
    );
  }

  const strategy =
    blueprint.test?.strategy ??
    (blueprint.resultModel.mode ===
    "score"
      ? "score"
      : blueprint.resultModel
            .mode ===
          "spectrum"
        ? "spectrum"
        : "archetype");

  if (strategy === "score") {
    return calculateScoreStrategy(
      blueprint,
      answers,
    );
  }

  if (
    strategy === "spectrum"
  ) {
    return calculateSpectrumStrategy(
      blueprint,
      answers,
    );
  }

  return calculateArchetypeStrategy(
    blueprint,
    answers,
  );
}