import { cache } from "react";
import { unstable_cache } from "next/cache";
import { topics, type Topic, type NewsFeed } from "@/types/news";
import { deduplicate } from "./news-utils";
import { fetchTopic } from "./rss";
const lastGood = new Map<Topic, NewsFeed>();
const inFlight = new Map<Topic, Promise<NewsFeed>>();
const cachedTopic = unstable_cache(
  async (topic: Topic) => {
    const existing = inFlight.get(topic);
    if (existing) return existing;
    const request = fetchTopic(topic, fetch, lastGood.get(topic))
      .then((feed) => {
        if (feed.articles.length && !feed.stale) lastGood.set(topic, feed);
        return feed;
      })
      .finally(() => inFlight.delete(topic));
    inFlight.set(topic, request);
    return request;
  },
  ["lightpost-rss-v2"],
  { revalidate: 300 },
);
export const getNews = cache(async (topic?: Topic): Promise<NewsFeed> => {
  if (topic) return cachedTopic(topic);
  const feeds = await Promise.all(topics.map((t) => cachedTopic(t)));
  const dates = feeds
    .map((feed) => feed.updatedAt)
    .filter((date): date is string => !!date)
    .sort();
  return {
    articles: deduplicate(feeds.flatMap((feed) => feed.articles)),
    updatedAt: dates.at(-1) || null,
    stale: feeds.some((feed) => feed.stale),
    unavailableSources: [
      ...new Set(feeds.flatMap((feed) => feed.unavailableSources)),
    ],
  };
});
export async function getArticle(topic: Topic, slug: string) {
  return (
    (await getNews(topic)).articles.find((article) => article.slug === slug) ||
    null
  );
}
