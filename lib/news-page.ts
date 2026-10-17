import type { NewsFeed, NewsPage } from "@/types/news";
export const NEWS_PAGE_SIZE = 21;
export type NewsPageOptions = {
  offset?: number;
  limit?: number;
  query?: string;
  source?: string;
};
export function pageNews(
  feed: NewsFeed,
  {
    offset = 0,
    limit = NEWS_PAGE_SIZE,
    query = "",
    source = "all",
  }: NewsPageOptions = {},
): NewsPage {
  const term = query.trim().toLowerCase();
  const articles = feed.articles.filter(
    (article) =>
      (source === "all" || article.source === source) &&
      (!term ||
        `${article.title} ${article.description} ${article.source} ${article.topic}`
          .toLowerCase()
          .includes(term)),
  );
  return {
    ...feed,
    articles: articles.slice(offset, offset + limit),
    total: articles.length,
    nextOffset: offset + limit < articles.length ? offset + limit : null,
  };
}
export function parsePageOptions(params: URLSearchParams): NewsPageOptions {
  function integer(name: string, fallback: number, max: number) {
    const text = params.get(name);
    if (text === null) return fallback;
    if (!/^\d+$/.test(text)) throw new Error(`Invalid ${name}`);
    const value = Number(text);
    if (
      !Number.isSafeInteger(value) ||
      value > max ||
      (name === "limit" && value < 1)
    )
      throw new Error(`Invalid ${name}`);
    return value;
  }
  const query = (params.get("q") || "").trim();
  if (query.length > 160) throw new Error("Search is too long");
  const source = params.get("source") || "all";
  if (!["all", "BBC News", "The Guardian"].includes(source))
    throw new Error("Unknown source");
  return {
    offset: integer("offset", 0, 1_000_000),
    limit: integer("limit", NEWS_PAGE_SIZE, 100),
    query,
    source,
  };
}
