import type { PaidVisualPack } from "@/services/visual-packs";

// Public 320 x 400 previews; full-size paid assets stay private.
export const VISUAL_PACK_PREVIEWS: Record<PaidVisualPack, ReadonlyArray<{ group: string; src: string }>> = {
  "anime": [
    {
      "group": "Scene",
      "src": "https://hburwzezggdgxuissjej.supabase.co/storage/v1/object/public/visual-pack-previews/anime/preview-1.webp"
    },
    {
      "group": "Single",
      "src": "https://hburwzezggdgxuissjej.supabase.co/storage/v1/object/public/visual-pack-previews/anime/preview-2.webp"
    },
    {
      "group": "Couple",
      "src": "https://hburwzezggdgxuissjej.supabase.co/storage/v1/object/public/visual-pack-previews/anime/preview-3.webp"
    },
    {
      "group": "Single",
      "src": "https://hburwzezggdgxuissjej.supabase.co/storage/v1/object/public/visual-pack-previews/anime/preview-4.webp"
    },
    {
      "group": "Scene",
      "src": "https://hburwzezggdgxuissjej.supabase.co/storage/v1/object/public/visual-pack-previews/anime/preview-5.webp"
    }
  ],
  "magic": [
    {
      "group": "Scene",
      "src": "https://hburwzezggdgxuissjej.supabase.co/storage/v1/object/public/visual-pack-previews/magic/preview-1.webp"
    },
    {
      "group": "Single",
      "src": "https://hburwzezggdgxuissjej.supabase.co/storage/v1/object/public/visual-pack-previews/magic/preview-2.webp"
    },
    {
      "group": "Couple",
      "src": "https://hburwzezggdgxuissjej.supabase.co/storage/v1/object/public/visual-pack-previews/magic/preview-3.webp"
    },
    {
      "group": "Single",
      "src": "https://hburwzezggdgxuissjej.supabase.co/storage/v1/object/public/visual-pack-previews/magic/preview-4.webp"
    },
    {
      "group": "Scene",
      "src": "https://hburwzezggdgxuissjej.supabase.co/storage/v1/object/public/visual-pack-previews/magic/preview-5.webp"
    }
  ],
  "arena": [
    {
      "group": "Scene",
      "src": "https://hburwzezggdgxuissjej.supabase.co/storage/v1/object/public/visual-pack-previews/arena/preview-1.webp"
    },
    {
      "group": "Single",
      "src": "https://hburwzezggdgxuissjej.supabase.co/storage/v1/object/public/visual-pack-previews/arena/preview-2.webp"
    },
    {
      "group": "Couple",
      "src": "https://hburwzezggdgxuissjej.supabase.co/storage/v1/object/public/visual-pack-previews/arena/preview-3.webp"
    },
    {
      "group": "Single",
      "src": "https://hburwzezggdgxuissjej.supabase.co/storage/v1/object/public/visual-pack-previews/arena/preview-4.webp"
    },
    {
      "group": "Scene",
      "src": "https://hburwzezggdgxuissjej.supabase.co/storage/v1/object/public/visual-pack-previews/arena/preview-5.webp"
    }
  ]
};
