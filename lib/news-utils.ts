import { createHash } from "node:crypto";
import type { NewsItem, Topic } from "../types/news";

export function plainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, code: string) => {
      const n = code.startsWith("x")
        ? parseInt(code.slice(1), 16)
        : Number(code);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "";
    })
    .replace(
      /&(amp|quot|apos|lt|gt|nbsp|#39);/g,
      (_, key: string) =>
        ({
          amp: "&",
          quot: '"',
          apos: "'",
          lt: "<",
          gt: ">",
          nbsp: " ",
          "#39": "'",
        })[key] || "",
    )
    .replace(/\s+/g, " ")
    .trim();
}
export function safeUrl(value?: string): string | null {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
export function normalizeArticle(
  item: {
    title?: string;
    link?: string;
    contentSnippet?: string;
    content?: string;
    isoDate?: string;
    pubDate?: string;
  },
  topic: Topic,
  source: string,
  image?: string,
): NewsItem | null {
  const sourceUrl = safeUrl(item.link);
  const title = plainText(item.title || "");
  const date = Date.parse(item.isoDate || item.pubDate || "");
  if (
    !title ||
    !sourceUrl ||
    !Number.isFinite(date) ||
    date > Date.now() + 3600000
  )
    return null;
  const canonical = new URL(sourceUrl);
  canonical.search = "";
  canonical.hash = "";
  const id = createHash("sha256")
    .update(canonical.toString())
    .digest("hex")
    .slice(0, 16);
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100) || "story";
  return {
    id,
    title,
    description: plainText(item.contentSnippet || item.content || "").slice(
      0,
      500,
    ),
    published_at: new Date(date).toISOString(),
    image_url: safeUrl(image),
    topic,
    slug: `${slug}-${id}`,
    source,
    source_url: sourceUrl,
  };
}
export function deduplicate(articles: NewsItem[]): NewsItem[] {
  const ids = new Set<string>(),
    titles = new Set<string>();
  return [...articles]
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))
    .filter((article) => {
      const title = article.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (ids.has(article.id) || titles.has(title)) return false;
      ids.add(article.id);
      titles.add(title);
      return true;
    });
}
