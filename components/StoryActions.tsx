"use client";
import { useState } from "react";
import Icon from "./Icon";
import BookmarkButton from "./BookmarkButton";
import type { NewsItem } from "@/types/news";
export default function StoryActions({ article }: { article: NewsItem }) {
  const [message, setMessage] = useState("");
  async function share() {
    try {
      if (navigator.share)
        await navigator.share({
          title: article.title,
          url: article.source_url,
        });
      else {
        await navigator.clipboard.writeText(article.source_url);
        setMessage("Link copied");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setMessage("Use the source link to share this story.");
    }
  }
  return (
    <div className="flex justify-between items-center gap-2 mt-3 font-numbers text-xs">
      <BookmarkButton article={article} />
      <a
        href={article.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-string-secondary"
      >
        {article.source} <Icon name="arrowUpRight" size={20} className="outbound-icon" />
      </a>
      <button onClick={share} aria-label="Share story" className="p-1 text-string-secondary hover:text-string-primary">
        <Icon name="share" size={17} />
      </button>
      {message && (
        <span role="status" className="text-xs">
          {message}
        </span>
      )}
    </div>
  );
}
