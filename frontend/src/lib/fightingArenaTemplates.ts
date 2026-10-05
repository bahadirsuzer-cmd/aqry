import type { PuzzleSafeArea } from "./animeSingleTemplates";

function arenaTemplates(group: "single" | "couple" | "scene") {
  return Array.from({ length: 10 }, (_, index) =>
    `/puzzle/fighting-arena/${group}/arena-${group}-${String(index + 1).padStart(2, "0")}.webp`,
  );
}

export const ARENA_SINGLE_TEMPLATES = arenaTemplates("single");
export const ARENA_COUPLE_TEMPLATES = arenaTemplates("couple");
export const ARENA_SCENE_TEMPLATES = arenaTemplates("scene");
// Inset within each fixed translucent panel on the 360 × 450 share canvas.
export const ARENA_SINGLE_SAFE_AREA: PuzzleSafeArea = { x: 158, y: 56, width: 178, height: 334 };
export const ARENA_SCENE_SAFE_AREA: PuzzleSafeArea = { x: 32, y: 206, width: 296, height: 184 };
