# Lightpost

A news reader with the original monochrome, serif newspaper layout, built with Next.js 15, React 19, TypeScript, and Tailwind CSS 4. News comes from the public BBC News and Guardian RSS feeds. **No API keys, database, account, or environment variables are needed.**

## Run locally

Use Node.js 22 LTS or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. If another project uses that port:

```sh
npm run dev -- --port 3001
```

## News system

- `lib/rss.ts` fetches the fixed publisher feed URLs in parallel with eight-second timeouts, checks responses, and parses RSS. It uses only feed-provided headlines, excerpts, images, dates, and original article links.
- `lib/news-utils.ts` normalizes text/URLs, creates stable IDs, deduplicates URLs and headlines, and sorts newest first. Invalid dates and non-HTTPS article links are rejected.
- `lib/news.ts` shares five-minute Next.js caches across the API and server-rendered pages. Topic requests are coalesced. If both publishers fail, a bounded in-memory last-good edition can be returned with a stale flag. This last-good memory does not survive a process restart or cross server instances. The UI clearly reports outages; it never substitutes fabricated news.
- A failure in one source does not take down other sources or topics. No arbitrary upstream URL can be supplied by visitors.
- Article pages show the publisher's feed excerpt and link to the full report. Older articles eventually leave RSS feeds and may no longer have a local preview; bookmarked stories retain a direct link to the publisher.

### JSON API

`GET /api/news` returns the first 21 headlines across all topics. `GET /api/news?topic=technology` returns the first page of one topic.

Use `offset=21` for the next page; `limit` is 1–100 (default 21). Search the complete cached edition using `q`, and filter using `source=BBC News` or `source=The Guardian`. Search and filtering happen before pagination. Example: `/api/news?topic=science&q=space&limit=21&offset=0`.

Topics: `world`, `politics`, `business`, `technology`, `science`, `sports`, `entertainment`.

```json
{
  "articles": [],
  "updatedAt": null,
  "stale": false,
  "unavailableSources": [],
  "total": 0,
  "nextOffset": null
}
```

Articles include `id`, `title`, `description`, `published_at`, `image_url`, `topic`, `slug`, `source`, and `source_url`. Unknown topics return 400. Total source unavailability without a saved edition returns 503. The response uses five-minute shared-cache headers and a short browser cache. Invalid limits, offsets, and source filters return 400.

## Reading experience

- Server-rendered latest and topic editions with search, source filtering, and incremental story loading.
- Responsive navigation, light/dark themes, loading and error states, keyboard focus indicators, and reduced-motion support.
- Bookmarks stored only in the current browser (up to 200). No login or tracking identity.
- Publisher attribution and direct original-report links on cards and article pages.
- The original LIGHTPOST masthead, four font families, monochrome themes, bordered page frame, four-column home layout, rounded cards, introductory banner, and scrolling section titles.
- A word-of-the-day sidebar using a small local vocabulary list; no AI request or database is involved.
- A Victorian Amusements supplement with five playable daily games and the Funny Papers. The original masthead, fonts, colours, and news layout are preserved.
- Sudoku puzzles have exactly one solution and three difficulty settings. Word games use a curated clue bank. Arithmetic accepts every valid operator and checks only when requested. Sliding tiles support legal moves, arrow keys, and undo. Chess uses `chess.js` to validate moves and local mate-in-one positions, with no external chess API.
- Daily puzzles are deterministic for an edition date (Asia/Kolkata). Daily progress and completion marks stay in this browser; free-play rounds do not overwrite the daily game. Browser storage is optional.
- Original Lightpost comic panels open immediately. Optional xkcd comics use the existing same-origin proxy, with timeouts and a local alternative when the provider or image fails.

The previous Supabase/OpenAI ingestion jobs, fake bias ratings, database reaction counters, sample news fallback, ad injection, and unused stock endpoints have been removed. Any old deployed environment keys can be removed from hosting settings. The `supabase/` SQL migration is retained only as historical reference and is not used by this app.

## Checks

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm start
# Against a running production server:
npm run perf:check -- http://localhost:3000
```

Tests cover feed normalization, unsafe URLs, deduplication, source outages, daily seeds and edition boundaries, unique Sudoku solutions, word-game terminal states, arithmetic validation, every chess problem’s mating move, and sliding-puzzle solvability/undo.

## Sources

- [BBC feeds](https://support.bbc.co.uk/platform/feeds/NewsFeeds.htm)
- [Guardian RSS feeds](https://www.theguardian.com/help/feeds)
- [xkcd JSON interface](https://xkcd.com/json.html)

Publisher content remains credited to its source. Feeds are externally maintained and their availability and contents can change.

## Loading performance

The four original font families are self-hosted with Latin and Latin Extended subsets and their OFL licenses in `public/fonts/`. Only four critical faces are preloaded; all font filenames contain content hashes and receive immutable cache headers. No font provider request is required at build time or in the browser.

The first news render includes 21 stories. Load more, search, and publisher filters fetch small API pages; search still covers every cached story. Article and section links do not prefetch entire collections. Publisher images use responsive WebP optimization on an explicit host allowlist, reserve their layout space, and load lazily except for the lead image. Image optimization requires the normal Node/Next.js server or compatible hosting.

`npm run perf:check` guards production HTML, stylesheet, initial story count, preload count, and API payload budgets. [Measured before/after results](docs/performance.md) describe the scope and limitations of the local comparison.

## Market Ledger

The Markets edition loads a small SVG chart and a static list of prices on demand. All section headings and prices are stationary; there are no marquees. News listings use four flowing columns on desktop, two on tablets, and one on narrow screens.

`/api/markets?symbol=AAPL` serves allowlisted symbols only (S&P 500, Nasdaq Composite, Nifty 50, Apple, Microsoft, Nvidia). It uses Yahoo Finance's public, unofficial chart endpoint without an API key or paid account. This endpoint is externally maintained and can change or rate-limit requests. Quotes cache for five minutes, carry their original market timestamps and currencies, and may be delayed. The chart displays three months of daily closing prices. Source failures show an unavailable message; a browser retains its last successful quote with the original timestamp. No simulated prices are used.
