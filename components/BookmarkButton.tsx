"use client";
import { useState, useSyncExternalStore } from "react";
import type { NewsItem } from "@/types/news";
import {
  readBookmarks,
  serverBookmarks,
  subscribeBookmarks,
  toggleBookmark,
} from "@/lib/bookmarks";
export { readBookmarks, BOOKMARK_KEY } from "@/lib/bookmarks";
export default function BookmarkButton({ article }: { article: NewsItem }) {
  const entries = useSyncExternalStore(
    subscribeBookmarks,
    readBookmarks,
    serverBookmarks,
  );
  const saved = entries.some((item) => item.id === article.id);
  const [error, setError] = useState(false);
  function toggle() {
    try {
      toggleBookmark(article);
      setError(false);
    } catch {
      setError(true);
    }
  }
  return (
    <button
      className={`bookmark-button ${saved ? "is-saved" : ""}`}
      onClick={toggle}
      aria-pressed={saved}
      aria-label={
        error
          ? "Unable to save: browser storage unavailable"
          : saved
            ? "Remove bookmark"
            : "Bookmark article"
      }
      title={
        error
          ? "Browser storage is unavailable"
          : saved
            ? "Saved to bookmarks"
            : "Save for later"
      }
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M6 3h12v18l-6-4-6 4z" />
      </svg>
      {error && <span>Unable to save</span>}
    </button>
  );
}
