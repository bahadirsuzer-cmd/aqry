import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Test } from "@/types";
import type { TestDraft } from "@/services/testDraft";
import {
  clearWizardDraft,
  draftFromTest,
  draftToTest,
  emptyDraft,
  loadWizardDraft,
  saveWizardDraft,
  validateDraft,
} from "@/services/testDraft";
import { createTest, isPublished, updateTest } from "@/services/testRepository";
import { getCreator } from "@/services/creatorRepository";
import { BasicInfoStep } from "./BasicInfoStep";
import { ResultProfilesStep } from "./ResultProfilesStep";
import { QuestionsStep } from "./QuestionsStep";
import { PublishStep } from "./PublishStep";
import { Toast, useToast } from "./Toast";
import { ActionButton } from "./ui";

type Step = 1 | 2 | 3 | 4;

const steps: Array<{ id: Step; label: string }> = [
  { id: 1, label: "Temel Bilgiler" },
  { id: 2, label: "Sonuç Profilleri" },
  { id: 3, label: "Sorular ve Cevaplar" },
  { id: 4, label: "Ön İzleme ve Yayınlama" },
];

interface TestWizardProps {
  existingTest?: Test;
}

export function TestWizard({ existingTest }: TestWizardProps) {
  const navigate = useNavigate();
  const { notice, show } = useToast();
  const [step, setStep] = useState<Step>(1);

  const [draft, setDraft] = useState<TestDraft>(() => {
    const base = existingTest ? draftFromTest(existingTest) : emptyDraft();
    const stored = loadWizardDraft(existingTest?.id ?? null);
    return stored ? { ...base, ...stored, id: existingTest?.id ?? stored.id ?? null } : base;
  });

  useEffect(() => {
    saveWizardDraft(existingTest?.id ?? null, draft);
  }, [draft, existingTest?.id]);

  const issues = useMemo(() => validateDraft(draft), [draft]);

  const patch = useCallback((next: Partial<TestDraft>) => {
    setDraft((prev) => ({ ...prev, ...next }));
  }, []);

  const persist = (publish: boolean) => {
    const creator = getCreator();
    const status = publish ? "published" : draft.id && isPublished(draft) ? draft.status : "draft";
    const payload = draftToTest(draft, creator, status);

    if (draft.id) {
      const { id: _ignored, ...rest } = payload;
      const saved = updateTest(draft.id, {
        ...rest,
        publishedAt: publish ? new Date().toISOString() : undefined,
      });
      if (!saved) {
        show("Test bulunamadı.");
        return;
      }
      clearWizardDraft(draft.id);
      show(publish ? "Test yayınlandı." : "Taslak kaydedildi.");
      navigate({ to: "/creator/tests" });
      return;
    }

    const { id: _newId, ...rest } = payload;
    const created = createTest(rest);
    clearWizardDraft(null);
    setDraft((prev) => ({ ...prev, id: created.id, status: created.status }));
    show(publish ? "Test yayınlandı." : "Taslak kaydedildi.");
    navigate({ to: "/creator/tests" });
  };

  const handlePublish = () => {
    if (issues.length > 0) {
      setStep(4);
      show("Eksikler giderilmeden yayınlayamazsın.");
      return;
    }
    persist(true);
  };

  const resetForm = () => {
    if (!window.confirm("Geçici taslak silinsin mi? Kaydedilmemiş değişiklikler kaybolur.")) return;
    clearWizardDraft(existingTest?.id ?? null);
    setDraft(existingTest ? draftFromTest(existingTest) : emptyDraft());
    setStep(1);
    show("Form temizlendi.");
  };

  const stepIssues = (id: Step) => issues.filter((issue) => issue.step === id).length;

  return (
    <div className="space-y-5">
      {existingTest && isPublished(existingTest) ? (
        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 text-sm font-medium text-primary">
          Yayındaki testte yaptığın değişiklikler kullanıcıların gördüğü sürümü güncelleyecek.
        </div>
      ) : null}

      <div className="sticky top-[57px] z-30 -mx-5 border-b border-border bg-background/95 px-5 py-3 backdrop-blur">
        <ol className="flex gap-2 overflow-x-auto">
          {steps.map((item) => {
            const active = item.id === step;
            const count = stepIssues(item.id);
            return (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setStep(item.id)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-gradient-brand text-primary-foreground"
                      : "border border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md text-xs font-bold ${
                      active ? "bg-white/20" : "bg-secondary text-foreground"
                    }`}
                  >
                    {item.id}
                  </span>
                  <span className="whitespace-nowrap">{item.label}</span>
                  {count > 0 && !active ? (
                    <span className="rounded-full bg-destructive/15 px-1.5 text-xs font-bold text-destructive">
                      {count}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {step === 1 ? <BasicInfoStep draft={draft} issues={issues} onChange={patch} /> : null}
      {step === 2 ? <ResultProfilesStep draft={draft} issues={issues} onChange={patch} /> : null}
      {step === 3 ? <QuestionsStep draft={draft} issues={issues} onChange={patch} /> : null}
      {step === 4 ? (
        <PublishStep
          draft={draft}
          issues={issues}
          isPublished={Boolean(existingTest && isPublished(existingTest))}
          onGoToStep={setStep}
          onSaveDraft={() => persist(false)}
          onPublish={handlePublish}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
        <div className="flex gap-2">
          <ActionButton onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev))} disabled={step === 1}>
            Geri
          </ActionButton>
          <ActionButton
            tone="primary"
            onClick={() => setStep((prev) => (prev < 4 ? ((prev + 1) as Step) : prev))}
            disabled={step === 4}
          >
            İleri
          </ActionButton>
        </div>
        <div className="flex gap-2">
          <ActionButton onClick={() => persist(false)}>Taslak kaydet</ActionButton>
          <ActionButton tone="danger" onClick={resetForm}>
            Formu temizle
          </ActionButton>
        </div>
      </div>

      <Toast message={notice} />
    </div>
  );
}
