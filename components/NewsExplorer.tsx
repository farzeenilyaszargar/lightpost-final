"use client";
import Link from "next/link";
import { useNewsPage } from "./useNewsPage";
import type { NewsPage, NewsItem, Topic } from "@/types/news";
import { topicLabels } from "@/types/news";
import StoryActions from "./StoryActions";
import StoryImage from "./StoryImage";
import dynamic from "next/dynamic";
const MarketWatch = dynamic(() => import("./MarketWatch"), {
  loading: () => <p className="m-5 text-sm text-string-secondary" role="status">Loading the Market Ledger…</p>,
});
function storySnippet(description: string) {
  const text = description.replace(/\s*Continue reading\.\.\.\s*$/i, "").trim();
  if (text.length <= 160) return text;
  const preview = text.slice(0, 160).replace(/\s+\S*$/, "").replace(/[.,;:!?]+$/, "");
  return `${preview}…`;
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
        <p className="text-sm mt-2 text-string-secondary leading-relaxed line-clamp-3">
          {storySnippet(article.description)}
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
    pending,
    loadingMore,
    error,
    refresh,
    more,
  } = useNewsPage(initialFeed, topic);
  const word =
    words[
      Math.floor(Date.parse(feed.updatedAt || "2026-01-01") / 86400000) %
        words.length
    ];
  return (
    <main id="main" className="w-full flex flex-col items-center">
      <h1 className="sr-only">{topic ? topicLabels[topic] : "Latest news"}</h1>
      <div className="w-5/6 border-l border-r border-border font-main">
        {topic === "business" && <MarketWatch />}
        {feed.unavailableSources.length > 0 && (
          <p role="status" className="m-5 text-sm text-string-secondary">
            {feed.stale
              ? "Showing the last available news while sources reconnect."
              : feed.articles.length
                ? "Some sources are temporarily unavailable. Available stories are shown below."
                : "News sources are unavailable. Please try again shortly."}
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
            <h2 className="text-xl font-bold mb-3">No news available right now</h2>
            <p className="text-string-secondary">Please try again in a few minutes.</p>
          </div>
        ) : (
          <div className="news-columns p-5">
            {!topic && (
              <aside className="p-3 border border-border rounded-2xl">
                <h2 className="text-2xl mb-2 font-bold">What&apos;s Happening</h2>
                <p className="text-sm text-string-secondary leading-relaxed">
                  Fresh headlines from BBC News and The Guardian. Read different
                  perspectives and follow each story to its original source.
                </p>
              </aside>
            )}
            {articles.map((article, index) => (
              <StoryCard key={article.id} article={article} featured={!topic && index === 0} />
            ))}
            {!topic && (
              <aside className="p-5 border border-border rounded-2xl">
                <h2 className="text-xs text-string-secondary mb-2">Word of the Day</h2>
                <p className="text-2xl font-black">
                  {word.word}
                  <span className="text-xs ml-2 text-string-secondary font-extralight">({word.part})</span>
                </p>
                <p className="text-sm text-string-secondary font-extralight">{word.pronunciation}</p>
                <p className="text-sm text-string-secondary mt-2">{word.definition}</p>
              </aside>
            )}
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
