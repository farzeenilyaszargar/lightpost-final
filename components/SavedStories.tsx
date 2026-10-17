"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { NewsItem } from "@/types/news";
import { readBookmarks } from "./BookmarkButton";
import { StoryCard } from "./NewsExplorer";
import VisualTitle from "./VisualTitle";
export default function SavedStories() {
  const [items, setItems] = useState<NewsItem[]>([]),
    [ready, setReady] = useState(false);
  useEffect(() => {
    function sync() {
      setItems(readBookmarks());
      setReady(true);
    }
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("bookmarks-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("bookmarks-changed", sync);
    };
  }, []);
  return (
    <main
      id="main"
      className="flex flex-col items-center min-h-[70vh] font-main"
    >
      <VisualTitle title="Saved stories" />
      <div className="w-5/6 border-l border-r border-border p-5 flex-1">
        <p className="text-sm text-string-secondary mb-5">
          Saved in this browser. You can always open the original report, even
          after it leaves the news feed.
        </p>
        {!ready ? (
          <p>Loading saved stories…</p>
        ) : items.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {items.map((article) => (
              <div key={article.id}>
                <StoryCard article={article} />
                <a
                  className="inline-block text-xs text-string-secondary mt-2"
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read original report ↗
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-10">
            <h2 className="text-2xl font-bold mb-3">No saved stories yet</h2>
            <p className="text-string-secondary mb-5">
              Use the bookmark on a story to save it here.
            </p>
            <Link
              href="/"
              className="border border-border rounded-full px-4 py-2"
            >
              Back to the news ↗
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
