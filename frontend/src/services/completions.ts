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

  const { error } = await supabase
    .from("completions")
    .insert(completion);

  if (error?.code === "23505") {
    return completion;
  }

  if (error) {
    console.error(
      "Supabase completion hatası:",
      error,
    );

    throw new Error(
      `Tamamlama kaydedilemedi: ${error.message}`,
    );
  }

  return completion;
}