import { runAiAction } from "./ai";
import { compatibilityGenerationPrompt, prepareCompatibilityBlueprint, type CompatibilityInput } from "@/lib/compatibilityComposer";

export async function generateCompatibility(title: string, inputs: CompatibilityInput[], locale: string) {
  const { blueprint } = await runAiAction("generate_experience", compatibilityGenerationPrompt(title, inputs, locale));
  if (!blueprint) throw new Error("INVALID_GENERATION");
  return prepareCompatibilityBlueprint(blueprint, inputs);
}
