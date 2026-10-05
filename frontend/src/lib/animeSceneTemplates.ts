import type { PuzzleSafeArea } from "./animeSingleTemplates";

export const ANIME_SCENE_TEMPLATES = Array.from(
  { length: 10 },
  (_, index) => `/puzzle/anime/scene/anime-scene-${String(index + 1).padStart(2, "0")}.png`,
);

// Inset within the fixed translucent panel on the 360 × 450 share canvas.
export const ANIME_SCENE_SAFE_AREA: PuzzleSafeArea = {
  x: 32,
  y: 206,
  width: 296,
  height: 184,
};
