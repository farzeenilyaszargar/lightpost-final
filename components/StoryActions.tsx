"use client";
import { useState } from "react";
import Image from "next/image";
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
        className="text-string-secondary hover:text-string-primary"
      >
        {article.source} ↗
      </a>
      <button onClick={share} aria-label="Share story" className="p-1">
        <Image
          src="/icons/sharee.png"
          alt=""
          width={15}
          height={15}
          className="invert-[var(--my-invert)]"
        />
      </button>
      {message && (
        <span role="status" className="text-xs">
          {message}
        </span>
      )}
    </div>
  );
}
