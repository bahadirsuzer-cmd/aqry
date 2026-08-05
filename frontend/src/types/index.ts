export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  bio?: string;
}

export type ScoreMap = Record<string, number>;

export interface Answer {
  id: string;
  text: string;
  image?: string;
  scores: ScoreMap;
}

export interface Question {
  id: string;
  text: string;
  image?: string;
  order: number;
  answers: Answer[];
}

export interface ResultProfile {
  id: string;
  key: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  strengths: string[];
  weaknesses: string[];
  relationshipStyle: string;
  roleDescription: string;
  image?: string;
  shareText: string;
  color?: string;
}

export type TestStatus = "active" | "published" | "draft" | "archived";

export type TestCategory =
  | "UYUM TESTİ"
  | "KİŞİLİK TESTİ"
  | "QUIZ"
  | "PUZZLE"
  | "STORY"
  | "CONVERSATION"
  | "PREDICTION";

export interface Test {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: TestCategory;
  coverImage?: string;
  creator: Creator;
  estimatedDuration: string;
  totalParticipants: number;
  price: number;
  currency: string;
  questions: Question[];
  resultProfiles: ResultProfile[];
  status: TestStatus;
  creatorId?: string;
  ctaText?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  isSystem?: boolean;
}

export type AnswerRecord = Record<string, string>;

export interface QuizResult {
  winnerKey: string;
  scores: ScoreMap;
  percentages: ScoreMap;
}

export interface QuizSessionState {
  currentQuestionIndex: number;
  answers: AnswerRecord;
  isStarted: boolean;
  isCompleted: boolean;
  isUnlocked: boolean;
  result: QuizResult | null;
}