import { applySeoMetadata } from "@/utils/seo";

interface ExperienceSeoInput {
  experienceId: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  isPublic: boolean;
}

export function applyExperienceSeo(
  input: ExperienceSeoInput,
) {
  const description =
    input.description?.trim() ||
    "AQRYO üzerinde interaktif bir Experience.";

  applySeoMetadata({
    title: input.title,
    description,
    canonicalPath:
      `/experience/${input.experienceId}`,
    imageUrl:
      input.coverImageUrl ??
      null,
    noIndex:
      !input.isPublic,
  });
}