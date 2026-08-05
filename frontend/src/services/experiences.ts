import type {
  ExperienceBlueprint,
} from "@/types/experienceBlueprint";
import { supabase } from "./supabase";

interface PublishedExperienceInput {
  id: string;
  creatorId: string;
  type: string;
  status: string;
  publishedAt: string;
  title: string;
  description: string;

  cover: {
    style: string;
    label: string;
    imageUrl: string;
  };

  questions: unknown[];

  /*
   * New canonical AI/runtime model.
   * When present, the full Blueprint is persisted unchanged.
   */
  blueprint?: ExperienceBlueprint;

  /*
   * Legacy fields are intentionally kept for backward compatibility
   * while old published Experiences still exist.
   */
  creatorAnswers?: Record<
    string | number,
    number
  >;

  testMode?:
    | "score"
    | "profile"
    | "spectrum"
    | "archetype";

  profileAssignments?: Record<
    string | number,
    Record<
      string | number,
      string
    >
  >;

  resultModel?: {
    mode?: string;
    [key: string]: unknown;
  };

  results: unknown[];
  offer: unknown;

  guess?: {
    prompt: string;
    acceptedAnswers: string[];
    successTitle: string;
    successDescription: string;
    retryEnabled: boolean;
  };

  story?: {
    items: Array<
      | {
          id: string;
          type: "text";
          text: string;
        }
      | {
          id: string;
          type: "image";
          imageUrl: string;
        }
    >;
    resultTitle: string;
    resultDescription: string;
  };
}

export async function savePublishedExperience(
  experience: PublishedExperienceInput,
) {
  const blueprint =
    experience.blueprint ?? null;

  const { error } = await supabase
    .from("experiences")
    .upsert(
      {
        id: experience.id,
        creator_id:
          experience.creatorId,
        type: experience.type,
        status: experience.status,
        title: experience.title,
        description:
          experience.description,

        cover_style:
          experience.cover.style,
        cover_label:
          experience.cover.label,
        cover_image_url:
          experience.cover.imageUrl ||
          null,

        content: {
          questions:
            experience.questions,

          /*
           * Canonical source for new AI-generated / semantic Experiences.
           * Runtime and editing flows should prefer this Blueprint whenever
           * it exists.
           */
          blueprint,

          /*
           * Legacy persistence remains temporarily so existing score/profile
           * Experiences keep working during migration.
           */
          creatorAnswers:
            experience.creatorAnswers ??
            {},

          testMode:
            experience.testMode ??
            null,

          profileAssignments:
            experience.profileAssignments ??
            {},

          guess:
            experience.guess ?? null,

          story:
            experience.story ?? null,
        },

        result_config: {
          results:
            experience.results,

          resultModel:
            experience.resultModel ??
            blueprint?.resultModel ??
            null,
        },

        offer_config:
          experience.offer ??
          blueprint?.offer ??
          null,

        published_at:
          experience.publishedAt,

        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    );

  if (error) {
    throw new Error(
      `Experience kaydedilemedi: ${error.message}`,
    );
  }
}