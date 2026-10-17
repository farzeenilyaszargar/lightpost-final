import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { pageNews, parsePageOptions, NEWS_PAGE_SIZE } from "../lib/news-page";
import { optimizableImage } from "../lib/image-policy";
import { fontPreloads } from "../lib/fonts";
import type { NewsFeed, NewsItem } from "../types/news";
const articles: NewsItem[] = Array.from({ length: 65 }, (_, i) => ({
  id: String(i),
  title: `Story ${i}`,
  description: i === 55 ? "A rare discovery" : "An update",
  topic: "world",
  slug: `story-${i}`,
  source: i % 2 ? "BBC News" : "The Guardian",
  source_url: `https://example.com/${i}`,
  published_at: "2026-10-18T00:00:00Z",
  image_url: null,
}));
const feed: NewsFeed = {
  articles,
  updatedAt: "2026-10-18T00:00:00Z",
  stale: false,
  unavailableSources: [],
};
test("initial news payload contains only one small page", () => {
  const page = pageNews(feed);
  assert.equal(page.articles.length, NEWS_PAGE_SIZE);
  assert.equal(page.total, 65);
  assert.equal(page.nextOffset, 21);
  assert.equal(feed.articles.length, 65);
});
test("news pagination does not overlap and stops at the end", () => {
  const all: NewsItem[] = [];
  let offset: number | null = 0;
  while (offset !== null) {
    const page = pageNews(feed, { offset });
    all.push(...page.articles);
    offset = page.nextOffset;
  }
  assert.deepEqual(
    all.map((item) => item.id),
    articles.map((item) => item.id),
  );
  assert.equal(pageNews(feed, { offset: 1000 }).nextOffset, null);
});
test("search and publisher filters cover unloaded headlines before pagination", () => {
  const page = pageNews(feed, { query: "RARE", source: "BBC News" });
  assert.equal(page.total, 1);
  assert.equal(page.articles[0].id, "55");
  assert.equal(page.nextOffset, null);
  assert.equal(pageNews(feed, { query: "not-found" }).total, 0);
});
test("pagination rejects unbounded or malformed API requests", () => {
  for (const q of [
    "limit=0",
    "limit=101",
    "limit=-1",
    "limit=1.5",
    "offset=-1",
    "offset=Infinity",
    "offset=1000001",
    "source=unknown",
    `q=${"x".repeat(161)}`,
  ])
    assert.throws(() => parsePageOptions(new URLSearchParams(q)), q);
  assert.equal(parsePageOptions(new URLSearchParams()).limit, 21);
  assert.equal(
    parsePageOptions(new URLSearchParams("limit=100&offset=42")).offset,
    42,
  );
});
test("image optimization is restricted to publisher hosts", () => {
  for (const src of [
    "https://ichef.bbci.co.uk/a.jpg",
    "https://i.guim.co.uk/a.jpg",
    "/placeholder.png",
  ])
    assert.ok(optimizableImage(src));
  for (const src of [
    "https://ichef.bbci.co.uk.evil.example/a.jpg",
    "http://i.guim.co.uk/a.jpg",
    "https://unknown.example/a.jpg",
    "//unknown.example/a.jpg",
    "bad",
  ])
    assert.equal(optimizableImage(src), false);
});
test("only four small local font files receive critical preload priority", () => {
  assert.equal(fontPreloads.length, 4);
  let bytes = 0;
  for (const path of fontPreloads) {
    assert.match(path, /^\/fonts\/[\w-]+-[a-f0-9]{8}\.woff2$/);
    bytes += fs.statSync(`public${path}`).size;
  }
  assert.ok(bytes < 100000, `Critical font payload: ${bytes}`);
  const css = fs.readFileSync("app/fonts.css", "utf8");
  assert.equal((css.match(/@font-face/g) || []).length, 16);
  assert.equal(/fonts\.googleapis|fonts\.gstatic/.test(css), false);
});

test("bookmark snapshots are reused and corrupted storage does not restore old data", async (t) => {
  const { readBookmarks, toggleBookmark, subscribeBookmarks } =
    await import("../lib/bookmarks");
  const windowDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      "window",
    ),
    storageDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      "localStorage",
    );
  let raw = JSON.stringify([articles[0]]);
  const target = new EventTarget();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: target,
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () => raw,
      setItem: (_key: string, value: string) => {
        raw = value;
      },
    },
  });
  t.after(() => {
    if (windowDescriptor)
      Object.defineProperty(globalThis, "window", windowDescriptor);
    else Reflect.deleteProperty(globalThis, "window");
    if (storageDescriptor)
      Object.defineProperty(globalThis, "localStorage", storageDescriptor);
    else Reflect.deleteProperty(globalThis, "localStorage");
  });
  const snapshot = readBookmarks();
  assert.equal(snapshot.length, 1);
  assert.equal(readBookmarks(), snapshot);
  raw = "{broken";
  assert.equal(readBookmarks().length, 0);
  assert.equal(readBookmarks().length, 0);
  raw = "[]";
  readBookmarks();
  let changes = 0;
  const unsubscribe = subscribeBookmarks(() => {
    changes++;
  });
  toggleBookmark(articles[1]);
  assert.equal(changes, 1);
  assert.equal(readBookmarks()[0].id, "1");
  toggleBookmark(articles[1]);
  assert.equal(readBookmarks().length, 0);
  unsubscribe();
});
