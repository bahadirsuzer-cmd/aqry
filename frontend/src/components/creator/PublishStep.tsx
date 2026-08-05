import { Link } from "@tanstack/react-router";
import type { TestDraft, ValidationIssue } from "@/services/testDraft";
import { CATEGORIES } from "@/services/testDraft";
import { formatPrice } from "@/utils/format";
import { ValidationSummary } from "./ValidationSummary";
import { ActionButton, Panel } from "./ui";

interface PublishStepProps {
  draft: TestDraft;
  issues: ValidationIssue[];
  isPublished: boolean;
  onGoToStep: (step: 1 | 2 | 3 | 4) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border py-2 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function PublishStep({
  draft,
  issues,
  isPublished,
  onGoToStep,
  onSaveDraft,
  onPublish,
}: PublishStepProps) {
  const categoryLabel = CATEGORIES.find((item) => item.value === draft.category)?.label ?? "—";
  const canPublish = issues.length === 0;
  const sample = draft.questions.slice(0, 2);

  return (
    <div className="space-y-4">
      <Panel>
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Kontrol özeti</h2>
        <div className="mt-2">
          <SummaryRow label="Test başlığı" value={draft.title.trim() || "—"} />
          <SummaryRow label="Slug" value={draft.slug ? `/test/${draft.slug}` : "—"} />
          <SummaryRow label="Kategori" value={categoryLabel} />
          <SummaryRow label="Soru sayısı" value={String(draft.questions.length)} />
          <SummaryRow label="Sonuç profili" value={String(draft.profiles.length)} />
          <SummaryRow label="Tahmini süre" value={draft.estimatedDuration || "—"} />
          <SummaryRow label="Fiyat" value={formatPrice(draft.price, draft.currency)} />
          <SummaryRow label="Durum" value={isPublished ? "Yayında" : "Taslak"} />
        </div>
      </Panel>

      <ValidationSummary issues={issues} onGoToStep={onGoToStep} />

      <Panel>
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Kullanıcı gözüyle ön izleme
        </h2>
        <div className="mx-auto mt-4 w-full max-w-[520px] space-y-5 rounded-2xl border border-border bg-background p-5">
          <div
            className="h-32 w-full rounded-2xl bg-gradient-brand bg-cover bg-center"
            style={
              !draft.useGradientCover && draft.coverImage.trim()
                ? { backgroundImage: `url(${draft.coverImage.trim()})` }
                : undefined
            }
          />
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-black leading-tight tracking-tight text-foreground">
              {draft.title.trim() || "Test başlığı"}
            </h3>
            <p className="text-sm font-medium text-primary">{draft.subtitle.trim()}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{draft.description.trim()}</p>
          </div>
          <div className="btn-primary pointer-events-none">{draft.ctaText.trim() || "Teste başla"}</div>

          {sample.map((question, index) => (
            <div key={question.id} className="space-y-2 rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground">
                Soru {index + 1} / {draft.questions.length}
              </p>
              <p className="text-sm font-bold text-foreground">{question.text.trim() || "Soru metni"}</p>
              <ul className="space-y-1.5">
                {question.answers.map((answer) => (
                  <li
                    key={answer.id}
                    className="rounded-lg border border-border px-3 py-2 text-sm text-foreground"
                  >
                    {answer.text.trim() || "Cevap metni"}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <ActionButton tone="primary" onClick={onPublish} disabled={!canPublish}>
            {isPublished ? "Değişiklikleri yayınla" : "Yayınla"}
          </ActionButton>
          <ActionButton onClick={onSaveDraft}>Taslak olarak kaydet</ActionButton>
          <ActionButton tone="ghost" onClick={() => onGoToStep(3)}>
            Düzenlemeye geri dön
          </ActionButton>
          {draft.id ? (
            <Link
              to="/creator/tests/$id/preview"
              params={{ id: draft.id }}
              className="inline-flex items-center rounded-xl border border-border px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Tam ön izleme
            </Link>
          ) : (
            <ActionButton disabled title="Önce taslak olarak kaydet">
              Tam ön izleme
            </ActionButton>
          )}
        </div>
        {!draft.id ? (
          <p className="text-xs text-muted-foreground">
            Tam ön izleme için testi önce taslak olarak kaydet.
          </p>
        ) : null}
        {!canPublish ? (
          <p className="text-xs text-muted-foreground">
            Eksikler giderilene kadar yayınlayamazsın; taslak olarak kaydedebilirsin.
          </p>
        ) : null}
      </Panel>
    </div>
  );
}
