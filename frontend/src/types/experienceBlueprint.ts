export type ExperienceType =
  | "compatibility"
  | "test"
  | "puzzle"
  | "recommendation"
  | "decision"
  | "story"
  | "content"
  | "guided";

export type ExperienceTone =
  | "fun"
  | "sharp"
  | "flirty"
  | "neutral"
  | "absurd"
  | "dramatic";

export type ResultMode =
  | "similarity"
  | "score"
  | "profile"
  | "spectrum"
  | "archetype"
  | "recommendation"
  | "route";

export type TestResultStrategy =
  | "score"
  | "spectrum"
  | "archetype";

export type BlueprintSignal = {
  key: string;
  weight: number;
};

export type BlueprintOption = {
  id: string;
  text: string;
  signals: BlueprintSignal[];
  meaning: string;
};

export type BlueprintQuestion = {
  id: string;
  text: string;
  options: BlueprintOption[];
};

export type BlueprintSignalRule = {
  key: string;
  min?: number;
  max?: number;
};

export type BlueprintResultProfile = {
  id: string;
  title: string;
  description: string;
  minScore?: number;
  maxScore?: number;
  signalRules?: BlueprintSignalRule[];
};

export type BlueprintResultModel = {
  mode: ResultMode;
  profiles: BlueprintResultProfile[];
};

export type BlueprintOffer = {
  enabled: boolean;
  title: string;
  description: string;
  suggestedPrice: number;
};

export type CompatibilityReference = {
  creatorAnswers: Record<string, string>;
};

export type PuzzleDefinition = {
  correctOptionId?: string;
  explanation?: string;
  difficulty?:
    | "easy"
    | "medium"
    | "hard";
};

export type TestDefinition = {
  strategy: TestResultStrategy;

  /*
   * spectrum:
   * "ghosting", "jealousy",
   * "fanaticism" gibi tek ana eksen.
   */
  spectrumKey?: string;

  /*
   * archetype:
   * Sonuç profilinin hangi signal key'iyle
   * eşleştiğini açıkça saklamak için.
   *
   * Örn:
   * professor -> professor
   * tokyo -> tokyo
   */
  archetypeSignalKeys?: Record<
    string,
    string
  >;
};

export type ExperienceBlueprint = {
  version: 1;
  type: ExperienceType;
  title: string;
  description: string;
  tone: ExperienceTone;
  questions: BlueprintQuestion[];
  resultModel: BlueprintResultModel;
  offer?: BlueprintOffer;
  compatibility?: CompatibilityReference;
  puzzle?: PuzzleDefinition;
  test?: TestDefinition;
};
