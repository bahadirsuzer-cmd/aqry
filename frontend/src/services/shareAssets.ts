import { supabase } from "./supabase";
import {
  createShareCardBlob,
  type ShareCardSource,
} from "./shareCards";

export interface ExperienceShareAssets {
  experienceId: string;
  squareUrl: string;
  storyUrl: string;
}

async function uploadShareAsset(
  creatorId: string,
  experienceId: string,
  suffix: "square" | "story",
  blob: Blob,
) {
  const path =
    `${creatorId}/share-${experienceId}-${suffix}.png`;

  const { error } =
    await supabase.storage
      .from("experience-media")
      .upload(
        path,
        blob,
        {
          contentType:
            "image/png",
          upsert: true,
          cacheControl:
            "3600",
        },
      );

  if (error) {
    throw new Error(
      `Paylaşım görseli yüklenemedi: ${error.message}`,
    );
  }

  const { data } =
    supabase.storage
      .from("experience-media")
      .getPublicUrl(path);

  return data.publicUrl;
}

export async function ensureExperienceShareAssets(
  creatorId: string,
  source: ShareCardSource,
): Promise<ExperienceShareAssets> {
  const squareBlob =
    await createShareCardBlob(
      source,
      "square",
    );

  const storyBlob =
    await createShareCardBlob(
      source,
      "story",
    );

  const [
    squareUrl,
    storyUrl,
  ] = await Promise.all([
    uploadShareAsset(
      creatorId,
      source.id,
      "square",
      squareBlob,
    ),
    uploadShareAsset(
      creatorId,
      source.id,
      "story",
      storyBlob,
    ),
  ]);

  const { error } =
    await supabase
      .from(
        "experience_share_assets",
      )
      .upsert(
        {
          experience_id:
            source.id,
          creator_id:
            creatorId,
          square_url:
            squareUrl,
          story_url:
            storyUrl,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "experience_id",
        },
      );

  if (error) {
    throw new Error(
      `Paylaşım kayıtları saklanamadı: ${error.message}`,
    );
  }

  return {
    experienceId:
      source.id,
    squareUrl,
    storyUrl,
  };
}

export function getPublicShareUrl(
  experienceId: string,
) {
  return `https://www.aqryo.com/share/${encodeURIComponent(
    experienceId,
  )}`;
}