import type { QuizSessionState } from "@/types";

const PREFIX = "aqry:quiz:";

export const emptySession: QuizSessionState = {
  currentQuestionIndex: 0,
  answers: {},
  isStarted: false,
  isCompleted: false,
  isUnlocked: false,
  result: null,
};

function keyFor(slug: string): string {
  return `${PREFIX}${slug}`;
}

export function loadSession(slug: string): QuizSessionState {
  if (typeof window === "undefined") return emptySession;
  try {
    const raw = window.localStorage.getItem(keyFor(slug));
    if (!raw) return emptySession;
    const parsed = JSON.parse(raw) as Partial<QuizSessionState>;
    return { ...emptySession, ...parsed };
  } catch {
    return emptySession;
  }
}

export function saveSession(slug: string, state: QuizSessionState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(keyFor(slug), JSON.stringify(state));
  } catch {
    /* storage may be unavailable (private mode) — quiz still works in memory */
  }
}

export function clearSession(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(keyFor(slug));
  } catch {
    /* noop */
  }
}
