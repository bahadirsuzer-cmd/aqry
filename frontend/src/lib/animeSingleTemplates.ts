import type { ViralKind } from "./viralPuzzleBank";

export type VisualPack = "classic" | "anime";
export type PuzzleSafeArea = { x: number; y: number; width: number; height: number };

export function supportsAnimeSingle(kind: ViralKind) {
  return kind === "pattern" || kind === "algebra" || kind === "geometry" || kind === "count";
}

// Coordinates use the same 360 × 450 canvas as the preview and PNG export.
// Insets keep the puzzle clear of the frames and each scene's perspective.
export const ANIME_SINGLE_TEMPLATES: ReadonlyArray<{ src: string; safeArea: PuzzleSafeArea }> = [
  { src: "/puzzle/anime/single/anime-single-01.png", safeArea: { x: 155, y: 55, width: 190, height: 310 } },
  { src: "/puzzle/anime/single/anime-single-02.png", safeArea: { x: 145, y: 82, width: 198, height: 235 } },
  { src: "/puzzle/anime/single/anime-single-03.png", safeArea: { x: 126, y: 76, width: 221, height: 275 } },
  { src: "/puzzle/anime/single/anime-single-04.png", safeArea: { x: 145, y: 65, width: 190, height: 240 } },
  { src: "/puzzle/anime/single/anime-single-05.png", safeArea: { x: 165, y: 47, width: 173, height: 270 } },
  { src: "/puzzle/anime/single/anime-single-06.png", safeArea: { x: 171, y: 75, width: 158, height: 269 } },
  { src: "/puzzle/anime/single/anime-single-07.png", safeArea: { x: 150, y: 75, width: 187, height: 226 } },
  { src: "/puzzle/anime/single/anime-single-08.png", safeArea: { x: 145, y: 98, width: 195, height: 210 } },
  { src: "/puzzle/anime/single/anime-single-09.png", safeArea: { x: 133, y: 46, width: 183, height: 235 } },
  { src: "/puzzle/anime/single/anime-single-10.png", safeArea: { x: 153, y: 92, width: 184, height: 220 } },
];
