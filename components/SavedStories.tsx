"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { NewsItem } from "@/types/news";
import { readBookmarks } from "./BookmarkButton";
import { StoryCard } from "./NewsExplorer";
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
    <main id="main" className="site-container saved-main">
      <div className="edition-heading">
        <div>
          <span className="eyebrow">YOUR READING LIST</span>
          <h1>
            Worth <em>coming back to.</em>
          </h1>
          <p>
            Stories saved in this browser. Full reports always live at the
            source.
          </p>
        </div>
      </div>
      {!ready ? (
        <p>Loading your bookmarks…</p>
      ) : items.length ? (
        <div className="stories-grid">
          {items.map((article) => (
            <div key={article.id}>
              <StoryCard article={article} />
              <a
                href={article.source_url}
                className="saved-original"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read original report ↗
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span>◇</span>
          <h2>A little space for your curiosity.</h2>
          <p>Tap the bookmark on any story to save it here.</p>
          <Link href="/" className="primary-button">
            Find your next read ↗
          </Link>
        </div>
      )}
    </main>
  );
}
