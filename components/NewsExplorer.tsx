"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { NewsFeed, NewsItem, Topic } from "@/types/news";
import { topicLabels } from "@/types/news";
import BookmarkButton from "./BookmarkButton";
import StoryImage from "./StoryImage";
function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
}
function storyUrl(article: NewsItem) {
  return `/news/${article.topic}/${article.slug}`;
}
export function StoryCard({
  article,
  featured = false,
}: {
  article: NewsItem;
  featured?: boolean;
}) {
  return (
    <article className={featured ? "story-card featured-story" : "story-card"}>
      <Link
        href={storyUrl(article)}
        className="story-image-link"
        tabIndex={-1}
        aria-hidden="true"
      >
        <StoryImage
          src={article.image_url}
          title={article.title}
          topic={article.topic}
          eager={featured}
        />
      </Link>
      <div className="story-body">
        <div className="story-topline">
          <span className="eyebrow topic-tag">
            {topicLabels[article.topic]}
          </span>
          <BookmarkButton article={article} />
        </div>
        <h2>
          <Link href={storyUrl(article)}>{article.title}</Link>
        </h2>
        <p className="story-description">{article.description}</p>
        <div className="story-meta">
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {article.source} ↗
          </a>
          <span>·</span>
          <time dateTime={article.published_at}>
            {dateLabel(article.published_at)}
          </time>
        </div>
      </div>
    </article>
  );
}
export default function NewsExplorer({
  feed,
  topic,
}: {
  feed: NewsFeed;
  topic?: Topic;
}) {
  const [query, setQuery] = useState(""),
    [source, setSource] = useState("all"),
    [visible, setVisible] = useState(12);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible")
        startTransition(() => router.refresh());
    }, 300_000);
    return () => window.clearInterval(interval);
  }, [router]);
  const articles = useMemo(
    () =>
      feed.articles.filter(
        (article) =>
          (source === "all" || article.source === source) &&
          `${article.title} ${article.description} ${article.source} ${article.topic}`
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
      ),
    [feed.articles, source, query],
  );
  const filtering = !!query || source !== "all";
  const leading = articles[0];
  return (
    <main id="main" className="site-container news-main">
      <section className="edition-heading">
        <div>
          <div className="eyebrow edition-label">
            <span className="orange-dot" />
            THE LIGHTPOST EDITION
          </div>
          <h1>
            {topic ? (
              topicLabels[topic]
            ) : (
              <>
                The world, <em>in perspective.</em>
              </>
            )}
          </h1>
          <p>
            {topic
              ? `Fresh perspectives and the latest developments in ${topicLabels[topic].toLowerCase()}.`
              : "The stories that matter. A little less noise. A little more understanding."}
          </p>
        </div>
        <div className="edition-date">
          <span>
            {new Intl.DateTimeFormat("en", {
              weekday: "long",
              timeZone: "Asia/Kolkata",
            }).format(new Date())}
          </span>
          <strong>
            {new Intl.DateTimeFormat("en", {
              month: "long",
              day: "numeric",
              year: "numeric",
              timeZone: "Asia/Kolkata",
            }).format(new Date())}
          </strong>
          <small>YOUR DAILY DOSE OF PERSPECTIVE</small>
        </div>
      </section>
      <div className="feed-toolbar">
        <div className="feed-status">
          <span
            className={
              feed.articles.length ? "status-dot" : "status-dot offline"
            }
          />
          <strong>
            {feed.stale
              ? "Saved edition"
              : feed.articles.length
                ? "Latest headlines"
                : "Feeds unavailable"}
          </strong>
          <span className="update-time">
            {feed.updatedAt
              ? `Updated ${new Date(feed.updatedAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })} IST`
              : "Try again shortly"}
          </span>
        </div>
        <div className="feed-controls">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search headlines"
              placeholder="Find a story…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisible(12);
              }}
            />
            {query && (
              <button aria-label="Clear search" onClick={() => setQuery("")}>
                ×
              </button>
            )}
          </label>
          <button
            className="refresh-button"
            disabled={pending}
            onClick={() => startTransition(() => router.refresh())}
            aria-label="Refresh headlines"
          >
            <span className={pending ? "spinning" : ""}>↻</span>
          </button>
        </div>
      </div>
      {feed.unavailableSources.length > 0 && (
        <p className="feed-notice" role="status">
          {feed.stale
            ? "Showing the last available edition while our sources reconnect."
            : feed.articles.length
              ? "Some feeds are temporarily unavailable. Available stories are shown below."
              : "We couldn’t reach our news sources. Please try refreshing in a few minutes."}
        </p>
      )}
      {!filtering && leading && (
        <section className="lead-layout" aria-label="Top stories">
          <StoryCard article={leading} featured />
          <aside className="briefing">
            <div className="briefing-heading">
              <span className="eyebrow">THE QUICK READ</span>
              <span aria-hidden="true">↗</span>
            </div>
            <h2>
              Around the world
              <br />
              <em>in a few headlines.</em>
            </h2>
            <ol>
              {articles.slice(1, 5).map((article, i) => (
                <li key={article.id}>
                  <span className="brief-number">0{i + 1}</span>
                  <div>
                    <span className="eyebrow">
                      {topicLabels[article.topic]}
                    </span>
                    <Link href={storyUrl(article)}>{article.title}</Link>
                    <small>{article.source}</small>
                  </div>
                </li>
              ))}
            </ol>
            <div className="briefing-note">
              <span className="orange-dot" />
              Different sources. A wider view.
            </div>
          </aside>
        </section>
      )}
      <section className="latest-section" aria-label="News stories">
        <div className="section-heading">
          <div>
            <span className="eyebrow">KEEP EXPLORING</span>
            <h2>
              {filtering ? "Your search results" : "The latest dispatches"}
              <span>
                {filtering ? articles.length : Math.max(0, articles.length - 1)}
              </span>
            </h2>
          </div>
          <label className="source-filter">
            <span className="sr-only">Filter by source</span>
            <select
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                setVisible(12);
              }}
            >
              <option value="all">All sources</option>
              <option>BBC News</option>
              <option>The Guardian</option>
            </select>
          </label>
        </div>
        {articles.length ? (
          <div className="stories-grid">
            {(filtering ? articles : articles.slice(1))
              .slice(0, visible)
              .map((article) => (
                <StoryCard key={article.id} article={article} />
              ))}
          </div>
        ) : (
          <div className="empty-state">
            <span>↗</span>
            <h2>
              {filtering ? "No stories found" : "A quiet moment in the feed"}
            </h2>
            <p>
              {filtering
                ? "Try another keyword or choose a different source."
                : "Our sources are taking a moment. Please check back shortly."}
            </p>
            {filtering && (
              <button
                className="primary-button"
                onClick={() => {
                  setQuery("");
                  setSource("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
        {(filtering ? articles.length : articles.length - 1) > visible && (
          <div className="load-more">
            <button onClick={() => setVisible((n) => n + 12)}>
              More stories <span>↓</span>
            </button>
            <p>Follow your curiosity.</p>
          </div>
        )}
      </section>
      <section className="break-banner">
        <div>
          <span className="eyebrow">ROOM FOR SOMETHING LIGHTER</span>
          <h2>
            A good read. <em>A little reset.</em>
          </h2>
          <p>Give your mind a different kind of headline.</p>
        </div>
        <Link href="/fun">
          Visit the break room <span>↗</span>
        </Link>
        <span className="banner-art" aria-hidden="true">
          ✳
        </span>
      </section>
    </main>
  );
}
