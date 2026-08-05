export type AnalyticsEvent =
  | "test_viewed"
  | "test_started"
  | "question_answered"
  | "test_completed"
  | "result_preview_viewed"
  | "unlock_clicked"
  | "result_unlocked"
  | "share_clicked"
  | "quiz_restarted";

export interface AnalyticsPayload {
  testId?: string;
  testSlug?: string;
  creatorId?: string;
  questionId?: string;
  answerId?: string;
  resultId?: string;
  currentQuestion?: number;
  totalQuestions?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface StoredAnalyticsEvent {
  event: AnalyticsEvent;
  testId: string;
  testSlug: string;
  creatorId: string;
  timestamp: string;
}

const STORAGE_KEY = "aqry_analytics_events";
const MAX_EVENTS = 3000;

let enabled = true;

/**
 * Creator preview sessions must not pollute real analytics.
 * The preview route flips this off while it is mounted.
 */
export function setAnalyticsEnabled(next: boolean): void {
  enabled = next;
}

export function isAnalyticsEnabled(): boolean {
  return enabled;
}

export function readAnalyticsEvents(): StoredAnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredAnalyticsEvent[];
  } catch {
    return [];
  }
}

function persist(event: AnalyticsEvent, payload: AnalyticsPayload): void {
  if (typeof window === "undefined") return;
  if (!payload.testId) return;
  try {
    const events = readAnalyticsEvents();
    events.push({
      event,
      testId: String(payload.testId),
      testSlug: String(payload.testSlug ?? ""),
      creatorId: String(payload.creatorId ?? ""),
      timestamp: new Date().toISOString(),
    });
    const trimmed = events.length > MAX_EVENTS ? events.slice(events.length - MAX_EVENTS) : events;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* storage may be unavailable — analytics must never break the quiz */
  }
}

/**
 * Placeholder analytics transport. Swap the console.log for a real provider
 * later — the call sites never need to change. Never throws.
 */
export function trackEvent(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (!enabled) return;
  try {
    // eslint-disable-next-line no-console
    console.log("[analytics]", event, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
    persist(event, payload);
  } catch {
    /* analytics must never break the quiz flow */
  }
}
