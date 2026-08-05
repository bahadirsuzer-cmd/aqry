import { getParticipantKey } from "@/services/completions";
import { supabase } from "@/services/supabase";

export type ExperienceAnalyticsEvent =
  | "view"
  | "start"
  | "result_viewed"
  | "offer_viewed"
  | "offer_checkout_started"
  | "offer_purchased"
  | "gift_selected"
  | "gift_checkout_started"
  | "gift_purchased"
  | "experience_shared";

export interface TrackExperienceEventInput {
  experienceId: string;
  eventType: ExperienceAnalyticsEvent;
  orderId?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown>;
}

const SESSION_KEY =
  "aqryo-experience-session-id";

function getExperienceSessionId() {
  try {
    const existing =
      sessionStorage.getItem(
        SESSION_KEY,
      );

    if (existing) {
      return existing;
    }

    const next =
      crypto.randomUUID();

    sessionStorage.setItem(
      SESSION_KEY,
      next,
    );

    return next;
  } catch {
    return null;
  }
}

export async function trackExperienceAnalyticsEvent(
  input: TrackExperienceEventInput,
) {
  const experienceId =
    input.experienceId.trim();

  if (!experienceId) {
    return null;
  }

  const participantId =
    getParticipantKey();

  const { data, error } =
    await supabase.rpc(
      "track_experience_event",
      {
        p_experience_id:
          experienceId,
        p_event_type:
          input.eventType,
        p_participant_id:
          participantId,
        p_session_id:
          getExperienceSessionId(),
        p_order_id:
          input.orderId ?? null,
        p_source:
          input.source ?? null,
        p_metadata:
          input.metadata ?? {},
      },
    );

  if (error) {
    console.error(
      "AQRYO analytics event error:",
      error,
    );

    return null;
  }

  return data as string | null;
}

export interface ExperienceFunnel {
  views: number;
  starts: number;
  completions: number;
  resultViews: number;
  offerViews: number;
  offerCheckoutStarts: number;
  offerPurchases: number;
  giftSelections: number;
  giftCheckoutStarts: number;
  giftPurchases: number;
  shares: number;

  startRate: number;
  completionRate: number;
  offerConversionRate: number;
  giftConversionRate: number;
  shareRate: number;
}

function safeCount(
  value: unknown,
) {
  const numeric =
    Number(value ?? 0);

  return Number.isFinite(numeric)
    ? Math.max(
        0,
        Math.trunc(numeric),
      )
    : 0;
}

function rate(
  numerator: number,
  denominator: number,
) {
  if (denominator <= 0) {
    return 0;
  }

  return (
    numerator / denominator
  );
}

export async function getCreatorExperienceFunnel(
  experienceId: string,
): Promise<ExperienceFunnel> {
  const { data, error } =
    await supabase.rpc(
      "get_my_experience_funnel",
      {
        p_experience_id:
          experienceId,
      },
    );

  if (error) {
    throw new Error(
      `Experience funnel alınamadı: ${error.message}`,
    );
  }

  const row =
    Array.isArray(data)
      ? data[0]
      : data;

  const views =
    safeCount(row?.views);
  const starts =
    safeCount(row?.starts);
  const completions =
    safeCount(
      row?.completions,
    );
  const resultViews =
    safeCount(
      row?.result_views,
    );
  const offerViews =
    safeCount(
      row?.offer_views,
    );
  const offerCheckoutStarts =
    safeCount(
      row?.offer_checkout_starts,
    );
  const offerPurchases =
    safeCount(
      row?.offer_purchases,
    );
  const giftSelections =
    safeCount(
      row?.gift_selections,
    );
  const giftCheckoutStarts =
    safeCount(
      row?.gift_checkout_starts,
    );
  const giftPurchases =
    safeCount(
      row?.gift_purchases,
    );
  const shares =
    safeCount(row?.shares);

  return {
    views,
    starts,
    completions,
    resultViews,
    offerViews,
    offerCheckoutStarts,
    offerPurchases,
    giftSelections,
    giftCheckoutStarts,
    giftPurchases,
    shares,

    startRate:
      rate(starts, views),

    completionRate:
      rate(
        completions,
        starts,
      ),

    offerConversionRate:
      rate(
        offerPurchases,
        offerViews,
      ),

    giftConversionRate:
      rate(
        giftPurchases,
        resultViews,
      ),

    shareRate:
      rate(
        shares,
        completions,
      ),
  };
}