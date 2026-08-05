import type { DraftProfile, TestDraft, ValidationIssue } from "@/services/testDraft";
import { MAX_PROFILES, MIN_PROFILES, emptyProfile, profileKeyFor } from "@/services/testDraft";
import { ResultProfileEditor } from "./ResultProfileEditor";
import { ActionButton, Panel } from "./ui";
import { fieldError } from "./ValidationSummary";

interface ResultProfilesStepProps {
  draft: TestDraft;
  issues: ValidationIssue[];
  onChange: (patch: Partial<TestDraft>) => void;
}

/** Renames a profile key everywhere it is referenced in answer scores. */
function renameKeyInQuestions(draft: TestDraft, oldKey: string, newKey: string): TestDraft["questions"] {
  if (oldKey === newKey) return draft.questions;
  return draft.questions.map((question) => ({
    ...question,
    answers: question.answers.map((answer) => {
      const scores: Record<string, number> = {};
      for (const [key, value] of Object.entries(answer.scores)) {
        scores[key === oldKey ? newKey : key] = value;
      }
      if (!(newKey in scores)) scores[newKey] = 0;
      return { ...answer, scores };
    }),
  }));
}

function removeKeyFromQuestions(draft: TestDraft, key: string): TestDraft["questions"] {
  return draft.questions.map((question) => ({
    ...question,
    answers: question.answers.map((answer) => {
      const scores = { ...answer.scores };
      delete scores[key];
      return { ...answer, scores };
    }),
  }));
}

export function ResultProfilesStep({ draft, issues, onChange }: ResultProfilesStepProps) {
  const listError = fieldError(issues, "profiles");

  const updateProfile = (id: string, patch: Partial<DraftProfile>) => {
    const index = draft.profiles.findIndex((profile) => profile.id === id);
    if (index === -1) return;
    const current = draft.profiles[index];
    let next: DraftProfile = { ...current, ...patch };

    // auto-derive the key from the name until the creator edits the key manually
    if (patch.name !== undefined && patch.key === undefined) {
      const others = draft.profiles.filter((profile) => profile.id !== id).map((profile) => profile.key);
      const autoKey = profileKeyFor(patch.name, others, index);
      const wasAuto = !current.key || current.key === profileKeyFor(current.name, others, index);
      if (wasAuto) next = { ...next, key: autoKey };
    }

    const profiles = draft.profiles.map((profile) => (profile.id === id ? next : profile));
    const questions =
      next.key !== current.key
        ? renameKeyInQuestions(draft, current.key, next.key)
        : draft.questions;

    onChange({ profiles, questions });
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.profiles.length) return;
    const profiles = [...draft.profiles];
    [profiles[index], profiles[target]] = [profiles[target], profiles[index]];
    onChange({ profiles });
  };

  const remove = (profile: DraftProfile) => {
    const used = draft.questions.some((question) =>
      question.answers.some((answer) => (answer.scores[profile.key] ?? 0) > 0),
    );
    const label = profile.name.trim() || "Bu profil";
    const message = used
      ? `${label} bazı cevaplarda puan alıyor. Silersen bu puanlar da kaldırılacak. Devam edilsin mi?`
      : `${label} silinsin mi?`;
    if (!window.confirm(message)) return;

    onChange({
      profiles: draft.profiles.filter((item) => item.id !== profile.id),
      questions: removeKeyFromQuestions(draft, profile.key),
    });
  };

  const add = () => {
    if (draft.profiles.length >= MAX_PROFILES) return;
    const profile = emptyProfile();
    const questions = draft.questions.map((question) => ({
      ...question,
      answers: question.answers.map((answer) => ({
        ...answer,
        scores: { ...answer.scores, [profile.key]: 0 },
      })),
    }));
    onChange({ profiles: [...draft.profiles, profile], questions });
  };

  return (
    <div className="space-y-4">
      <Panel className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {draft.profiles.length} sonuç profili
          </p>
          <p className="text-xs text-muted-foreground">En az {MIN_PROFILES}, en fazla {MAX_PROFILES} profil.</p>
          {listError ? <p className="mt-1 text-xs font-medium text-destructive">{listError}</p> : null}
        </div>
        <ActionButton tone="primary" onClick={add} disabled={draft.profiles.length >= MAX_PROFILES}>
          Profil ekle
        </ActionButton>
      </Panel>

      {draft.profiles.map((profile, index) => (
        <ResultProfileEditor
          key={profile.id}
          profile={profile}
          index={index}
          total={draft.profiles.length}
          issues={issues}
          canRemove={draft.profiles.length > MIN_PROFILES}
          onChange={(patch) => updateProfile(profile.id, patch)}
          onMove={(direction) => move(index, direction)}
          onRemove={() => remove(profile)}
        />
      ))}
    </div>
  );
}
