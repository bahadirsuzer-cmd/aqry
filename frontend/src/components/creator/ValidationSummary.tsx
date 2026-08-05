import type { ValidationIssue } from "@/services/testDraft";

const stepLabels: Record<number, string> = {
  1: "Temel Bilgiler",
  2: "Sonuç Profilleri",
  3: "Sorular ve Cevaplar",
  4: "Ön İzleme",
};

interface ValidationSummaryProps {
  issues: ValidationIssue[];
  onGoToStep?: (step: 1 | 2 | 3 | 4) => void;
}

export function ValidationSummary({ issues, onGoToStep }: ValidationSummaryProps) {
  if (issues.length === 0) {
    return (
      <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
        <p className="text-sm font-semibold text-primary">Her şey hazır — testi yayınlayabilirsin.</p>
      </div>
    );
  }

  const steps = [1, 2, 3, 4].filter((step) => issues.some((issue) => issue.step === step));

  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
      <p className="text-sm font-bold text-destructive">
        Yayınlamadan önce {issues.length} eksik giderilmeli
      </p>
      <div className="mt-3 space-y-3">
        {steps.map((step) => (
          <div key={step}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-destructive">
                Adım {step} · {stepLabels[step]}
              </span>
              {onGoToStep ? (
                <button
                  type="button"
                  onClick={() => onGoToStep(step as 1 | 2 | 3 | 4)}
                  className="text-xs font-semibold text-primary underline underline-offset-2"
                >
                  Bu adıma git
                </button>
              ) : null}
            </div>
            <ul className="mt-1.5 space-y-1">
              {issues
                .filter((issue) => issue.step === step)
                .map((issue) => (
                  <li key={`${issue.field}-${issue.message}`} className="flex gap-2 text-xs text-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-destructive" />
                    <span>{issue.message}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function fieldError(issues: ValidationIssue[], field: string): string | undefined {
  return issues.find((issue) => issue.field === field)?.message;
}
