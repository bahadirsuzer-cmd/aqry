import { useState } from "react";
import type { TestDraft, ValidationIssue } from "@/services/testDraft";
import { MAX_QUESTIONS, MIN_QUESTIONS, createId, emptyQuestion } from "@/services/testDraft";
import { QuestionEditor } from "./QuestionEditor";
import { ActionButton, Panel } from "./ui";
import { fieldError } from "./ValidationSummary";

interface QuestionsStepProps {
  draft: TestDraft;
  issues: ValidationIssue[];
  onChange: (patch: Partial<TestDraft>) => void;
}

export function QuestionsStep({ draft, issues, onChange }: QuestionsStepProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const keys = draft.profiles.map((profile) => profile.key);
  const listError = fieldError(issues, "questions");

  const addQuestion = () => {
    if (draft.questions.length >= MAX_QUESTIONS) return;
    onChange({ questions: [...draft.questions, emptyQuestion(keys)] });
  };

  const duplicate = (index: number) => {
    const source = draft.questions[index];
    if (!source || draft.questions.length >= MAX_QUESTIONS) return;
    const copy = {
      ...source,
      id: createId("question"),
      answers: source.answers.map((answer) => ({
        ...answer,
        id: createId("answer"),
        scores: { ...answer.scores },
      })),
    };
    const questions = [...draft.questions];
    questions.splice(index + 1, 0, copy);
    onChange({ questions });
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.questions.length) return;
    const questions = [...draft.questions];
    [questions[index], questions[target]] = [questions[target], questions[index]];
    onChange({ questions });
  };

  const remove = (index: number) => {
    if (!window.confirm(`${index + 1}. soru silinsin mi?`)) return;
    onChange({ questions: draft.questions.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <Panel className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{draft.questions.length} soru</p>
          <p className="text-xs text-muted-foreground">
            En az {MIN_QUESTIONS}, en fazla {MAX_QUESTIONS} soru.
          </p>
          {listError ? <p className="mt-1 text-xs font-medium text-destructive">{listError}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton
            onClick={() => duplicate(draft.questions.length - 1)}
            disabled={draft.questions.length === 0 || draft.questions.length >= MAX_QUESTIONS}
          >
            Son soruyu çoğalt
          </ActionButton>
          <ActionButton
            tone="primary"
            onClick={addQuestion}
            disabled={draft.questions.length >= MAX_QUESTIONS}
          >
            Yeni soru ekle
          </ActionButton>
        </div>
      </Panel>

      {draft.questions.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">
            Henüz soru eklemedin. “Yeni soru ekle” ile başla.
          </p>
        </Panel>
      ) : null}

      {draft.questions.map((question, index) => (
        <QuestionEditor
          key={question.id}
          question={question}
          index={index}
          total={draft.questions.length}
          profiles={draft.profiles}
          issues={issues}
          collapsed={Boolean(collapsed[question.id])}
          onToggleCollapse={() =>
            setCollapsed((prev) => ({ ...prev, [question.id]: !prev[question.id] }))
          }
          onChange={(next) =>
            onChange({
              questions: draft.questions.map((item) => (item.id === question.id ? next : item)),
            })
          }
          onMove={(direction) => move(index, direction)}
          onDuplicate={() => duplicate(index)}
          onRemove={() => remove(index)}
        />
      ))}
    </div>
  );
}
