import type { Answer, Creator, Question, ResultProfile, Test, TestCategory, TestStatus } from "@/types";
import { createId, isSlugAvailable } from "./testRepository";
export { createId };
import { slugify } from "@/utils/slugify";

export const CATEGORIES: Array<{ value: TestCategory; label: string }> = [
  { value: "kisilik", label: "Kişilik" },
  { value: "iliskiler", label: "İlişkiler" },
  { value: "dizi-film", label: "Diziler ve Filmler" },
  { value: "arkadaslik", label: "Arkadaşlık" },
  { value: "eglence", label: "Eğlence" },
  { value: "bilgi", label: "Bilgi" },
  { value: "bulmaca", label: "Bulmaca" },
];

export const PROFILE_COLORS: Array<{ value: string; label: string; css: string }> = [
  { value: "violet", label: "Mor", css: "linear-gradient(135deg,#7c3aed,#a855f7)" },
  { value: "pink", label: "Pembe", css: "linear-gradient(135deg,#db2777,#f472b6)" },
  { value: "sunset", label: "Gün batımı", css: "linear-gradient(135deg,#f97316,#ec4899)" },
  { value: "ocean", label: "Okyanus", css: "linear-gradient(135deg,#0ea5e9,#6366f1)" },
  { value: "forest", label: "Orman", css: "linear-gradient(135deg,#059669,#22c55e)" },
  { value: "night", label: "Gece", css: "linear-gradient(135deg,#1e293b,#6d28d9)" },
];

export function colorCss(value: string | undefined): string {
  return PROFILE_COLORS.find((item) => item.value === value)?.css ?? PROFILE_COLORS[0].css;
}

export const MIN_PROFILES = 2;
export const MAX_PROFILES = 6;
export const MIN_QUESTIONS = 3;
export const MAX_QUESTIONS = 30;
export const MIN_ANSWERS = 2;
export const MAX_ANSWERS = 6;
export const MAX_SCORE = 5;

export interface DraftAnswer {
  id: string;
  text: string;
  image: string;
  scores: Record<string, number>;
}

export interface DraftQuestion {
  id: string;
  text: string;
  image: string;
  answers: DraftAnswer[];
}

export interface DraftProfile {
  id: string;
  key: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  strengths: string[];
  weaknesses: string[];
  relationshipStyle: string;
  roleDescription: string;
  image: string;
  shareText: string;
  color: string;
}

export interface TestDraft {
  id: string | null;
  title: string;
  subtitle: string;
  description: string;
  category: TestCategory;
  coverImage: string;
  useGradientCover: boolean;
  estimatedDuration: string;
  price: number;
  currency: string;
  slug: string;
  slugTouched: boolean;
  ctaText: string;
  status: TestStatus;
  profiles: DraftProfile[];
  questions: DraftQuestion[];
}

export const DEFAULT_CTA = "Sonucunu öğren";

export function emptyProfile(): DraftProfile {
  return {
    id: createId("profile"),
    key: "",
    name: "",
    shortDescription: "",
    fullDescription: "",
    strengths: [],
    weaknesses: [],
    relationshipStyle: "",
    roleDescription: "",
    image: "",
    shareText: "",
    color: PROFILE_COLORS[0].value,
  };
}

export function emptyAnswer(profileKeys: string[]): DraftAnswer {
  const scores: Record<string, number> = {};
  for (const key of profileKeys) scores[key] = 0;
  return { id: createId("answer"), text: "", image: "", scores };
}

export function emptyQuestion(profileKeys: string[]): DraftQuestion {
  return {
    id: createId("question"),
    text: "",
    image: "",
    answers: [emptyAnswer(profileKeys), emptyAnswer(profileKeys)],
  };
}

export function emptyDraft(): TestDraft {
  return {
    id: null,
    title: "",
    subtitle: "",
    description: "",
    category: "kisilik",
    coverImage: "",
    useGradientCover: true,
    estimatedDuration: "2 dakika",
    price: 9.9,
    currency: "TL",
    slug: "",
    slugTouched: false,
    ctaText: DEFAULT_CTA,
    status: "draft",
    profiles: [{ ...emptyProfile() }, { ...emptyProfile() }],
    questions: [],
  };
}

export function draftFromTest(test: Test): TestDraft {
  const profiles: DraftProfile[] = test.resultProfiles.map((profile) => ({
    id: profile.id,
    key: profile.key,
    name: profile.name,
    shortDescription: profile.shortDescription,
    fullDescription: profile.fullDescription,
    strengths: [...profile.strengths],
    weaknesses: [...profile.weaknesses],
    relationshipStyle: profile.relationshipStyle,
    roleDescription: profile.roleDescription,
    image: profile.image ?? "",
    shareText: profile.shareText,
    color: profile.color ?? PROFILE_COLORS[0].value,
  }));

  const questions: DraftQuestion[] = [...test.questions]
    .sort((a, b) => a.order - b.order)
    .map((question) => ({
      id: question.id,
      text: question.text,
      image: question.image ?? "",
      answers: question.answers.map((answer) => ({
        id: answer.id,
        text: answer.text,
        image: answer.image ?? "",
        scores: { ...answer.scores },
      })),
    }));

  return {
    id: test.id,
    title: test.title,
    subtitle: test.subtitle,
    description: test.description,
    category: test.category ?? "kisilik",
    coverImage: test.coverImage ?? "",
    useGradientCover: !test.coverImage,
    estimatedDuration: test.estimatedDuration,
    price: test.price,
    currency: test.currency,
    slug: test.slug,
    slugTouched: true,
    ctaText: test.ctaText ?? DEFAULT_CTA,
    status: test.status,
    profiles,
    questions,
  };
}

/** Profile key derived from the name, guaranteed unique within the draft. */
export function profileKeyFor(name: string, existing: string[], fallbackIndex: number): string {
  const base = slugify(name).replace(/-/g, "_") || `profil_${fallbackIndex + 1}`;
  if (!existing.includes(base)) return base;
  let index = 2;
  while (existing.includes(`${base}_${index}`)) index += 1;
  return `${base}_${index}`;
}

export function draftToTest(draft: TestDraft, creator: Creator, status: TestStatus): Test {
  const resultProfiles: ResultProfile[] = draft.profiles.map((profile) => ({
    id: profile.id,
    key: profile.key,
    name: profile.name.trim(),
    shortDescription: profile.shortDescription.trim(),
    fullDescription: profile.fullDescription.trim(),
    strengths: profile.strengths,
    weaknesses: profile.weaknesses,
    relationshipStyle: profile.relationshipStyle.trim(),
    roleDescription: profile.roleDescription.trim(),
    image: profile.image.trim() || undefined,
    shareText: profile.shareText.trim(),
    color: profile.color,
  }));

  const keys = resultProfiles.map((profile) => profile.key);

  const questions: Question[] = draft.questions.map((question, index) => {
    const answers: Answer[] = question.answers.map((answer) => {
      const scores: Record<string, number> = {};
      for (const key of keys) scores[key] = answer.scores[key] ?? 0;
      return {
        id: answer.id,
        text: answer.text.trim(),
        image: answer.image.trim() || undefined,
        scores,
      };
    });
    return {
      id: question.id,
      order: index + 1,
      text: question.text.trim(),
      image: question.image.trim() || undefined,
      answers,
    };
  });

  return {
    id: draft.id ?? "",
    slug: draft.slug,
    title: draft.title.trim(),
    subtitle: draft.subtitle.trim(),
    description: draft.description.trim(),
    coverImage: draft.useGradientCover ? undefined : draft.coverImage.trim() || undefined,
    creator,
    creatorId: creator.id,
    estimatedDuration: draft.estimatedDuration.trim() || "2 dakika",
    totalParticipants: 0,
    price: draft.price,
    currency: draft.currency,
    questions,
    resultProfiles,
    status,
    category: draft.category,
    ctaText: draft.ctaText.trim() || DEFAULT_CTA,
  };
}

export interface ValidationIssue {
  step: 1 | 2 | 3 | 4;
  field: string;
  message: string;
}

export function validateDraft(draft: TestDraft): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!draft.title.trim()) {
    issues.push({ step: 1, field: "title", message: "Test başlığı zorunlu." });
  }
  if (!draft.slug.trim()) {
    issues.push({ step: 1, field: "slug", message: "Slug zorunlu." });
  } else if (!isSlugAvailable(draft.slug, draft.id ?? undefined)) {
    issues.push({ step: 1, field: "slug", message: "Bu slug başka bir testte kullanılıyor." });
  }
  if (draft.price < 0 || Number.isNaN(draft.price)) {
    issues.push({ step: 1, field: "price", message: "Fiyat sıfır veya daha büyük olmalı." });
  }
  if (!draft.useGradientCover && !draft.coverImage.trim()) {
    issues.push({
      step: 1,
      field: "coverImage",
      message: "Kapak görseli URL'si gir veya gradient placeholder seç.",
    });
  }

  if (draft.profiles.length < MIN_PROFILES) {
    issues.push({ step: 2, field: "profiles", message: "En az 2 sonuç profili gerekli." });
  }
  if (draft.profiles.length > MAX_PROFILES) {
    issues.push({ step: 2, field: "profiles", message: "En fazla 6 sonuç profili olabilir." });
  }

  const seenKeys = new Set<string>();
  draft.profiles.forEach((profile, index) => {
    const label = profile.name.trim() || `${index + 1}. profil`;
    if (!profile.name.trim()) {
      issues.push({ step: 2, field: `profile.${profile.id}.name`, message: `${index + 1}. profilin adı zorunlu.` });
    }
    if (!profile.key.trim()) {
      issues.push({ step: 2, field: `profile.${profile.id}.key`, message: `${label}: sistem anahtarı zorunlu.` });
    } else if (seenKeys.has(profile.key)) {
      issues.push({
        step: 2,
        field: `profile.${profile.id}.key`,
        message: `${label}: "${profile.key}" anahtarı birden fazla profilde kullanılıyor.`,
      });
    }
    seenKeys.add(profile.key);

    if (!profile.shortDescription.trim()) {
      issues.push({ step: 2, field: `profile.${profile.id}.shortDescription`, message: `${label}: kısa açıklama zorunlu.` });
    }
    if (!profile.fullDescription.trim()) {
      issues.push({ step: 2, field: `profile.${profile.id}.fullDescription`, message: `${label}: detaylı açıklama zorunlu.` });
    }
    if (!profile.relationshipStyle.trim()) {
      issues.push({ step: 2, field: `profile.${profile.id}.relationshipStyle`, message: `${label}: ilişkilerde davranış biçimi zorunlu.` });
    }
    if (!profile.roleDescription.trim()) {
      issues.push({ step: 2, field: `profile.${profile.id}.roleDescription`, message: `${label}: teste özel rol açıklaması zorunlu.` });
    }
    if (!profile.shareText.trim()) {
      issues.push({ step: 2, field: `profile.${profile.id}.shareText`, message: `${label}: paylaşım metni zorunlu.` });
    }
    if (profile.strengths.length === 0) {
      issues.push({ step: 2, field: `profile.${profile.id}.strengths`, message: `${label}: en az bir güçlü yön ekle.` });
    }
    if (profile.weaknesses.length === 0) {
      issues.push({ step: 2, field: `profile.${profile.id}.weaknesses`, message: `${label}: en az bir zayıf yön ekle.` });
    }
  });

  if (draft.questions.length < MIN_QUESTIONS) {
    issues.push({ step: 3, field: "questions", message: "En az 3 soru gerekli." });
  }
  if (draft.questions.length > MAX_QUESTIONS) {
    issues.push({ step: 3, field: "questions", message: "En fazla 30 soru olabilir." });
  }

  const keys = draft.profiles.map((profile) => profile.key);

  draft.questions.forEach((question, qIndex) => {
    if (!question.text.trim()) {
      issues.push({ step: 3, field: `question.${question.id}.text`, message: `${qIndex + 1}. sorunun metni zorunlu.` });
    }
    if (question.answers.length < MIN_ANSWERS) {
      issues.push({ step: 3, field: `question.${question.id}.answers`, message: `${qIndex + 1}. soruda en az 2 cevap olmalı.` });
    }
    if (question.answers.length > MAX_ANSWERS) {
      issues.push({ step: 3, field: `question.${question.id}.answers`, message: `${qIndex + 1}. soruda en fazla 6 cevap olabilir.` });
    }
    question.answers.forEach((answer, aIndex) => {
      const label = `${qIndex + 1}. soru / ${aIndex + 1}. cevap`;
      if (!answer.text.trim()) {
        issues.push({ step: 3, field: `answer.${answer.id}.text`, message: `${label}: cevap metni zorunlu.` });
      }
      const values = keys.map((key) => answer.scores[key] ?? 0);
      if (!values.some((value) => value > 0)) {
        issues.push({
          step: 3,
          field: `answer.${answer.id}.scores`,
          message: `${label}: en az bir profile sıfırdan büyük puan ver.`,
        });
      }
      if (values.some((value) => !Number.isInteger(value) || value < 0 || value > MAX_SCORE)) {
        issues.push({
          step: 3,
          field: `answer.${answer.id}.scores`,
          message: `${label}: puanlar 0–5 arası tam sayı olmalı.`,
        });
      }
    });
  });

  return issues;
}

/* ---------- temporary wizard autosave ---------- */

const WIZARD_PREFIX = "aqry_creator_wizard:";

function wizardKey(id: string | null): string {
  return `${WIZARD_PREFIX}${id ?? "new"}`;
}

export function saveWizardDraft(id: string | null, draft: TestDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(wizardKey(id), JSON.stringify(draft));
  } catch {
    /* ignore quota errors */
  }
}

export function loadWizardDraft(id: string | null): TestDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(wizardKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as TestDraft;
  } catch {
    return null;
  }
}

export function clearWizardDraft(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(wizardKey(id));
  } catch {
    /* noop */
  }
}
