import type { Answer } from "@/types";

interface AnswerOptionProps {
  answer: Answer;
  index: number;
  selected: boolean;
  disabled: boolean;
  onSelect: (answerId: string) => void;
}

const letters = ["A", "B", "C", "D", "E", "F"];

export function AnswerOption({ answer, index, selected, disabled, onSelect }: AnswerOptionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(answer.id)}
      aria-pressed={selected}
      className={[
        "group flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-200",
        "active:scale-[0.99] disabled:cursor-default",
        selected
          ? "border-transparent bg-gradient-brand-soft shadow-card ring-2 ring-primary"
          : "border-border bg-card shadow-soft hover:border-primary/40 hover:shadow-card",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors",
          selected ? "bg-gradient-brand text-primary-foreground" : "bg-secondary text-muted-foreground",
        ].join(" ")}
      >
        {letters[index]}
      </span>
      <span className="text-[15px] font-medium leading-snug text-foreground">{answer.text}</span>
    </button>
  );
}
