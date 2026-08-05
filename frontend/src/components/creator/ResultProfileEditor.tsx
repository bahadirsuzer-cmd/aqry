import { useState } from "react";
import type { DraftProfile, ValidationIssue } from "@/services/testDraft";
import { PROFILE_COLORS, colorCss } from "@/services/testDraft";
import { ActionButton, Field, Select, TextArea, TextInput } from "./ui";
import { fieldError } from "./ValidationSummary";

interface TagInputProps {
  label: string;
  placeholder: string;
  values: string[];
  error?: string;
  onChange: (values: string[]) => void;
}

function TagInput({ label, placeholder, values, error, onChange }: TagInputProps) {
  const [value, setValue] = useState("");

  const add = () => {
    const next = value.trim();
    if (!next || values.includes(next)) {
      setValue("");
      return;
    }
    onChange([...values, next]);
    setValue("");
  };

  return (
    <Field label={label} error={error} hint="Enter'a basarak yeni etiket ekle.">
      <div className="flex flex-wrap gap-1.5">
        {values.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground"
          >
            {tag}
            <button
              type="button"
              aria-label={`${tag} etiketini sil`}
              onClick={() => onChange(values.filter((item) => item !== tag))}
              className="text-muted-foreground hover:text-destructive"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <TextInput
        value={value}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            add();
          }
        }}
        onBlur={add}
      />
    </Field>
  );
}

interface ResultProfileEditorProps {
  profile: DraftProfile;
  index: number;
  total: number;
  issues: ValidationIssue[];
  canRemove: boolean;
  onChange: (patch: Partial<DraftProfile>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

export function ResultProfileEditor({
  profile,
  index,
  total,
  issues,
  canRemove,
  onChange,
  onMove,
  onRemove,
}: ResultProfileEditorProps) {
  const err = (name: string) => fieldError(issues, `profile.${profile.id}.${name}`);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="h-7 w-7 shrink-0 rounded-lg"
          style={{ backgroundImage: colorCss(profile.color) }}
          aria-hidden="true"
        />
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
          {profile.name.trim() || `${index + 1}. profil`}
        </p>
        <div className="flex items-center gap-1">
          <ActionButton tone="ghost" onClick={() => onMove(-1)} disabled={index === 0} title="Yukarı taşı">
            ↑
          </ActionButton>
          <ActionButton tone="ghost" onClick={() => onMove(1)} disabled={index === total - 1} title="Aşağı taşı">
            ↓
          </ActionButton>
          <ActionButton tone="ghost" onClick={onRemove} disabled={!canRemove} title="Profili sil">
            Sil
          </ActionButton>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Profil adı" error={err("name")}>
          <TextInput
            value={profile.name}
            placeholder="Örn: Bree Van de Kamp"
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </Field>
        <Field label="Sistem anahtarı" error={err("key")} hint="Profil adından otomatik üretilir, düzenleyebilirsin.">
          <TextInput value={profile.key} onChange={(event) => onChange({ key: event.target.value })} />
        </Field>
      </div>

      <div className="mt-4 space-y-4">
        <Field label="Kısa açıklama" error={err("shortDescription")}>
          <TextArea
            value={profile.shortDescription}
            onChange={(event) => onChange({ shortDescription: event.target.value })}
          />
        </Field>
        <Field label="Detaylı açıklama" error={err("fullDescription")}>
          <TextArea
            className="min-h-[140px]"
            value={profile.fullDescription}
            onChange={(event) => onChange({ fullDescription: event.target.value })}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <TagInput
            label="Güçlü yönler"
            placeholder="Örn: Planlama"
            values={profile.strengths}
            error={err("strengths")}
            onChange={(strengths) => onChange({ strengths })}
          />
          <TagInput
            label="Zayıf yönler"
            placeholder="Örn: Mükemmeliyetçilik"
            values={profile.weaknesses}
            error={err("weaknesses")}
            onChange={(weaknesses) => onChange({ weaknesses })}
          />
        </div>

        <Field label="İlişkilerde davranış biçimi" error={err("relationshipStyle")}>
          <TextArea
            value={profile.relationshipStyle}
            onChange={(event) => onChange({ relationshipStyle: event.target.value })}
          />
        </Field>
        <Field label="Teste özel rol açıklaması" error={err("roleDescription")}>
          <TextArea
            value={profile.roleDescription}
            onChange={(event) => onChange({ roleDescription: event.target.value })}
          />
        </Field>
        <Field label="Paylaşım metni" error={err("shareText")}>
          <TextArea
            value={profile.shareText}
            onChange={(event) => onChange({ shareText: event.target.value })}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Görsel URL'si (opsiyonel)">
            <TextInput value={profile.image} onChange={(event) => onChange({ image: event.target.value })} />
          </Field>
          <Field label="Profil rengi">
            <Select value={profile.color} onChange={(event) => onChange({ color: event.target.value })}>
              {PROFILE_COLORS.map((color) => (
                <option key={color.value} value={color.value}>
                  {color.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>
    </div>
  );
}
