import { supabase } from "@/services/supabase";

export interface PublicHomepageFeaturedExperience {
  slot: number;
  experienceId: string;
  creatorId: string | null;
  title: string;
  description: string | null;
  type: string;
  coverStyle: string | null;
  coverLabel: string | null;
  coverImageUrl: string | null;
}

export type PublicAnnouncementDisplayMode =
  | "once"
  | "every_visit";

export interface PublicSiteAnnouncement {
  id: string;
  title: string;
  message: string;
  buttonText: string | null;
  buttonUrl: string | null;
  displayMode: PublicAnnouncementDisplayMode;
  startsAt: string;
  endsAt: string;
}

export async function getPublicHomepageFeaturedExperiences(): Promise<
  PublicHomepageFeaturedExperience[]
> {
  const { data, error } =
    await supabase.rpc(
      "public_get_homepage_featured_experiences",
    );

  if (error) {
    throw new Error(
      `Ana sayfa Experience'ları alınamadı: ${error.message}`,
    );
  }

  return (
    Array.isArray(data)
      ? data
      : []
  ).map((row: any) => ({
    slot: Number(row.slot),
    experienceId:
      row.experience_id,
    creatorId:
      row.creator_id ?? null,
    title:
      row.title,
    description:
      row.description ?? null,
    type:
      row.type,
    coverStyle:
      row.cover_style ?? null,
    coverLabel:
      row.cover_label ?? null,
    coverImageUrl:
      row.cover_image_url ?? null,
  }));
}

export async function getActiveSiteAnnouncement(): Promise<
  PublicSiteAnnouncement | null
> {
  const { data, error } =
    await supabase.rpc(
      "public_get_active_site_announcement",
    );

  if (error) {
    throw new Error(
      `Aktif duyuru alınamadı: ${error.message}`,
    );
  }

  const row =
    Array.isArray(data)
      ? data[0]
      : null;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    message: row.message,
    buttonText:
      row.button_text ?? null,
    buttonUrl:
      row.button_url ?? null,
    displayMode:
      row.display_mode,
    startsAt:
      row.starts_at,
    endsAt:
      row.ends_at,
  };
}