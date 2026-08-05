import { supabase } from "@/services/supabase";

import type {
  ExperienceBlueprint,
} from "@/types/experienceBlueprint";

import {
  parseProductBrainOutput,
} from "@/services/productBrainParser";

export type AiAction =
  | "generate_experience"
  | "generate_puzzle"
  | "improve_questions"
  | "rewrite_result"
  | "generate_offer"
  | "generate_share_text";

type AiGatewayResponse = {
  success: boolean;

  action: AiAction;

  credits: {
    cost: number;
    used: number;
    remaining: number;
  };

  result: string | null;
};

export type AiActionResult = {
  action: AiAction;

  credits: {
    cost: number;
    used: number;
    remaining: number;
  };

  blueprint: ExperienceBlueprint | null;

  rawResult: string | null;
};

export async function runAiAction(
  action: AiAction,
  input: string,
): Promise<AiActionResult> {
  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "ai-gateway",
    {
      body: {
        action,
        input,
      },
    },
  );

  if (error) {
    throw error;
  }

  if (
    data?.error ===
    "DAILY_AI_LIMIT_REACHED"
  ) {
    throw new Error(
      "Günlük AI kredi limitine ulaştın.",
    );
  }

  const response =
    data as AiGatewayResponse;

  if (
    !response.success
  ) {
    throw new Error(
      "AI isteği tamamlanamadı.",
    );
  }

  if (!response.result) {
    throw new Error(
      "Product Brain boş sonuç döndürdü.",
    );
  }

  const parsed =
    parseProductBrainOutput(
      response.result,
    );

  if (!parsed.success) {
    console.error(
      "Product Brain parse error:",
      parsed,
    );

    throw new Error(
      parsed.validationErrors?.length
        ? `Blueprint geçersiz: ${parsed.validationErrors.join(
            " | ",
          )}`
        : parsed.error,
    );
  }

  return {
    action:
      response.action,

    credits:
      response.credits,

    blueprint:
      parsed.blueprint,

    rawResult:
      response.result,
  };
}