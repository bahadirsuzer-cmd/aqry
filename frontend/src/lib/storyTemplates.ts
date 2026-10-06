import type { CSSProperties } from "react";

export const STORY_TEMPLATES = [
  { id: "paper", name: "Kâğıt", en: "Paper", background: "#f2e6d2", ink: "#392c22", accent: "#a44b30", font: "Georgia, serif", pattern: "linen" },
  { id: "night", name: "Gece", en: "Midnight", background: "#172134", ink: "#f6f0e6", accent: "#b6cced", font: "Georgia, serif", pattern: "stars" },
  { id: "rose", name: "Gül", en: "Rose", background: "#f6e0e3", ink: "#502b38", accent: "#ac536e", font: "Georgia, serif", pattern: "linen" },
  { id: "sage", name: "Adaçayı", en: "Sage", background: "#e0e8d9", ink: "#263c32", accent: "#5c7861", font: "Arial, sans-serif", pattern: "lines" },
  { id: "editorial", name: "Editoryal", en: "Editorial", background: "#eee8dc", ink: "#242626", accent: "#a54330", font: "Arial, sans-serif", pattern: "grid" },
  { id: "violet", name: "Lila", en: "Violet", background: "#e9e0f5", ink: "#3b2854", accent: "#8058ac", font: "Georgia, serif", pattern: "stars" },
] as const;
export type StoryTemplateId = typeof STORY_TEMPLATES[number]["id"];
export function getStoryTemplate(id?: string) {
  return STORY_TEMPLATES.find((template) => template.id === id) ?? STORY_TEMPLATES[0];
}
export function storyTemplateStyle(id?: string): CSSProperties {
  const t = getStoryTemplate(id);
  const pattern = t.pattern === "lines"
    ? `repeating-linear-gradient(0deg, transparent 0 27px, ${t.accent}18 28px 29px)`
    : t.pattern === "grid"
      ? `linear-gradient(${t.accent}12 1px,transparent 1px),linear-gradient(90deg,${t.accent}12 1px,transparent 1px)`
      : t.pattern === "stars"
        ? `radial-gradient(${t.accent}38 1px,transparent 1px),radial-gradient(ellipse at top right,${t.accent}22,transparent 65%)`
        : `repeating-linear-gradient(0deg,${t.accent}08 0 1px,transparent 1px 4px),repeating-linear-gradient(90deg,${t.accent}08 0 1px,transparent 1px 5px)`;
  return { backgroundColor: t.background, color: t.ink, fontFamily: t.font, backgroundImage: pattern, backgroundSize: t.pattern === "grid" ? "24px 24px" : t.pattern === "stars" ? "19px 19px, 100% 100%" : undefined };
}

// Keep every word, split at whitespace, and preserve paragraph breaks inside a page.
export function splitStoryText(raw: string, maxChars = 400): string[] {
  if (!Number.isInteger(maxChars) || maxChars < 1) throw new Error("Invalid page size");
  const text = raw.replace(/\r\n?/g, "\n").trim();
  if (!text) return [];
  const pages: string[] = [];
  let page = "";
  for (const token of text.match(/\S+|\s+/gu) ?? []) {
    const candidate = page + token;
    if (page.trim() && (Array.from(candidate).length > maxChars || candidate.split("\n").length > 10)) {
      pages.push(page.trim());
      page = "";
    }
    // An unbroken URL or word stays intact; CSS wraps it without changing its text.
    page += page ? token : token.trimStart();
  }
  if (page.trim()) pages.push(page.trim());
  return pages;
}
export function suggestStoryTitle(raw: string): string {
  const first = raw.trim().split(/\n|(?<=[.!?])\s/)[0]?.trim() ?? "";
  const chars = Array.from(first);
  if (chars.length <= 90) return first;
  const shortened = chars.slice(0, 86).join("");
  const space = shortened.lastIndexOf(" ");
  return (space > 45 ? shortened.slice(0, space) : shortened) + "…";
}

export async function createStoryCoverFile(templateId: string, title: string): Promise<File> {
  const t = getStoryTemplate(templateId);
  const canvas = document.createElement("canvas");
  canvas.width = 1200; canvas.height = 1500;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kapak oluşturulamadı.");
  ctx.fillStyle = t.background; ctx.fillRect(0, 0, 1200, 1500);
  ctx.strokeStyle = t.accent; ctx.fillStyle = t.accent; ctx.globalAlpha = .09;
  if (t.pattern === "stars") {
    for (let y = 0; y < 1500; y += 60) for (let x = 0; x < 1200; x += 60) { ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); }
  } else {
    const step = t.pattern === "linen" ? 9 : 70;
    for (let y = 0; y < 1500; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1200, y); ctx.stroke(); }
    if (t.pattern !== "lines") for (let x = 0; x < 1200; x += t.pattern === "grid" ? 70 : 11) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1500); ctx.stroke(); }
  }
  ctx.globalAlpha = 1; ctx.strokeStyle = t.accent; ctx.lineWidth = 3; ctx.strokeRect(70, 70, 1060, 1360);
  ctx.fillStyle = t.accent; ctx.font = "bold 32px Arial"; ctx.fillText("AQRYO / STORY", 130, 180);
  ctx.fillStyle = t.ink; ctx.font = `bold 76px ${t.font}`;
  const lines: string[] = []; let line = "";
  for (const word of title.split(/\s+/)) {
    if (ctx.measureText(line + " " + word).width > 930 && line) { lines.push(line); line = ""; }
    line = line ? line + " " + word : word;
  }
  if (line) lines.push(line);
  lines.forEach((text, i) => ctx.fillText(text, 130, 500 + i * 100, 930));
  ctx.fillStyle = t.accent; ctx.font = "bold 38px Arial"; ctx.fillText("AQRYO.", 130, 1330);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Kapak oluşturulamadı.")), "image/png"));
  return new File([blob], "aqryo-story-cover.png", { type: "image/png" });
}
