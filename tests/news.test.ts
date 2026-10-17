import { test } from "node:test";
import assert from "node:assert/strict";
import {
  plainText,
  safeUrl,
  normalizeArticle,
  deduplicate,
} from "../lib/news-utils";
import { fetchTopic } from "../lib/rss";
import { shuffleTiles } from "../lib/sliding-puzzle";
const item = {
  title: "A &amp; B <b>report</b>",
  link: "https://example.com/story?utm_source=rss",
  isoDate: "2026-01-01T10:00:00Z",
  content: "<p>A clear update.</p>",
};
const article = normalizeArticle(item, "world", "Example")!;
const xml = (name = "A story", link = "https://example.com/story") =>
  `<?xml version="1.0"?><rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/"><channel><title>Test</title><link>https://example.com</link><description>Test feed</description><item><title>${name}</title><link>${link}</link><pubDate>Thu, 01 Jan 2026 10:00:00 GMT</pubDate><description>A report</description><media:content width="140" url="https://example.com/small.jpg"/><media:content width="700" url="https://example.com/large.jpg"/></item></channel></rss>`;
test("feed text is stripped and entities decoded without injecting HTML", () => {
  assert.equal(plainText("<p>A &amp; B &#8217; &#x2019;</p>"), "A & B ’ ’");
  assert.doesNotThrow(() => plainText("&#999999999999;"));
});
test("unsafe article URLs are rejected", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,test",
    "http://example.com",
    "/relative",
    "invalid",
  ])
    assert.equal(safeUrl(url), null);
});
test("articles normalize into a stable public shape", () => {
  assert.equal(article.title, "A & B report");
  assert.equal(article.description, "A clear update.");
  assert.equal(article.source, "Example");
  assert.match(article.slug, /-[a-f0-9]{16}$/);
});
test("tracking parameters do not change the article identifier", () => {
  assert.equal(
    normalizeArticle(
      { ...item, link: "https://example.com/story?other=true#section" },
      "world",
      "Example",
    )?.id,
    article.id,
  );
});
test("malformed and future articles are omitted", () => {
  assert.equal(
    normalizeArticle({ ...item, title: "" }, "world", "Example"),
    null,
  );
  assert.equal(
    normalizeArticle({ ...item, isoDate: "invalid" }, "world", "Example"),
    null,
  );
  assert.equal(
    normalizeArticle({ ...item, isoDate: "2099-01-01" }, "world", "Example"),
    null,
  );
});
test("duplicates are removed and newest articles sort first without mutation", () => {
  const newer = {
    ...article,
    id: "new",
    title: "New report",
    published_at: "2026-01-02T10:00:00Z",
  };
  const items = [article, newer, { ...article, id: "duplicate" }];
  assert.deepEqual(
    deduplicate(items).map((item) => item.id),
    ["new", article.id],
  );
  assert.equal(items[0].id, article.id);
});
test("RSS reader merges publishers and uses the largest supplied image", async () => {
  const feed = await fetchTopic(
    "world",
    async (input) =>
      new Response(
        xml(
          String(input).includes("bbc") ? "BBC story" : "Guardian story",
          `https://example.com/${String(input).includes("bbc") ? "bbc" : "guardian"}`,
        ),
      ),
  );
  assert.equal(feed.articles.length, 2);
  assert.equal(feed.articles[0].image_url, "https://example.com/large.jpg");
  assert.equal(feed.unavailableSources.length, 0);
});
test("one failing publisher does not take down the feed", async () => {
  const feed = await fetchTopic("world", async (input) => {
    if (String(input).includes("bbc")) throw new Error("Offline");
    return new Response(xml());
  });
  assert.equal(feed.articles.length, 1);
  assert.deepEqual(feed.unavailableSources, ["BBC News"]);
});
test("invalid XML and non-200 responses produce an honest empty feed", async () => {
  const feed = await fetchTopic(
    "world",
    async (input) =>
      new Response(String(input).includes("bbc") ? "bad xml" : "unavailable", {
        status: String(input).includes("bbc") ? 200 : 503,
      }),
  );
  assert.equal(feed.articles.length, 0);
  assert.equal(feed.updatedAt, null);
  assert.equal(feed.unavailableSources.length, 2);
});
test("a total outage preserves the previous edition and timestamp", async () => {
  const previous = {
    articles: [article],
    updatedAt: "2026-01-01T12:00:00Z",
    stale: false,
    unavailableSources: [],
  };
  const feed = await fetchTopic(
    "world",
    async () => {
      throw new Error("Offline");
    },
    previous,
  );
  assert.equal(feed.stale, true);
  assert.equal(feed.updatedAt, previous.updatedAt);
  assert.deepEqual(feed.articles, previous.articles);
});
test("sliding puzzles always have an even inversion count and all tiles", () => {
  for (let i = 0; i < 40; i++) {
    const tiles = shuffleTiles();
    assert.deepEqual([...tiles].sort(), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const values = tiles.filter(Boolean);
    const inversions = values.reduce(
      (sum, value, index) =>
        sum + values.slice(index + 1).filter((other) => other < value).length,
      0,
    );
    assert.equal(inversions % 2, 0);
  }
});
