import type { DraftAnswer, DraftProfile, ValidationIssue } from "@/services/testDraft";
import { MAX_SCORE } from "@/services/testDraft";
import { ActionButton, Field, TextInput } from "./ui";
import { fieldError } from "./ValidationSummary";

interface AnswerEditorProps {
  answer: DraftAnswer;
  index: number;
  profiles: DraftProfile[];
  issues: ValidationIssue[];
  canRemove: boolean;
  onChange: (patch: Partial<DraftAnswer>) => void;
  onScoreChange: (key: string, value: number) => void;
  onRemove: () => void;
}

const letters = ["A", "B", "C", "D", "E", "F"];

export function AnswerEditor({
  answer,
  index,
  profiles,
  issues,
  canRemove,
  onChange,
  onScoreChange,
  onRemove,
}: AnswerEditorProps) {
  const scoresError = fieldError(issues, `answer.${answer.id}.scores`);

  return (
    <div className="rounded-xl border border-border bg-background p-3.5">
      <div className="flex items-start gap-2.5">
        <span className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-muted-foreground">
          {letters[index] ?? index + 1}
        </span>
        <div className="min-w-0 flex-1 space-y-2.5">
          <Field label={`${index + 1}. cevap`} error={fieldError(issues, `answer.${answer.id}.text`)}>
            <TextInput
              value={answer.text}
              placeholder="Cevap metni"
              onChange={(event) => onChange({ text: event.target.value })}
            />
          </Field>
          <TextInput
            value={answer.image}
            placeholder="Cevap görseli URL'si (opsiyonel)"
            onChange={(event) => onChange({ image: event.target.value })}
          />
        </div>
        {canRemove ? (
          <ActionButton tone="ghost" onClick={onRemove} title="Cevabı sil">
            Sil
          </ActionButton>
        ) : null}
      </div>

      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Profil puanları (0–5)
        </p>
        <div className="mt-2 -mx-1 overflow-x-auto px-1">
          <div className="flex min-w-max gap-2">
            {profiles.map((profile) => (
              <div key={profile.id} className="w-32 shrink-0 rounded-lg border border-border bg-card p-2">
                <p className="truncate text-xs font-semibold text-foreground" title={profile.name}>
                  {profile.name.trim() || "Adsız profil"}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <input
                    type="range"
                    min={0}
                    max={MAX_SCORE}
                    step={1}
                    value={answer.scores[profile.key] ?? 0}
                    onChange={(event) => onScoreChange(profile.key, Number(event.target.value))}
                    className="h-1.5 w-full accent-[oklch(0.52_0.23_300)]"
                    aria-label={`${profile.name} puanı`}
                  />
                  <span className="w-5 shrink-0 text-right text-sm font-bold text-primary">
                    {answer.scores[profile.key] ?? 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {scoresError ? <p className="mt-2 text-xs font-medium text-destructive">{scoresError}</p> : null}
      </div>
    </div>
  );
}
