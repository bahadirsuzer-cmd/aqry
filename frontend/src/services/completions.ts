import { supabase } from "./supabase";

const PARTICIPANT_STORAGE_KEY = "aqry-participant-key";

export interface CompletionInput {
  experienceId: string;
  score: number;
  resultKey?: string;
  answers: number[];
}

export function getParticipantKey() {
  const existingKey = window.localStorage.getItem(
    PARTICIPANT_STORAGE_KEY,
  );

  if (existingKey) {
    return existingKey;
  }

  const participantKey = crypto.randomUUID();

  window.localStorage.setItem(
    PARTICIPANT_STORAGE_KEY,
    participantKey,
  );

  return participantKey;
}

export async function saveCompletion({
  experienceId,
  score,
  resultKey,
  answers,
}: CompletionInput) {
  const participantKey = getParticipantKey();

  const completion = {
    experience_id: experienceId,
    participant_key: participantKey,
    score,
    result_key: resultKey ?? null,
    answers,
    completed_at: new Date().toISOString(),
  };

  console.log(
    "Supabase completion gönderiliyor:",
    completion,
  );

  const { data, error } = await supabase
  .from("completions")
  .upsert(completion, {
    onConflict: "experience_id,participant_key",
  })
  .select()
  .single();
  if (error) {
    console.error(
      "Supabase completion hatası:",
      error,
    );

    throw new Error(
      `Tamamlama kaydedilemedi: ${error.message}`,
    );
  }

  console.log(
    "Supabase completion kaydedildi:",
    data,
  );

  return data;
}