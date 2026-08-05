import { supabase } from "./supabase";
import { getParticipantKey } from "./completions";

export type ExperienceEventType =
  | "view"
  | "start"
  | "result_viewed"
  | "offer_viewed"
  | "checkout_started"
  | "gift_selected"
  | "share";

export interface ExperienceEventInput {
  experienceId: string;
  eventType: ExperienceEventType;
  source?: string | null;
  orderId?: string | null;
  metadata?: Record<string, unknown>;
}

const SESSION_STORAGE_KEY =
  "aqryo-experience-session-id";

function getSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  const existing =
    window.sessionStorage.getItem(
      SESSION_STORAGE_KEY,
    );

  if (existing) {
    return existing;
  }

  const sessionId =
    crypto.randomUUID();

  window.sessionStorage.setItem(
    SESSION_STORAGE_KEY,
    sessionId,
  );

  return sessionId;
}

function isDeduplicatedEvent(
  eventType: ExperienceEventType,
) {
  return (
    eventType === "view" ||
    eventType === "start"
  );
}

export async function recordExperienceEvent({
  experienceId,
  eventType,
  source = null,
  orderId = null,
  metadata = {},
}: ExperienceEventInput) {
  const participantId =
    getParticipantKey();

  const event = {
    experience_id: experienceId,
    event_type: eventType,
    participant_id: participantId,
    session_id: getSessionId(),
    order_id: orderId,
    source,
    metadata,
  };

  const { error } = await supabase
    .from("experience_events")
    .insert(event);

  if (!error) {
    return;
  }

  /*
   * view/start için partial unique index var.
   * Aynı participant aynı Experience'ta tekrar
   * view/start üretirse PostgreSQL 23505 döndürür.
   * Bu bizim için hata değil, deduplication'dır.
   */
  if (
    error.code === "23505" &&
    isDeduplicatedEvent(eventType)
  ) {
    return;
  }

  throw new Error(
    `Experience olayı kaydedilemedi: ${error.message}`,
  );
}