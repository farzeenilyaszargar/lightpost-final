"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NewsPage, Topic } from "@/types/news";
import { NEWS_PAGE_SIZE } from "@/lib/news-page";
export function useNewsPage(initial: NewsPage, topic?: Topic) {
  const [source, setSource] = useState("all");
  const filterKey = source;
  const [result, setResult] = useState({ page: initial, key: "all" }),
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
        if (source !== "all") params.set("source", source);
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
        setResult((previous) => ({
          key: filterKey,
          page:
            append && previous.key === filterKey
              ? {
                  ...page,
                  articles: [
                    ...previous.page.articles,
                    ...page.articles.filter(
                      (article) =>
                        !previous.page.articles.some(
                          (old) => old.id === article.id,
                        ),
                    ),
                  ],
                }
              : page,
        }));
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
    [topic, source, filterKey],
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
        result.page.articles.length <= NEWS_PAGE_SIZE
      )
        void load();
    }, 300000);
    return () => window.clearInterval(timer);
  }, [load, result.page.articles.length]);
  return {
    feed: result.page,
    articles: result.key === filterKey ? result.page.articles : [],
    source,
    setSource,
    pending,
    loadingMore,
    error,
    refresh: () => load(),
    more: () => {
      if (result.page.nextOffset !== null && !pending && !loadingMore)
        void load(result.page.nextOffset, true);
    },
  };
}
