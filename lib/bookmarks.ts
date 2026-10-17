import type { NewsItem } from "@/types/news";
import { topics } from "@/types/news";
export const BOOKMARK_KEY = "lightpost-bookmarks-v1";
const EMPTY: NewsItem[] = [];
let cachedRaw: string | null | undefined;
let cachedItems: NewsItem[] = EMPTY;
export function readBookmarks(): NewsItem[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    if (raw === cachedRaw) return cachedItems;
    cachedRaw = raw;
    cachedItems = EMPTY;
    const value: unknown = JSON.parse(raw || "[]");
    cachedItems = Array.isArray(value)
      ? value.filter(
          (item): item is NewsItem =>
            !!item &&
            typeof item.id === "string" &&
            typeof item.title === "string" &&
            typeof item.slug === "string" &&
            typeof item.source === "string" &&
            typeof item.source_url === "string" &&
            item.source_url.startsWith("https://") &&
            topics.includes(item.topic) &&
            Number.isFinite(Date.parse(item.published_at)) &&
            (item.image_url === null || typeof item.image_url === "string"),
        )
      : EMPTY;
    return cachedItems;
  } catch {
    return EMPTY;
  }
}
export const serverBookmarks = () => EMPTY;
export function subscribeBookmarks(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("bookmarks-changed", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("bookmarks-changed", listener);
  };
}
export function toggleBookmark(article: NewsItem) {
  const items = readBookmarks();
  const next = items.some((item) => item.id === article.id)
    ? items.filter((item) => item.id !== article.id)
    : [article, ...items].slice(0, 200);
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("bookmarks-changed"));
}
