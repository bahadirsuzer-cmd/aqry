import { supabase } from "@/services/supabase";

export type AnonymousInboxItem = {
  id: string;
  experienceId: string;
  experienceTitle: string;
  mode: "question" | "confession";
  message: string;
  createdAt: string;
};

const READ_KEY = "aqryo-anonymous-inbox-read";

function getReadIds() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
}

export function markAnonymousMessagesRead(ids: string[]) {
  if (typeof window === "undefined") return;
  const read = getReadIds();
  ids.forEach((id) => read.add(id));
  window.localStorage.setItem(READ_KEY, JSON.stringify(Array.from(read).slice(-600)));
  window.dispatchEvent(new CustomEvent("aqryo:inbox-read"));
}

export async function loadAnonymousInbox(creatorId: string): Promise<AnonymousInboxItem[]> {
  const { data: experiences, error: experienceError } = await supabase
    .from("experiences")
    .select("id,title")
    .eq("creator_id", creatorId)
    .eq("type", "question_confession");

  if (experienceError) throw new Error(experienceError.message);
  const rows = experiences ?? [];
  if (rows.length === 0) return [];

  const titleById = new Map(rows.map((row) => [row.id, row.title ?? "Soru mu İtiraf mı?"]));
  const { data: events, error: eventError } = await supabase
    .from("experience_events")
    .select("id,experience_id,event_type,metadata,created_at")
    .in("experience_id", rows.map((row) => row.id))
    .eq("event_type", "share")
    .order("created_at", { ascending: false });

  if (eventError) throw new Error(eventError.message);

  return (events ?? []).flatMap((event) => {
    const metadata =
      event.metadata && typeof event.metadata === "object"
        ? (event.metadata as Record<string, unknown>)
        : null;

    if (
      metadata?.kind !== "anonymous_message" ||
      typeof metadata.message !== "string" ||
      (metadata.mode !== "question" && metadata.mode !== "confession")
    ) {
      return [];
    }

    return [{
      id: event.id,
      experienceId: event.experience_id,
      experienceTitle: titleById.get(event.experience_id) ?? "Soru mu İtiraf mı?",
      mode: metadata.mode,
      message: metadata.message,
      createdAt: event.created_at,
    } satisfies AnonymousInboxItem];
  });
}

export function getUnreadAnonymousCount(items: AnonymousInboxItem[]) {
  const read = getReadIds();
  return items.filter((item) => !read.has(item.id)).length;
}

export function getUnreadAnonymousItems(items: AnonymousInboxItem[]) {
  const read = getReadIds();
  return items.filter((item) => !read.has(item.id));
}
