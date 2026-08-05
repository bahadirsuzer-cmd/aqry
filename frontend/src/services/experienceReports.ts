import { getParticipantKey } from "@/services/completions";
import { supabase } from "@/services/supabase";

export type ExperienceReportReason =
  | "spam"
  | "fraud"
  | "harassment"
  | "illegal"
  | "sexual"
  | "copyright"
  | "other";

export interface SubmitExperienceReportInput {
  experienceId: string;
  reason: ExperienceReportReason;
  details?: string;
}

export interface SubmitExperienceReportResult {
  alreadyReported: boolean;
}

const MAX_DETAILS_LENGTH = 1000;

export async function submitExperienceReport(
  input: SubmitExperienceReportInput,
): Promise<SubmitExperienceReportResult> {
  const experienceId =
    input.experienceId.trim();

  if (!experienceId) {
    throw new Error(
      "Experience kimliği eksik.",
    );
  }

  const details =
    input.details?.trim() ?? "";

  if (
    input.reason === "other" &&
    !details
  ) {
    throw new Error(
      "Lütfen bildirimin nedenini kısaca yaz.",
    );
  }

  if (
    details.length >
    MAX_DETAILS_LENGTH
  ) {
    throw new Error(
      "Açıklama en fazla 1000 karakter olabilir.",
    );
  }

  const participantKey =
    getParticipantKey();

  const { error } = await supabase
    .from("experience_reports")
    .insert({
      experience_id: experienceId,
      reporter_key: participantKey,
      reason: input.reason,
      details:
        details.length > 0
          ? details
          : null,
      status: "new",
    });

  if (error?.code === "23505") {
    return {
      alreadyReported: true,
    };
  }

  if (error) {
    throw new Error(
      `Bildirim gönderilemedi: ${error.message}`,
    );
  }

  return {
    alreadyReported: false,
  };
}