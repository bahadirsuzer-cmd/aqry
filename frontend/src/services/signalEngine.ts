import type {
  ExperienceBlueprint,
} from "@/types/experienceBlueprint";

export type ParticipantAnswers =
  Record<string, string>;

export type SignalProfile =
  Record<string, number>;

export type ProfileScore = {
  profileId: string;
  score: number;
};

function normalizeSignalProfile(
  rawSignals: SignalProfile,
) {
  const values =
    Object.values(rawSignals);

  if (values.length === 0) {
    return {};
  }

  const maxValue =
    Math.max(...values);

  if (maxValue <= 0) {
    return rawSignals;
  }

  const normalized:
    SignalProfile = {};

  for (const [
    key,
    value,
  ] of Object.entries(
    rawSignals,
  )) {
    normalized[key] =
      Math.round(
        (value / maxValue) *
          100,
      );
  }

  return normalized;
}

export function buildSignalProfile(
  blueprint:
    ExperienceBlueprint,
  answers:
    ParticipantAnswers,
): SignalProfile {
  const rawSignals:
    SignalProfile = {};

  for (const question of
    blueprint.questions) {
    const selectedOptionId =
      answers[question.id];

    if (!selectedOptionId) {
      continue;
    }

    const selectedOption =
      question.options.find(
        (option) =>
          option.id ===
          selectedOptionId,
      );

    if (!selectedOption) {
      continue;
    }

    for (const signal of
      selectedOption.signals) {
      rawSignals[
        signal.key
      ] =
        (rawSignals[
          signal.key
        ] ?? 0) +
        signal.weight;
    }
  }

  return normalizeSignalProfile(
    rawSignals,
  );
}

export function calculateSimilarity(
  firstProfile:
    SignalProfile,
  secondProfile:
    SignalProfile,
) {
  const allKeys =
    Array.from(
      new Set([
        ...Object.keys(
          firstProfile,
        ),
        ...Object.keys(
          secondProfile,
        ),
      ]),
    );

  if (
    allKeys.length === 0
  ) {
    return 0;
  }

  let totalDifference = 0;

  for (const key of
    allKeys) {
    const firstValue =
      firstProfile[key] ?? 0;

    const secondValue =
      secondProfile[key] ?? 0;

    totalDifference +=
      Math.abs(
        firstValue -
          secondValue,
      );
  }

  const averageDifference =
    totalDifference /
    allKeys.length;

  const similarity =
    100 -
    averageDifference;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        similarity,
      ),
    ),
  );
}

export function scoreResultProfiles(
  blueprint:
    ExperienceBlueprint,
  signalProfile:
    SignalProfile,
): ProfileScore[] {
  return blueprint
    .resultModel
    .profiles
    .map((profile) => {
      const rules =
        profile.signalRules ??
        [];

      if (
        rules.length === 0
      ) {
        return {
          profileId:
            profile.id,
          score: 0,
        };
      }

      let score = 0;

      for (const rule of
        rules) {
        const value =
          signalProfile[
            rule.key
          ] ?? 0;

        if (
          rule.min !==
            undefined &&
          value >= rule.min
        ) {
          score +=
            value -
            rule.min +
            1;
        }

        if (
          rule.max !==
            undefined &&
          value <= rule.max
        ) {
          score +=
            rule.max -
            value +
            1;
        }
      }

      return {
        profileId:
          profile.id,
        score,
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score,
    );
}

export function findBestProfile(
  blueprint:
    ExperienceBlueprint,
  signalProfile:
    SignalProfile,
) {
  const scores =
    scoreResultProfiles(
      blueprint,
      signalProfile,
    );

  const best =
    scores[0];

  if (
    !best ||
    best.score <= 0
  ) {
    return null;
  }

  return (
    blueprint.resultModel.profiles.find(
      (profile) =>
        profile.id ===
        best.profileId,
    ) ?? null
  );
}

export function calculateCorrectAnswerScore(
  blueprint:
    ExperienceBlueprint,
  answers:
    ParticipantAnswers,
) {
  let correct = 0;
  let total = 0;

  for (const question of
    blueprint.questions) {
    const selectedOptionId =
      answers[question.id];

    const correctOptionId =
      question.options.find(
        (option) =>
          option.signals.some(
            (signal) =>
              signal.key ===
                "correct" &&
              signal.weight > 0,
          ),
      )?.id;

    if (!correctOptionId) {
      continue;
    }

    total += 1;

    if (
      selectedOptionId ===
      correctOptionId
    ) {
      correct += 1;
    }
  }

  if (total === 0) {
    return 0;
  }

  return Math.round(
    (correct / total) *
      100,
  );
}

export function calculateScoreResult(
  blueprint:
    ExperienceBlueprint,
  score: number,
) {
  return (
    blueprint.resultModel.profiles.find(
      (profile) => {
        const min =
          profile.minScore ??
          0;

        const max =
          profile.maxScore ??
          100;

        return (
          score >= min &&
          score <= max
        );
      },
    ) ?? null
  );
}