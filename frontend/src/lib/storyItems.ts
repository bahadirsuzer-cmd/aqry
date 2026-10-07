export type StoryTextItem = { id: string; type: "text"; text: string };
export type StoryImageItem = { id: string; type: "image"; imageUrl: string };
export type StoryItem = StoryTextItem | StoryImageItem;

export function imageTextPosition(items: StoryItem[], imageId: string): number {
  const index = items.findIndex(item => item.id === imageId);
  return items.slice(0, Math.max(0, index)).filter(item => item.type === "text" && item.text.trim()).length;
}

// Images keep their position relative to text pages when automatic pagination changes.
export function reflowStoryItems(items: StoryItem[], pages: string[]): StoryItem[] {
  const images = items.filter((item): item is StoryImageItem => item.type === "image");
  const result: StoryItem[] = [];
  for (let position = 0; position <= pages.length; position++) {
    result.push(...images.filter(image => Math.min(imageTextPosition(items, image.id), pages.length) === position));
    if (position < pages.length) result.push({ id: "story-page-" + position, type: "text", text: pages[position] });
  }
  return result;
}

export function placeStoryImage(items: StoryItem[], imageId: string, afterPage: number): StoryItem[] {
  const image = items.find(item => item.id === imageId && item.type === "image");
  if (!image) return items;
  const remaining = items.filter(item => item.id !== imageId);
  const textCount = remaining.filter(item => item.type === "text" && item.text.trim()).length;
  const target = Math.max(0, Math.min(Math.trunc(afterPage), textCount));
  let position = 0;
  const nextText = remaining.findIndex(item => {
    if (item.type !== "text" || !item.text.trim()) return false;
    if (position === target) return true;
    position++;
    return false;
  });
  remaining.splice(nextText < 0 ? remaining.length : nextText, 0, image);
  return remaining;
}
