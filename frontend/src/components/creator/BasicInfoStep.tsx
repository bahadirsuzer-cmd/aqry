import type { TestDraft, ValidationIssue } from "@/services/testDraft";
import { CATEGORIES } from "@/services/testDraft";
import { slugify } from "@/utils/slugify";
import { Field, Panel, Select, TextArea, TextInput } from "./ui";
import { fieldError } from "./ValidationSummary";

interface BasicInfoStepProps {
  draft: TestDraft;
  issues: ValidationIssue[];
  onChange: (patch: Partial<TestDraft>) => void;
}

export function BasicInfoStep({ draft, issues, onChange }: BasicInfoStepProps) {
  const handleTitle = (title: string) => {
    onChange(draft.slugTouched ? { title } : { title, slug: slugify(title) });
  };

  return (
    <Panel className="space-y-5">
      <Field label="Test başlığı" error={fieldError(issues, "title")}>
        <TextInput
          value={draft.title}
          placeholder="Örn: 10 Soruda Hangi Karaktersin?"
          onChange={(event) => handleTitle(event.target.value)}
        />
      </Field>

      <Field label="Alt başlık">
        <TextInput
          value={draft.subtitle}
          placeholder="Testi bir cümleyle anlat"
          onChange={(event) => onChange({ subtitle: event.target.value })}
        />
      </Field>

      <Field label="Kısa açıklama">
        <TextArea
          value={draft.description}
          placeholder="Test başlangıç ekranında görünecek açıklama"
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Kategori">
          <Select
            value={draft.category}
            onChange={(event) =>
              onChange({ category: event.target.value as TestDraft["category"] })
            }
          >
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tahmini süre">
          <TextInput
            value={draft.estimatedDuration}
            placeholder="2 dakika"
            onChange={(event) => onChange({ estimatedDuration: event.target.value })}
          />
        </Field>
      </div>

      <Field
        label="Slug"
        error={fieldError(issues, "slug")}
        hint={`Paylaşım bağlantısı: /test/${draft.slug || "test-slug"}`}
      >
        <TextInput
          value={draft.slug}
          onChange={(event) => onChange({ slug: slugify(event.target.value), slugTouched: true })}
        />
      </Field>

      <div className="space-y-3 rounded-xl border border-border bg-background p-4">
        <label className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
          <input
            type="checkbox"
            checked={draft.useGradientCover}
            onChange={(event) => onChange({ useGradientCover: event.target.checked })}
            className="h-4 w-4 accent-[oklch(0.52_0.23_300)]"
          />
          Kapak için gradient placeholder kullan
        </label>
        {!draft.useGradientCover ? (
          <Field label="Kapak görseli URL'si" error={fieldError(issues, "coverImage")}>
            <TextInput
              value={draft.coverImage}
              placeholder="https://..."
              onChange={(event) => onChange({ coverImage: event.target.value })}
            />
          </Field>
        ) : (
          <div className="h-20 w-full rounded-lg bg-gradient-brand" aria-hidden="true" />
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Sonuç kilidi fiyatı" error={fieldError(issues, "price")}>
          <TextInput
            type="number"
            min={0}
            step="0.1"
            value={String(draft.price)}
            onChange={(event) => onChange({ price: Math.max(0, Number(event.target.value) || 0) })}
          />
        </Field>
        <Field label="Para birimi">
          <TextInput
            value={draft.currency}
            onChange={(event) => onChange({ currency: event.target.value })}
          />
        </Field>
        <Field label="CTA metni">
          <TextInput
            value={draft.ctaText}
            onChange={(event) => onChange({ ctaText: event.target.value })}
          />
        </Field>
      </div>
    </Panel>
  );
}
