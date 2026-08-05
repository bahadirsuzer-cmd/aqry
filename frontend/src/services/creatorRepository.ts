import type { Creator } from "@/types";
import { sanitizeUsername } from "@/utils/slugify";

const STORAGE_KEY = "aqry_creator_profile";

export const DEMO_CREATOR_ID = "creator-demo";

export const defaultCreator: Creator = {
  id: DEMO_CREATOR_ID,
  name: "Bahadır Süzer",
  username: "bahadirsuzer",
  avatar: "",
  verified: false,
  bio: "Etkileşimli testler ve viral içerikler üretiyorum.",
};

/** Elegant initials-based placeholder avatar (data URI, no network needed). */
export function initialsAvatar(name: string): string {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toLocaleUpperCase("tr-TR"))
      .join("") || "A";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#ec4899"/></linearGradient></defs><rect width="96" height="96" rx="48" fill="url(#g)"/><text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="system-ui,sans-serif" font-size="38" font-weight="700" fill="#ffffff">${initials}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function withAvatar(creator: Creator): Creator {
  return {
    ...creator,
    avatar: creator.avatar?.trim() ? creator.avatar : initialsAvatar(creator.name),
  };
}

export function getCreator(): Creator {
  if (typeof window === "undefined") return withAvatar(defaultCreator);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return withAvatar(defaultCreator);
    const parsed = JSON.parse(raw) as Partial<Creator>;
    return withAvatar({ ...defaultCreator, ...parsed, id: DEMO_CREATOR_ID });
  } catch {
    return withAvatar(defaultCreator);
  }
}

export interface CreatorProfileInput {
  name: string;
  username: string;
  bio: string;
  avatar: string;
}

export function saveCreator(input: CreatorProfileInput): Creator {
  const next: Creator = withAvatar({
    ...getCreator(),
    name: input.name.trim(),
    username: sanitizeUsername(input.username),
    bio: input.bio.trim(),
    avatar: input.avatar.trim(),
  });

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors — profile stays in memory for this session */
    }
  }
  return next;
}
