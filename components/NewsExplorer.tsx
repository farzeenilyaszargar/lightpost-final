"use client";
import Link from "next/link";
import { useNewsPage } from "./useNewsPage";
import type { NewsPage, NewsItem, Topic } from "@/types/news";
import { topicLabels } from "@/types/news";
import StoryActions from "./StoryActions";
import StoryImage from "./StoryImage";
import VisualTitle from "./VisualTitle";
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
    <article
      className={`border border-border rounded-2xl ${featured ? "p-3" : "p-2"} font-main`}
    >
      <Link prefetch={false} href={storyUrl(article)} className="block">
        {featured && (
          <h2 className="text-3xl mb-3 font-black">{article.title}</h2>
        )}
        <div
          className={`overflow-hidden ${featured ? "rounded-2xl" : "rounded-lg"}`}
        >
          <StoryImage
            src={article.image_url}
            title={article.title}
            topic={article.topic}
            eager={featured}
          />
        </div>
        {!featured && (
          <h2 className="font-semibold text-xl mt-2">{article.title}</h2>
        )}
        <p className="text-sm mt-2 text-string-secondary leading-relaxed">
          {article.description}
        </p>
      </Link>
      <StoryActions article={article} />
    </article>
  );
}
const words = [
  {
    word: "Perspective",
    pronunciation: "/per-spek-tiv/",
    definition: "A particular way of looking at or understanding something.",
    part: "noun",
  },
  {
    word: "Discern",
    pronunciation: "/di-surn/",
    definition: "To recognise something clearly through careful thought.",
    part: "verb",
  },
  {
    word: "Nuance",
    pronunciation: "/noo-ahns/",
    definition:
      "A small but meaningful difference in expression or understanding.",
    part: "noun",
  },
  {
    word: "Inquisitive",
    pronunciation: "/in-kwiz-i-tiv/",
    definition: "Curious and eager to learn more.",
    part: "adjective",
  },
  {
    word: "Lucid",
    pronunciation: "/loo-sid/",
    definition: "Expressed clearly and easily understood.",
    part: "adjective",
  },
  {
    word: "Resilient",
    pronunciation: "/ri-zil-yunt/",
    definition: "Able to recover after difficulty or change.",
    part: "adjective",
  },
  {
    word: "Serendipity",
    pronunciation: "/seh-ren-dip-i-tee/",
    definition: "The chance discovery of something pleasant or useful.",
    part: "noun",
  },
];
export default function NewsExplorer({
  feed: initialFeed,
  topic,
}: {
  feed: NewsPage;
  topic?: Topic;
}) {
  const {
    feed,
    articles,
    query,
    setQuery,
    source,
    setSource,
    pending,
    loadingMore,
    error,
    refresh,
    more,
  } = useNewsPage(initialFeed, topic);
  const filtering = !!query.trim() || source !== "all";
  const top = articles[0];
  const rest = articles.slice(1);
  const word =
    words[
      Math.floor(Date.parse(feed.updatedAt || "2026-01-01") / 86400000) %
        words.length
    ];
  const column = (index: number) =>
    rest
      .filter((_, i) => i % 4 === index)
      .map((article) => <StoryCard key={article.id} article={article} />);
  return (
    <main id="main" className="w-full flex flex-col items-center">
      {topic ? (
        <VisualTitle title={topicLabels[topic]} />
      ) : (
        <h1 className="sr-only">Latest news</h1>
      )}
      <div className="w-5/6 border-l border-r border-border font-main">
        <div className="newspaper-toolbar m-5 mb-0 pb-3 border-b border-border flex flex-wrap justify-between items-center gap-3 text-xs">
          <div>
            <span>{feed.stale ? "Last available edition" : "Latest news"}</span>
            {feed.updatedAt && (
              <span className="text-string-secondary ml-3">
                Updated{" "}
                {new Date(feed.updatedAt).toLocaleTimeString("en", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Kolkata",
                })}{" "}
                IST
              </span>
            )}
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <label>
              <span className="sr-only">Search headlines</span>
              <input
                maxLength={160}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                placeholder="Search headlines…"
                className="bg-background border border-border rounded-full px-3 py-1.5 w-40"
              />
            </label>
            <label>
              <span className="sr-only">Filter by source</span>
              <select
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                }}
                className="bg-background border border-border rounded-full px-2 py-1.5"
              >
                <option value="all">All sources</option>
                <option>BBC News</option>
                <option>The Guardian</option>
              </select>
            </label>
            <button
              aria-label="Refresh headlines"
              onClick={refresh}
              disabled={pending || loadingMore}
              className="px-1 text-lg"
            >
              ↻
            </button>
          </div>
        </div>
        {feed.unavailableSources.length > 0 && (
          <p role="status" className="m-5 text-sm text-string-secondary">
            {feed.stale
              ? "Showing the last available news while sources reconnect."
              : feed.articles.length
                ? "Some sources are temporarily unavailable. Available stories are shown below."
                : "News sources are unavailable. Please try refreshing shortly."}
          </p>
        )}
        {error && (
          <p role="alert" className="m-5 text-sm text-string-secondary">
            {error}{" "}
            <button className="underline" onClick={refresh}>
              Retry
            </button>
          </p>
        )}
        {pending && !articles.length ? (
          <div
            className="p-10 text-center text-string-secondary min-h-64"
            role="status"
          >
            Looking up headlines…
          </div>
        ) : !articles.length ? (
          <div className="p-10 text-center">
            <h2 className="text-xl font-bold mb-3">
              {filtering
                ? "No matching stories"
                : "No news available right now"}
            </h2>
            <p className="text-string-secondary">
              {filtering
                ? "Try a different keyword or source."
                : "Please try again in a few minutes."}
            </p>
            {filtering && (
              <button
                className="border border-border rounded-full px-4 py-2 mt-4"
                onClick={() => {
                  setQuery("");
                  setSource("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : topic || filtering ? (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {articles.map((article) => (
              <StoryCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="flex md:flex-row flex-col justify-between pt-5 gap-5 p-5">
            <div className="md:w-1/4 min-w-0 space-y-5">
              <h2 className="text-2xl p-3 mb-0 font-bold -mt-3">
                What&apos;s Happening 🌏
              </h2>
              <div className="p-3 border border-border rounded-2xl">
                <p className="text-sm text-string-secondary leading-relaxed">
                  Fresh headlines from BBC News and The Guardian. Read different
                  perspectives and follow each story to its original source.
                </p>
              </div>
              <div className="space-y-5">{column(0)}</div>
            </div>
            <div className="md:w-1/2 min-w-0">
              <div className="mb-5">
                {top && <StoryCard article={top} featured />}
              </div>
              <div className="flex sm:flex-row flex-col gap-5">
                <div className="sm:w-1/2 min-w-0 space-y-5">{column(1)}</div>
                <div className="sm:w-1/2 min-w-0 space-y-5">{column(2)}</div>
              </div>
            </div>
            <div className="md:w-1/4 min-w-0 space-y-5">
              <aside className="p-5 border border-border rounded-2xl">
                <h2 className="text-xs text-string-secondary mb-2">
                  Word of the Day
                </h2>
                <p className="text-2xl font-black">
                  {word.word}
                  <span className="text-xs ml-2 text-string-secondary font-extralight">
                    ({word.part})
                  </span>
                </p>
                <p className="text-sm text-string-secondary font-extralight">
                  {word.pronunciation}
                </p>
                <p className="text-sm text-string-secondary mt-2">
                  {word.definition}
                </p>
              </aside>
              <div className="space-y-5">{column(3)}</div>
            </div>
          </div>
        )}
        {feed.nextOffset !== null && articles.length > 0 && (
          <div className="text-center p-5">
            <button
              className="border border-border rounded-full px-5 py-2 text-sm hover:bg-string-primary hover:text-background"
              disabled={pending || loadingMore}
              onClick={more}
            >
              {loadingMore ? "Loading more…" : "More news ↓"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
