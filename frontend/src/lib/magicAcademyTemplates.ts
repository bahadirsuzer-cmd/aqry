import type { PuzzleSafeArea } from "./animeSingleTemplates";

function magicTemplates(group: "single" | "couple" | "scene") {
  return Array.from({ length: 10 }, (_, index) =>
    `/puzzle/magic-academy/${group}/magic-${group}-${String(index + 1).padStart(2, "0")}.webp`,
  );
}

export const MAGIC_SINGLE_TEMPLATES = magicTemplates("single");
export const MAGIC_COUPLE_TEMPLATES = magicTemplates("couple");
export const MAGIC_SCENE_TEMPLATES = magicTemplates("scene");
// Inset within each fixed translucent panel on the 360 × 450 share canvas.
export const MAGIC_SINGLE_SAFE_AREA: PuzzleSafeArea = { x: 158, y: 56, width: 178, height: 334 };
export const MAGIC_SCENE_SAFE_AREA: PuzzleSafeArea = { x: 32, y: 206, width: 296, height: 184 };
