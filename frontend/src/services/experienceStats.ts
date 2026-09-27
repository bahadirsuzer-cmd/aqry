import { supabase } from "./supabase";

export interface ExperienceStats {
  totalViews: number;
  totalStarts: number;
  totalResponses: number;
  totalCompletions: number;
  highestScore: number;
  averageScore: number;
  latestCompletionAt: string | null;
}

interface CompletionRow {
  participant_key: string;
  score: number;
  completed_at: string;
}

interface ExperienceEventRow {
  event_type: "view" | "start" | "share";
  metadata?: {
    kind?: string;
  } | null;
}

export async function getExperienceStats(
  experienceId: string,
): Promise<ExperienceStats> {
  const [
    completionsResult,
    eventsResult,
  ] = await Promise.all([
supabase
  .from("completions")
  .select(
    "participant_key, score, completed_at",
  )
  .eq(
    "experience_id",
    experienceId,
  )
  .order("completed_at", {
    ascending: false,
  }),
    supabase
      .from("experience_events")
      .select("event_type, metadata")
      .eq(
        "experience_id",
        experienceId,
      ),
  ]);

  if (completionsResult.error) {
    throw new Error(
      `Tamamlama istatistikleri alınamadı: ${completionsResult.error.message}`,
    );
  }

  if (eventsResult.error) {
    throw new Error(
      `Experience olayları alınamadı: ${eventsResult.error.message}`,
    );
  }

  const completions =
    (completionsResult.data ??
      []) as CompletionRow[];
const uniqueCompletions = Array.from(
  new Map(
    completions.map((completion) => [
      completion.participant_key,
      completion,
    ]),
  ).values(),
);
  const events =
    (eventsResult.data ??
      []) as ExperienceEventRow[];

  const totalViews = events.filter(
    (event) =>
      event.event_type === "view",
  ).length;

  const totalStarts = events.filter(
    (event) =>
      event.event_type === "start",
  ).length;

  const totalResponses = events.filter(
    (event) =>
      event.event_type === "share" &&
      event.metadata?.kind === "anonymous_message",
  ).length;

  if (uniqueCompletions.length === 0) {
    return {
      totalViews,
      totalStarts,
      totalResponses,
      totalCompletions: 0,
      highestScore: 0,
      averageScore: 0,
      latestCompletionAt: null,
    };
  }

  const scores = uniqueCompletions.map(
  (completion) => completion.score,
);
  const scoreTotal = scores.reduce(
    (total, score) => total + score,
    0,
  );

  return {
    totalViews,
    totalStarts,
    totalResponses,
    totalCompletions:
  uniqueCompletions.length,
    highestScore: Math.max(...scores),
    averageScore: Math.round(
      scoreTotal / completions.length,
    ),
    latestCompletionAt:
  uniqueCompletions[0]
    ?.completed_at ?? null,
  };
}