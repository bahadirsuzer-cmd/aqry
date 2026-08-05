import type {
  ExperienceBlueprint,
} from "@/types/experienceBlueprint";

import {
  validateExperienceBlueprint,
} from "@/services/blueprintValidator";

export type ProductBrainParseResult =
  | {
      success: true;
      blueprint: ExperienceBlueprint;
    }
  | {
      success: false;
      error: string;
      validationErrors?: string[];
      raw?: string;
    };

function stripCodeFence(
  value: string,
) {
  const trimmed = value.trim();

  if (
    trimmed.startsWith("```json")
  ) {
    return trimmed
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }

  if (
    trimmed.startsWith("```")
  ) {
    return trimmed
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }

  return trimmed;
}

function extractJsonObject(
  value: string,
) {
  const cleaned =
    stripCodeFence(value);

  const firstBrace =
    cleaned.indexOf("{");

  const lastBrace =
    cleaned.lastIndexOf("}");

  if (
    firstBrace === -1 ||
    lastBrace === -1 ||
    lastBrace <= firstBrace
  ) {
    return null;
  }

  return cleaned.slice(
    firstBrace,
    lastBrace + 1,
  );
}

export function parseProductBrainOutput(
  rawOutput: unknown,
): ProductBrainParseResult {
  if (
    typeof rawOutput !== "string"
  ) {
    return {
      success: false,
      error:
        "Product Brain çıktısı string değil.",
    };
  }

  const jsonText =
    extractJsonObject(
      rawOutput,
    );

  if (!jsonText) {
    return {
      success: false,
      error:
        "Product Brain çıktısında geçerli JSON bulunamadı.",
      raw: rawOutput,
    };
  }

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(jsonText);
  } catch {
    return {
      success: false,
      error:
        "Product Brain çıktısı JSON olarak parse edilemedi.",
      raw: rawOutput,
    };
  }

  const validation =
    validateExperienceBlueprint(
      parsed,
    );

  if (!validation.valid) {
    return {
      success: false,
      error:
        "Product Brain geçersiz bir Blueprint üretti.",
      validationErrors:
        validation.errors,
      raw: rawOutput,
    };
  }

  return {
    success: true,
    blueprint:
      parsed as ExperienceBlueprint,
  };
}