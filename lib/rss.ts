import Parser from "rss-parser";
import type { Topic, NewsFeed, NewsItem } from "@/types/news";
import { deduplicate, normalizeArticle } from "./news-utils";

type Media = { $?: { url?: string; width?: string } };
type FeedItem = {
  thumbnail?: Media;
  media?: Media[];
  enclosure?: { url?: string };
};
const parser = new Parser<Record<string, never>, FeedItem>({
  customFields: {
    item: [
      ["media:thumbnail", "thumbnail"],
      ["media:content", "media", { keepArray: true }],
    ],
  },
});
const bbc: Record<Topic, string> = {
  world: "news/world",
  politics: "news/politics",
  business: "news/business",
  technology: "news/technology",
  science: "news/science_and_environment",
  sports: "sport",
  entertainment: "news/entertainment_and_arts",
};
const guardian: Record<Topic, string> = {
  world: "world",
  politics: "politics",
  business: "business",
  technology: "technology",
  science: "science",
  sports: "sport",
  entertainment: "culture",
};
export async function fetchTopic(
  topic: Topic,
  fetcher: typeof fetch = fetch,
  previous?: NewsFeed,
): Promise<NewsFeed> {
  const sources = [
    { name: "BBC News", url: `https://feeds.bbci.co.uk/${bbc[topic]}/rss.xml` },
    {
      name: "The Guardian",
      url: `https://www.theguardian.com/${guardian[topic]}/rss`,
    },
  ];
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const response = await fetcher(source.url, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8000),
        headers: {
          "User-Agent": "Lightpost/1.0 RSS Reader",
          Accept: "application/rss+xml, application/xml, text/xml",
        },
      });
      if (!response.ok) throw new Error(`Feed returned ${response.status}`);
      const xml = await response.text();
      if (xml.length > 2_000_000) throw new Error("Feed too large");
      const feed = await parser.parseString(xml);
      const articles = feed.items
        .slice(0, 40)
        .map((item) =>
          normalizeArticle(
            item,
            topic,
            source.name,
            item.media
              ?.slice()
              .sort(
                (a, b) => Number(b.$?.width || 0) - Number(a.$?.width || 0),
              )[0]?.$?.url ||
              item.thumbnail?.$?.url?.replace(
                "/standard/240/",
                "/standard/800/",
              ) ||
              item.enclosure?.url,
          ),
        )
        .filter((item): item is NewsItem => !!item);
      if (!articles.length)
        throw new Error("Feed contained no usable articles");
      return articles;
    }),
  );
  const articles = deduplicate(
    results.flatMap((result) =>
      result.status === "fulfilled" ? result.value : [],
    ),
  );
  const unavailableSources = sources
    .filter((_, i) => results[i].status === "rejected")
    .map((source) => source.name);
  if (!articles.length) {
    return previous
      ? { ...previous, stale: true, unavailableSources }
      : { articles: [], updatedAt: null, stale: false, unavailableSources };
  }
  const feed = {
    articles,
    updatedAt: new Date().toISOString(),
    stale: false,
    unavailableSources,
  };
  return feed;
}
