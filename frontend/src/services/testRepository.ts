import type { Test, TestStatus } from "@/types";
import { tests as builtInTests } from "@/data/testData";
import { getCreator, DEMO_CREATOR_ID } from "./creatorRepository";
import { slugify } from "@/utils/slugify";

const STORAGE_KEY = "aqry_creator_tests";

function readRaw(): Test[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Test[];
  } catch {
    return [];
  }
}

function writeRaw(list: Test[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — changes stay in memory for this session */
  }
}

/** Creator profile edits must be reflected on every test that creator owns. */
function hydrate(test: Test): Test {
  if (test.creatorId !== DEMO_CREATOR_ID) return test;
  return { ...test, creator: getCreator() };
}

const systemTests: Test[] = builtInTests.map((test) => ({ ...test, isSystem: true }));

export function isPublished(test: { status: TestStatus }): boolean {
  return test.status === "active" || test.status === "published";
}

export function getCreatorTests(creatorId: string = DEMO_CREATOR_ID): Test[] {
  return readRaw()
    .filter((test) => test.creatorId === creatorId)
    .map(hydrate)
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
}

export function getAllTests(): Test[] {
  return [...systemTests, ...readRaw().map(hydrate)];
}

export function getPublishedTests(): Test[] {
  return getAllTests().filter(isPublished);
}

export function getTestBySlug(slug: string): Test | undefined {
  return getAllTests().find((test) => test.slug === slug);
}

/** Only published tests are reachable from the public /test/:slug routes. */
export function getPublicTestBySlug(slug: string): Test | undefined {
  const test = getTestBySlug(slug);
  return test && isPublished(test) ? test : undefined;
}

export function getCreatorTestById(id: string): Test | undefined {
  const test = readRaw().find((item) => item.id === id);
  return test ? hydrate(test) : undefined;
}

export function isSlugAvailable(slug: string, ignoreTestId?: string): boolean {
  if (!slug) return false;
  return !getAllTests().some((test) => test.slug === slug && test.id !== ignoreTestId);
}

/** Returns a slug derived from `base` that does not collide with anything. */
export function uniqueSlug(base: string, ignoreTestId?: string): string {
  const root = slugify(base) || "test";
  if (isSlugAvailable(root, ignoreTestId)) return root;
  let index = 2;
  while (!isSlugAvailable(`${root}-${index}`, ignoreTestId)) index += 1;
  return `${root}-${index}`;
}

export function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${random}`;
}

export function createTest(input: Omit<Test, "id" | "createdAt" | "updatedAt">): Test {
  const now = new Date().toISOString();
  const test: Test = {
    ...input,
    id: createId("test"),
    creatorId: input.creatorId ?? DEMO_CREATOR_ID,
    createdAt: now,
    updatedAt: now,
    publishedAt: isPublished(input) ? now : undefined,
  };
  writeRaw([...readRaw(), test]);
  return test;
}

export function updateTest(id: string, patch: Partial<Test>): Test | undefined {
  const list = readRaw();
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return undefined;
  const next: Test = { ...list[index], ...patch, id, updatedAt: new Date().toISOString() };
  list[index] = next;
  writeRaw(list);
  return next;
}

export function deleteTest(id: string): void {
  writeRaw(readRaw().filter((test) => test.id !== id));
}

export function publishTest(id: string): Test | undefined {
  return updateTest(id, { status: "published", publishedAt: new Date().toISOString() });
}

export function unpublishTest(id: string): Test | undefined {
  return updateTest(id, { status: "draft" });
}

export function duplicateTest(id: string): Test | undefined {
  const source = getCreatorTestById(id);
  if (!source) return undefined;
  const now = new Date().toISOString();
  const copy: Test = {
    ...source,
    id: createId("test"),
    slug: uniqueSlug(`${source.slug}-kopya`),
    title: `${source.title} (kopya)`,
    status: "draft" as TestStatus,
    totalParticipants: 0,
    createdAt: now,
    updatedAt: now,
    publishedAt: undefined,
  };
  writeRaw([...readRaw(), copy]);
  return copy;
}
