import { supabase } from "@/services/supabase";

export interface CreatorExperienceModerationState {
  status: string;
  pausedBy: "creator" | "moderation" | null;
  pauseReason: string | null;
  moderatedAt: string | null;
}

export async function creatorSetExperiencePublishState(
  experienceId: string,
  targetStatus: "published" | "paused",
) {
  const { data, error } =
    await supabase.rpc(
      "creator_set_experience_publish_state",
      {
        p_experience_id:
          experienceId,
        p_target_status:
          targetStatus,
      },
    );

  if (error) {
    throw new Error(
      `Experience durumu değiştirilemedi: ${error.message}`,
    );
  }

  return data === true;
}

export async function adminPauseExperience(
  experienceId: string,
  reason: string,
  reportId?: string,
) {
  const normalizedReason =
    reason.trim();

  if (
    normalizedReason.length < 3
  ) {
    throw new Error(
      "Moderasyon gerekçesi gerekli.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "admin_pause_experience",
      {
        p_experience_id:
          experienceId,
        p_reason:
          normalizedReason,
        p_report_id:
          reportId ?? null,
      },
    );

  if (error) {
    throw new Error(
      `Experience duraklatılamadı: ${error.message}`,
    );
  }

  return data === true;
}

export async function adminReleaseExperienceModeration(
  experienceId: string,
  note?: string,
) {
  const { data, error } =
    await supabase.rpc(
      "admin_release_experience_moderation",
      {
        p_experience_id:
          experienceId,
        p_note:
          note?.trim() || null,
      },
    );

  if (error) {
    throw new Error(
      `Moderasyon kilidi kaldırılamadı: ${error.message}`,
    );
  }

  return data === true;
}