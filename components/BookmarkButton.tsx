"use client";
import { useEffect, useState } from "react";
import type { NewsItem } from "@/types/news";
export const BOOKMARK_KEY = "lightpost-bookmarks-v1";
export function readBookmarks(): NewsItem[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(BOOKMARK_KEY) || "[]",
    );
    return Array.isArray(value)
      ? value.filter(
          (item): item is NewsItem =>
            !!item &&
            typeof item.id === "string" &&
            typeof item.title === "string" &&
            typeof item.slug === "string" &&
            typeof item.source_url === "string" &&
            typeof item.topic === "string",
        )
      : [];
  } catch {
    return [];
  }
}
export default function BookmarkButton({ article }: { article: NewsItem }) {
  const [saved, setSaved] = useState(false),
    [error, setError] = useState(false);
  useEffect(() => {
    function sync() {
      setSaved(readBookmarks().some((item) => item.id === article.id));
    }
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("bookmarks-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("bookmarks-changed", sync);
    };
  }, [article.id]);
  function toggle() {
    try {
      const items = readBookmarks();
      const next = items.some((item) => item.id === article.id)
        ? items.filter((item) => item.id !== article.id)
        : [article, ...items].slice(0, 200);
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("bookmarks-changed"));
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
