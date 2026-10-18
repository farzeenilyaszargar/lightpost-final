"use client";
import Link from "next/link";
import { useNewsPage } from "./useNewsPage";
import type { NewsPage, NewsItem, Topic } from "@/types/news";
import { topicLabels } from "@/types/news";
import StoryActions from "./StoryActions";
import StoryImage from "./StoryImage";
import WordOfDay from "./WordOfDay";
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
            sizes={featured ? "(max-width: 1023px) 83vw, 42vw" : undefined}
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
  const remaining = articles.slice(1);
  const sideStories = (column: number) => remaining
    .filter((_, index) => index % 4 === column)
    .map(article => <StoryCard key={article.id} article={article} />);
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
        ) : topic ? (
          <div className="news-columns p-5">
            {articles.map(article => <StoryCard key={article.id} article={article} />)}
          </div>
        ) : (
          <div className="frontpage-layout p-5">
            <div className="frontpage-center">
              <StoryCard article={articles[0]} featured />
              <div className="news-columns frontpage-followups mt-5">
                {remaining.filter((_, index) => index % 4 === 1 || index % 4 === 2)
                  .map(article => <StoryCard key={article.id} article={article} />)}
              </div>
            </div>
            <div className="frontpage-side frontpage-left">
              <aside className="p-3 border border-border rounded-2xl">
                <h2 className="text-2xl mb-2 font-bold">What&apos;s Happening</h2>
                <p className="text-sm text-string-secondary leading-relaxed">
                  Fresh headlines from BBC News and The Guardian. Read different
                  perspectives and follow each story to its original source.
                </p>
              </aside>
              {sideStories(0)}
            </div>
            <div className="frontpage-side frontpage-right">
              <WordOfDay />
              {sideStories(3)}
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
