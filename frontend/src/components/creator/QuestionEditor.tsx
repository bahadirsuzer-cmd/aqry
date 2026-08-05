import type { DraftAnswer, DraftProfile, DraftQuestion, ValidationIssue } from "@/services/testDraft";
import { MAX_ANSWERS, MIN_ANSWERS, emptyAnswer } from "@/services/testDraft";
import { AnswerEditor } from "./AnswerEditor";
import { ActionButton, Field, TextInput } from "./ui";
import { fieldError } from "./ValidationSummary";

interface QuestionEditorProps {
  question: DraftQuestion;
  index: number;
  total: number;
  profiles: DraftProfile[];
  issues: ValidationIssue[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onChange: (next: DraftQuestion) => void;
  onMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function QuestionEditor({
  question,
  index,
  total,
  profiles,
  issues,
  collapsed,
  onToggleCollapse,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
}: QuestionEditorProps) {
  const hasIssue = issues.some(
    (issue) =>
      issue.field.startsWith(`question.${question.id}`) ||
      question.answers.some((answer) => issue.field.startsWith(`answer.${answer.id}`)),
  );

  const updateAnswer = (answerId: string, patch: Partial<DraftAnswer>) => {
    onChange({
      ...question,
      answers: question.answers.map((answer) =>
        answer.id === answerId ? { ...answer, ...patch } : answer,
      ),
    });
  };

  const updateScore = (answerId: string, key: string, value: number) => {
    onChange({
      ...question,
      answers: question.answers.map((answer) =>
        answer.id === answerId
          ? { ...answer, scores: { ...answer.scores, [key]: value } }
          : answer,
      ),
    });
  };

  return (
    <div
      className={`rounded-2xl border bg-card p-4 ${hasIssue ? "border-destructive/40" : "border-border"}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand text-xs font-bold text-primary-foreground">
          {index + 1}
        </span>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-foreground"
        >
          {question.text.trim() || "Yeni soru"}
        </button>
        <div className="flex items-center gap-1">
          <ActionButton tone="ghost" onClick={() => onMove(-1)} disabled={index === 0} title="Yukarı taşı">
            ↑
          </ActionButton>
          <ActionButton
            tone="ghost"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            title="Aşağı taşı"
          >
            ↓
          </ActionButton>
          <ActionButton tone="ghost" onClick={onDuplicate} title="Soruyu çoğalt">
            Çoğalt
          </ActionButton>
          <ActionButton tone="ghost" onClick={onRemove} title="Soruyu sil">
            Sil
          </ActionButton>
          <ActionButton tone="ghost" onClick={onToggleCollapse}>
            {collapsed ? "Genişlet" : "Daralt"}
          </ActionButton>
        </div>
      </div>

      {collapsed ? (
        <p className="mt-2 text-xs text-muted-foreground">{question.answers.length} cevap</p>
      ) : (
        <div className="mt-4 space-y-4">
          <Field label="Soru metni" error={fieldError(issues, `question.${question.id}.text`)}>
            <TextInput
              value={question.text}
              placeholder="Örn: Sabah 07.00. Uyandın. İlk hareketin ne olur?"
              onChange={(event) => onChange({ ...question, text: event.target.value })}
            />
          </Field>

          <TextInput
            value={question.image}
            placeholder="Soru görseli URL'si (opsiyonel)"
            onChange={(event) => onChange({ ...question, image: event.target.value })}
          />

          <div className="space-y-3">
            {question.answers.map((answer, answerIndex) => (
              <AnswerEditor
                key={answer.id}
                answer={answer}
                index={answerIndex}
                profiles={profiles}
                issues={issues}
                canRemove={question.answers.length > MIN_ANSWERS}
                onChange={(patch) => updateAnswer(answer.id, patch)}
                onScoreChange={(key, value) => updateScore(answer.id, key, value)}
                onRemove={() =>
                  onChange({
                    ...question,
                    answers: question.answers.filter((item) => item.id !== answer.id),
                  })
                }
              />
            ))}
          </div>

          {fieldError(issues, `question.${question.id}.answers`) ? (
            <p className="text-xs font-medium text-destructive">
              {fieldError(issues, `question.${question.id}.answers`)}
            </p>
          ) : null}

          <ActionButton
            onClick={() =>
              onChange({
                ...question,
                answers: [...question.answers, emptyAnswer(profiles.map((profile) => profile.key))],
              })
            }
            disabled={question.answers.length >= MAX_ANSWERS}
          >
            Bu soruya yeni cevap ekle
          </ActionButton>
        </div>
      )}
    </div>
  );
}
