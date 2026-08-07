import { getCurrentCreator } from "@/services/auth";
import { supabase } from "@/services/supabase";

export type CreatorAvatarStyle =
  | "classic"
  | "soft"
  | "glow"
  | "outline"
  | "aqryo"
  | "card";

export type CreatorAvatarBackground =
  | "violet"
  | "pink"
  | "blue"
  | "mint"
  | "orange"
  | "dark";

export interface CreatorAvatarSettings {
  avatarUrl: string;
  avatarStyle: CreatorAvatarStyle;
  avatarBg: CreatorAvatarBackground;
  avatarZoom: number;
  avatarX: number;
  avatarY: number;
  avatarFrame: boolean;
}

const CREATOR_AVATAR_BUCKET = "creator-avatars";
const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png"] as const;

export const defaultCreatorAvatarSettings: CreatorAvatarSettings = {
  avatarUrl: "",
  avatarStyle: "classic",
  avatarBg: "violet",
  avatarZoom: 1,
  avatarX: 50,
  avatarY: 50,
  avatarFrame: true,
};

function getAvatarExtension(mimeType: string) {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";

  throw new Error("Yalnızca JPG veya PNG yükleyebilirsin.");
}

function validateAvatarFile(file: File) {
  if (
    !ALLOWED_AVATAR_TYPES.includes(
      file.type as "image/jpeg" | "image/png",
    )
  ) {
    throw new Error("Yalnızca JPG veya PNG yükleyebilirsin.");
  }

  if (file.size > MAX_AVATAR_FILE_SIZE) {
    throw new Error("Avatar dosyası en fazla 5 MB olabilir.");
  }

  if (file.size <= 0) {
    throw new Error("Avatar dosyası boş görünüyor.");
  }
}

export async function uploadCreatorAvatar(file: File) {
  validateAvatarFile(file);

  const creator = await getCurrentCreator();

  if (!creator) {
    throw new Error("Avatar yüklemek için giriş yapmalısın.");
  }

  const extension = getAvatarExtension(file.type);
  const path = `${creator.id}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(CREATOR_AVATAR_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from(CREATOR_AVATAR_BUCKET)
    .getPublicUrl(path);

  const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

  return {
    path,
    publicUrl,
  };
}

export async function getCurrentCreatorAvatarSettings(): Promise<CreatorAvatarSettings> {
  const creator = await getCurrentCreator();

  if (!creator) {
    throw new Error("Hesap bulunamadı.");
  }

  const { data, error } = await supabase
    .from("creator_profiles")
    .select(`
      avatar_url,
      avatar_style,
      avatar_bg,
      avatar_zoom,
      avatar_x,
      avatar_y,
      avatar_frame
    `)
    .eq("id", creator.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    avatarUrl: data?.avatar_url ?? "",
    avatarStyle: (data?.avatar_style ?? "classic") as CreatorAvatarStyle,
    avatarBg: (data?.avatar_bg ?? "violet") as CreatorAvatarBackground,
    avatarZoom: Number(data?.avatar_zoom ?? 1),
    avatarX: Number(data?.avatar_x ?? 50),
    avatarY: Number(data?.avatar_y ?? 50),
    avatarFrame: data?.avatar_frame ?? true,
  };
}

export async function saveCurrentCreatorAvatarSettings(
  settings: CreatorAvatarSettings,
) {
  const creator = await getCurrentCreator();

  if (!creator) {
    throw new Error("Hesap bulunamadı.");
  }

  const { error } = await supabase
    .from("creator_profiles")
    .update({
      avatar_url: settings.avatarUrl || null,
      avatar_style: settings.avatarStyle,
      avatar_bg: settings.avatarBg,
      avatar_zoom: settings.avatarZoom,
      avatar_x: settings.avatarX,
      avatar_y: settings.avatarY,
      avatar_frame: settings.avatarFrame,
      updated_at: new Date().toISOString(),
    })
    .eq("id", creator.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeCreatorAvatar() {
  const creator = await getCurrentCreator();

  if (!creator) {
    throw new Error("Hesap bulunamadı.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("creator_profiles")
    .select("avatar_url")
    .eq("id", creator.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const currentUrl = profile?.avatar_url ?? "";
  const isBundledAvatar = currentUrl.startsWith("/avatars/");

  if (currentUrl && !isBundledAvatar) {
    await supabase.storage
      .from(CREATOR_AVATAR_BUCKET)
      .remove([
        `${creator.id}/avatar.jpg`,
        `${creator.id}/avatar.png`,
      ]);
  }

  const { error } = await supabase
    .from("creator_profiles")
    .update({
      avatar_url: null,
      avatar_style: "classic",
      avatar_bg: "violet",
      avatar_zoom: 1,
      avatar_x: 50,
      avatar_y: 50,
      avatar_frame: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", creator.id);

  if (error) {
    throw new Error(error.message);
  }
}