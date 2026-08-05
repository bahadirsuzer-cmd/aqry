const TR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  I: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

/** Turkish-safe slug generator: lowercase, ascii, hyphen separated. */
export function slugify(input: string): string {
  const mapped = input
    .split("")
    .map((char) => TR_MAP[char] ?? char)
    .join("");

  return mapped
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Sanitises a creator username: lowercase letters, digits, underscore, hyphen. */
export function sanitizeUsername(input: string): string {
  const mapped = input
    .split("")
    .map((char) => TR_MAP[char] ?? char)
    .join("");
  return mapped
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "");
}

export const USERNAME_PATTERN = /^[a-z0-9_-]+$/;
