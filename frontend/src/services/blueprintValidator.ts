import type {
  ExperienceBlueprint,
  ExperienceTone,
  ExperienceType,
  ResultMode,
  TestResultStrategy,
} from "@/types/experienceBlueprint";

export type BlueprintValidationResult = {
  valid: boolean;
  errors: string[];
};

const EXPERIENCE_TYPES:
  ExperienceType[] = [
    "compatibility",
    "test",
    "puzzle",
    "recommendation",
    "decision",
    "story",
    "content",
    "guided",
  ];

const EXPERIENCE_TONES:
  ExperienceTone[] = [
    "fun",
    "sharp",
    "flirty",
    "neutral",
    "absurd",
    "dramatic",
  ];

const RESULT_MODES:
  ResultMode[] = [
    "similarity",
    "score",
    "profile",
    "spectrum",
    "archetype",
    "recommendation",
    "route",
  ];

const TEST_STRATEGIES:
  TestResultStrategy[] = [
    "score",
    "spectrum",
    "archetype",
  ];

function isNonEmptyString(
  value: unknown,
) {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function isFiniteNumber(
  value: unknown,
) {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function validateQuestions(
  blueprint:
    ExperienceBlueprint,
  errors: string[],
) {
  if (
    !Array.isArray(
      blueprint.questions,
    ) ||
    blueprint.questions.length === 0
  ) {
    errors.push(
      "Blueprint en az bir soru içermeli.",
    );

    return;
  }

  const questionIds =
    new Set<string>();

  for (const [
    questionIndex,
    question,
  ] of blueprint.questions.entries()) {
    if (
      !isNonEmptyString(
        question.id,
      )
    ) {
      errors.push(
        `Soru ${questionIndex + 1}: id eksik.`,
      );
    } else if (
      questionIds.has(
        question.id,
      )
    ) {
      errors.push(
        `Soru ${questionIndex + 1}: duplicate id (${question.id}).`,
      );
    } else {
      questionIds.add(
        question.id,
      );
    }

    if (
      !isNonEmptyString(
        question.text,
      )
    ) {
      errors.push(
        `Soru ${questionIndex + 1}: soru metni boş.`,
      );
    }

    if (
      !Array.isArray(
        question.options,
      ) ||
      question.options.length < 2
    ) {
      errors.push(
        `Soru ${questionIndex + 1}: en az 2 seçenek gerekli.`,
      );

      continue;
    }

    const optionIds =
      new Set<string>();

    for (const [
      optionIndex,
      option,
    ] of question.options.entries()) {
      if (
        !isNonEmptyString(
          option.id,
        )
      ) {
        errors.push(
          `Soru ${questionIndex + 1}, seçenek ${optionIndex + 1}: id eksik.`,
        );
      } else if (
        optionIds.has(
          option.id,
        )
      ) {
        errors.push(
          `Soru ${questionIndex + 1}: duplicate option id (${option.id}).`,
        );
      } else {
        optionIds.add(
          option.id,
        );
      }

      if (
        !isNonEmptyString(
          option.text,
        )
      ) {
        errors.push(
          `Soru ${questionIndex + 1}, seçenek ${optionIndex + 1}: metin boş.`,
        );
      }

      if (
        !isNonEmptyString(
          option.meaning,
        )
      ) {
        errors.push(
          `Soru ${questionIndex + 1}, seçenek ${optionIndex + 1}: meaning boş.`,
        );
      }

      if (
        !Array.isArray(
          option.signals,
        )
      ) {
        errors.push(
          `Soru ${questionIndex + 1}, seçenek ${optionIndex + 1}: signals array değil.`,
        );

        continue;
      }

      for (const [
        signalIndex,
        signal,
      ] of option.signals.entries()) {
        if (
          !isNonEmptyString(
            signal.key,
          )
        ) {
          errors.push(
            `Soru ${questionIndex + 1}, seçenek ${optionIndex + 1}, signal ${signalIndex + 1}: key boş.`,
          );
        }

        if (
          !isFiniteNumber(
            signal.weight,
          )
        ) {
          errors.push(
            `Soru ${questionIndex + 1}, seçenek ${optionIndex + 1}, signal ${signalIndex + 1}: weight geçersiz.`,
          );
        } else if (
          signal.weight < 0 ||
          signal.weight > 1
        ) {
          errors.push(
            `Soru ${questionIndex + 1}, seçenek ${optionIndex + 1}, signal ${signalIndex + 1}: weight 0–1 arasında olmalı.`,
          );
        }
      }
    }
  }
}

function validateResultModel(
  blueprint:
    ExperienceBlueprint,
  errors: string[],
) {
  const resultModel =
    blueprint.resultModel;

  if (!resultModel) {
    errors.push(
      "resultModel eksik.",
    );

    return;
  }

  if (
    !RESULT_MODES.includes(
      resultModel.mode,
    )
  ) {
    errors.push(
      `Geçersiz result mode: ${String(resultModel.mode)}`,
    );
  }

  if (
    !Array.isArray(
      resultModel.profiles,
    ) ||
    resultModel.profiles.length === 0
  ) {
    errors.push(
      "En az bir result profile gerekli.",
    );

    return;
  }

  const profileIds =
    new Set<string>();

  for (const [
    profileIndex,
    profile,
  ] of resultModel.profiles.entries()) {
    if (
      !isNonEmptyString(
        profile.id,
      )
    ) {
      errors.push(
        `Result profile ${profileIndex + 1}: id eksik.`,
      );
    } else if (
      profileIds.has(
        profile.id,
      )
    ) {
      errors.push(
        `Duplicate result profile id: ${profile.id}`,
      );
    } else {
      profileIds.add(
        profile.id,
      );
    }

    if (
      !isNonEmptyString(
        profile.title,
      )
    ) {
      errors.push(
        `Result profile ${profileIndex + 1}: title boş.`,
      );
    }

    if (
      !isNonEmptyString(
        profile.description,
      )
    ) {
      errors.push(
        `Result profile ${profileIndex + 1}: description boş.`,
      );
    }

    if (
      profile.minScore !==
        undefined &&
      !isFiniteNumber(
        profile.minScore,
      )
    ) {
      errors.push(
        `Result profile ${profileIndex + 1}: minScore geçersiz.`,
      );
    }

    if (
      profile.maxScore !==
        undefined &&
      !isFiniteNumber(
        profile.maxScore,
      )
    ) {
      errors.push(
        `Result profile ${profileIndex + 1}: maxScore geçersiz.`,
      );
    }

    if (
      profile.minScore !== undefined &&
      isFiniteNumber(profile.minScore) &&
      (
        profile.minScore < 0 ||
        profile.minScore > 100
      )
    ) {
      errors.push(
        `Result profile ${profileIndex + 1}: minScore 0–100 arasında olmalı.`,
      );
    }

    if (
      profile.maxScore !== undefined &&
      isFiniteNumber(profile.maxScore) &&
      (
        profile.maxScore < 0 ||
        profile.maxScore > 100
      )
    ) {
      errors.push(
        `Result profile ${profileIndex + 1}: maxScore 0–100 arasında olmalı.`,
      );
    }

    if (
      profile.minScore !==
        undefined &&
      profile.maxScore !==
        undefined &&
      profile.minScore >
        profile.maxScore
    ) {
      errors.push(
        `Result profile ${profileIndex + 1}: minScore maxScore'dan büyük olamaz.`,
      );
    }

    if (
      profile.signalRules !==
        undefined
    ) {
      if (
        !Array.isArray(
          profile.signalRules,
        )
      ) {
        errors.push(
          `Result profile ${profileIndex + 1}: signalRules array değil.`,
        );
      } else {
        for (const [
          ruleIndex,
          rule,
        ] of profile.signalRules.entries()) {
          if (
            !isNonEmptyString(
              rule.key,
            )
          ) {
            errors.push(
              `Result profile ${profileIndex + 1}, rule ${ruleIndex + 1}: key boş.`,
            );
          }

          if (
            rule.min !==
              undefined &&
            !isFiniteNumber(
              rule.min,
            )
          ) {
            errors.push(
              `Result profile ${profileIndex + 1}, rule ${ruleIndex + 1}: min geçersiz.`,
            );
          }

          if (
            rule.max !==
              undefined &&
            !isFiniteNumber(
              rule.max,
            )
          ) {
            errors.push(
              `Result profile ${profileIndex + 1}, rule ${ruleIndex + 1}: max geçersiz.`,
            );
          }
        }
      }
    }
  }
}

function validateOffer(
  blueprint:
    ExperienceBlueprint,
  errors: string[],
) {
  if (!blueprint.offer) {
    return;
  }

  if (
    typeof blueprint.offer
      .enabled !== "boolean"
  ) {
    errors.push(
      "Offer enabled değeri boolean olmalı.",
    );
  }

  if (
    blueprint.offer.enabled
  ) {
    if (
      !isNonEmptyString(
        blueprint.offer.title,
      )
    ) {
      errors.push(
        "Aktif Offer için title gerekli.",
      );
    }

    if (
      !isNonEmptyString(
        blueprint.offer
          .description,
      )
    ) {
      errors.push(
        "Aktif Offer için description gerekli.",
      );
    }

    if (
      !isFiniteNumber(
        blueprint.offer
          .suggestedPrice,
      ) ||
      blueprint.offer
          .suggestedPrice < 1 ||
      blueprint.offer
          .suggestedPrice > 499
    ) {
      errors.push(
        "Offer fiyatı 1–499 arasında olmalı.",
      );
    }
  }
}

function validateCompatibility(
  blueprint:
    ExperienceBlueprint,
  errors: string[],
) {
  if (
    blueprint.type !==
    "compatibility"
  ) {
    return;
  }

  if (
    blueprint.resultModel.mode !==
    "similarity"
  ) {
    errors.push(
      "Compatibility Experience result mode similarity olmalı.",
    );
  }

  if (
    !blueprint.compatibility
      ?.creatorAnswers
  ) {
    errors.push(
      "Compatibility Experience creatorAnswers içermeli.",
    );

    return;
  }

  for (const question of
    blueprint.questions) {
    const creatorOptionId =
      blueprint.compatibility
        .creatorAnswers[
        question.id
      ];

    if (
      !creatorOptionId
    ) {
      errors.push(
        `Compatibility: ${question.id} için creator cevabı eksik.`,
      );

      continue;
    }

    const optionExists =
      question.options.some(
        (option) =>
          option.id ===
          creatorOptionId,
      );

    if (!optionExists) {
      errors.push(
        `Compatibility: ${question.id} için creator cevabı seçeneklerle eşleşmiyor.`,
      );
    }
  }
}

function validateTest(
  blueprint:
    ExperienceBlueprint,
  errors: string[],
) {
  if (
    blueprint.type !== "test"
  ) {
    return;
  }

  const strategy =
    blueprint.test?.strategy;

  if (
    !strategy ||
    !TEST_STRATEGIES.includes(
      strategy,
    )
  ) {
    errors.push(
      "Test Experience geçerli bir test.strategy içermeli.",
    );

    return;
  }

  if (
    strategy === "score"
  ) {
    if (
      blueprint.resultModel.mode !==
      "score"
    ) {
      errors.push(
        "Score Test result mode score olmalı.",
      );
    }

    for (const [
      questionIndex,
      question,
    ] of blueprint.questions.entries()) {
      const correctOptions =
        question.options.filter(
          (option) =>
            option.signals.some(
              (signal) =>
                signal.key ===
                  "correct" &&
                signal.weight > 0,
            ),
        );

      if (
        correctOptions.length !== 1
      ) {
        errors.push(
          `Score Test: Soru ${questionIndex + 1} tam olarak 1 doğru seçenek içermeli.`,
        );
      }
    }

    return;
  }

  if (
    strategy === "spectrum"
  ) {
    if (
      blueprint.resultModel.mode !==
      "spectrum"
    ) {
      errors.push(
        "Spectrum Test result mode spectrum olmalı.",
      );
    }

    const spectrumKey =
      blueprint.test?.spectrumKey;

    if (
      !isNonEmptyString(
        spectrumKey,
      )
    ) {
      errors.push(
        "Spectrum Test spectrumKey içermeli.",
      );

      return;
    }

    for (const [
      questionIndex,
      question,
    ] of blueprint.questions.entries()) {
      for (const [
        optionIndex,
        option,
      ] of question.options.entries()) {
        const signal =
          option.signals.find(
            (item) =>
              item.key ===
              spectrumKey,
          );

        if (!signal) {
          errors.push(
            `Spectrum Test: Soru ${questionIndex + 1}, seçenek ${optionIndex + 1} spectrumKey signal'i içermeli.`,
          );
        }
      }
    }

    return;
  }

  if (
    strategy === "archetype"
  ) {
    if (
      blueprint.resultModel.mode !==
      "archetype" &&
      blueprint.resultModel.mode !==
      "profile"
    ) {
      errors.push(
        "Archetype Test result mode archetype olmalı.",
      );
    }

    const mappings =
      blueprint.test
        ?.archetypeSignalKeys;

    if (
      !mappings ||
      typeof mappings !== "object"
    ) {
      errors.push(
        "Archetype Test archetypeSignalKeys içermeli.",
      );

      return;
    }

    const profileIds =
      new Set(
        blueprint.resultModel
          .profiles.map(
            (profile) =>
              profile.id,
          ),
      );

    for (const profileId of
      profileIds) {
      const signalKey =
        mappings[profileId];

      if (
        !isNonEmptyString(
          signalKey,
        )
      ) {
        errors.push(
          `Archetype Test: ${profileId} için signal key eksik.`,
        );
      }
    }

    const allowedSignalKeys =
      new Set(
        Object.values(
          mappings,
        ).filter(
          isNonEmptyString,
        ),
      );

    for (const [
      questionIndex,
      question,
    ] of blueprint.questions.entries()) {
      for (const [
        optionIndex,
        option,
      ] of question.options.entries()) {
        const hasArchetypeSignal =
          option.signals.some(
            (signal) =>
              allowedSignalKeys.has(
                signal.key,
              ) &&
              signal.weight > 0,
          );

        if (!hasArchetypeSignal) {
          errors.push(
            `Archetype Test: Soru ${questionIndex + 1}, seçenek ${optionIndex + 1} en az bir archetype signal içermeli.`,
          );
        }
      }
    }
  }
}

function validatePuzzle(
  blueprint:
    ExperienceBlueprint,
  errors: string[],
) {
  if (
    blueprint.type !==
    "puzzle"
  ) {
    return;
  }

  if (
    !blueprint.puzzle
  ) {
    errors.push(
      "Puzzle definition eksik.",
    );

    return;
  }

  if (
    !isNonEmptyString(
      blueprint.puzzle
        .explanation,
    )
  ) {
    errors.push(
      "Puzzle explanation gerekli.",
    );
  }

  if (
    blueprint.puzzle
      .difficulty &&
    ![
      "easy",
      "medium",
      "hard",
    ].includes(
      blueprint.puzzle
        .difficulty,
    )
  ) {
    errors.push(
      "Puzzle difficulty geçersiz.",
    );
  }

  const correctOptionId =
    blueprint.puzzle
      .correctOptionId;

  if (correctOptionId) {
    const optionExists =
      blueprint.questions.some(
        (question) =>
          question.options.some(
            (option) =>
              option.id ===
              correctOptionId,
          ),
      );

    if (!optionExists) {
      errors.push(
        "Puzzle correctOptionId hiçbir seçenekle eşleşmiyor.",
      );
    }
  }
}

export function validateExperienceBlueprint(
  value: unknown,
): BlueprintValidationResult {
  const errors: string[] =
    [];

  if (
    !value ||
    typeof value !== "object"
  ) {
    return {
      valid: false,
      errors: [
        "Blueprint object olmalı.",
      ],
    };
  }

  const blueprint =
    value as ExperienceBlueprint;

  if (
    blueprint.version !== 1
  ) {
    errors.push(
      "Desteklenmeyen Blueprint version.",
    );
  }

  if (
    !EXPERIENCE_TYPES.includes(
      blueprint.type,
    )
  ) {
    errors.push(
      `Geçersiz Experience type: ${String(blueprint.type)}`,
    );
  }

  if (
    !isNonEmptyString(
      blueprint.title,
    )
  ) {
    errors.push(
      "Blueprint title boş olamaz.",
    );
  }

  if (
    !isNonEmptyString(
      blueprint.description,
    )
  ) {
    errors.push(
      "Blueprint description boş olamaz.",
    );
  }

  if (
    !EXPERIENCE_TONES.includes(
      blueprint.tone,
    )
  ) {
    errors.push(
      `Geçersiz tone: ${String(blueprint.tone)}`,
    );
  }

  validateQuestions(
    blueprint,
    errors,
  );

  validateResultModel(
    blueprint,
    errors,
  );

  validateOffer(
    blueprint,
    errors,
  );

  validateCompatibility(
    blueprint,
    errors,
  );

  validateTest(
    blueprint,
    errors,
  );

  validatePuzzle(
    blueprint,
    errors,
  );

  return {
    valid:
      errors.length === 0,
    errors,
  };
}