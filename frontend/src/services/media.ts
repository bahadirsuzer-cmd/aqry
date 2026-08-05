import { supabase } from "@/services/supabase";

const EXPERIENCE_MEDIA_BUCKET =
  "experience-media";

export async function uploadExperienceImage(
  creatorId: string,
  file: File,
) {
  const mimeToExtension: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
  };

  const safeExtension =
    mimeToExtension[file.type];

  if (!safeExtension) {
    throw new Error(
      "Yalnızca JPG ve PNG görseller yüklenebilir.",
    );
  }

  const path =
    `${creatorId}/${crypto.randomUUID()}.${safeExtension}`;

  const { error } =
    await supabase.storage
      .from(
        EXPERIENCE_MEDIA_BUCKET,
      )
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

  if (error) {
    throw new Error(
      error.message,
    );
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(
      EXPERIENCE_MEDIA_BUCKET,
    )
    .getPublicUrl(path);

  return {
    path,
    publicUrl:
      publicUrlData.publicUrl,
  };
}