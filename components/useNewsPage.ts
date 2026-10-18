"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NewsPage, Topic } from "@/types/news";
import { NEWS_PAGE_SIZE } from "@/lib/news-page";
export function useNewsPage(initial: NewsPage, topic?: Topic) {
  const [feed, setFeed] = useState(initial),
    [pending, setPending] = useState(false),
    [loadingMore, setLoadingMore] = useState(false),
    [error, setError] = useState("");
  const active = useRef<AbortController | null>(null),
    first = useRef(true);
  const load = useCallback(
    async (offset = 0, append = false) => {
      active.current?.abort();
      const controller = new AbortController();
      active.current = controller;
      setError("");
      if (append) setLoadingMore(true);
      else setPending(true);
      try {
        const params = new URLSearchParams({
          limit: String(NEWS_PAGE_SIZE),
          offset: String(offset),
        });
        if (topic) params.set("topic", topic);
        const response = await fetch(`/api/news?${params}`, {
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(15000),
          ]),
        });
        if (!response.ok && response.status !== 503)
          throw new Error("Unable to load headlines");
        const page: NewsPage = await response.json();
        if (!Array.isArray(page.articles) || !Number.isInteger(page.total))
          throw new Error("Invalid news response");
        if (controller.signal.aborted) return;
        setFeed((previous) =>
          append
            ? {
                ...page,
                articles: [
                  ...previous.articles,
                  ...page.articles.filter(
                    (article) => !previous.articles.some((old) => old.id === article.id),
                  ),
                ],
              }
            : page,
        );
      } catch {
        if (!controller.signal.aborted)
          setError("Headlines could not be loaded. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setPending(false);
          setLoadingMore(false);
        }
      }
    },
    [topic],
  );
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    active.current?.abort();
    setPending(true);
    setLoadingMore(false);
    void load();
    return () => {
      active.current?.abort();
    };
  }, [load]);
  useEffect(() => () => active.current?.abort(), []);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (
        document.visibilityState === "visible" &&
        feed.articles.length <= NEWS_PAGE_SIZE
      )
        void load();
    }, 300000);
    return () => window.clearInterval(timer);
  }, [load, feed.articles.length]);
  return {
    feed,
    articles: feed.articles,
    pending,
    loadingMore,
    error,
    refresh: () => load(),
    more: () => {
      if (feed.nextOffset !== null && !pending && !loadingMore)
        void load(feed.nextOffset, true);
    },
  };
}
