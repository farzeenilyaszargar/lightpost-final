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

- Latest and category editions use four flowing newspaper columns. The front-page lead spans the middle two columns, and Word of the Day stays at the top right.
- The original LIGHTPOST masthead, four font families, monochrome themes, bordered frame and rounded cards remain. Section headings, search and update toolbars are omitted; only the market-price ticker scrolls.
- Bookmarks stay in the current browser. Publisher cards link directly to their original reports.
- The Amusements index and each activity occupy one dynamic viewport, including the masthead and navigation. Controls stay compact; unusually small viewports, lengthy rules and comic captions can scroll inside the activity instead of extending the page.
- Comics open the latest xkcd automatically. Next and Previous browse the numbered archive, skip the deliberately missing #404, and wrap around at the ends. Source links and Randall Munroe attribution remain visible.
- Chess fetches fresh Lichess tactics without authentication. Positions and complete UCI solutions are validated using `chess.js`. Both colours, automatic opponent replies, promotion, hints, reveal and replay are supported; any mating move wins a mate-in-one puzzle.
- Sudoku fetches Dosuku boards and validates their solutions. Ambiguous boards receive extra solution clues until unique. The difficulty selector applies to the local fallback when the online source cannot be reached.
- The Missing Word uses Random Word API and Free Dictionary API, with adapted, credited Wiktionary clues. Arithmetic and sliding puzzles generate fresh rounds locally and retain their daily progress.
- Every activity has a Next control with no app-imposed daily cap. External archives are finite and providers can rate-limit requests. Labeled local print editions keep puzzles playable during outages; the sketchbook is a small local comic fallback.
- Old advertising scripts, Supabase browser access and the sample-news fallback have been removed. The `supabase/` migration is retained only as historical reference.

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

Tests cover news normalization and outages, pagination, daily edition boundaries, source parsing, unique Sudoku validation and repair, complete online chess lines and alternate mates, word clues, comic archive navigation, arithmetic, and sliding-puzzle solvability/undo.

## Sources

- [BBC feeds](https://support.bbc.co.uk/platform/feeds/NewsFeeds.htm)
- [Guardian RSS feeds](https://www.theguardian.com/help/feeds)
- [xkcd JSON interface and attribution](https://xkcd.com/about/)
- [Lichess API](https://lichess.org/api) and [CC0 puzzles](https://database.lichess.org/#puzzles)
- [Dosuku](https://sudoku-api.vercel.app/)
- [Random Word API](https://github.com/RazorSh4rk/random-word-api) and [Free Dictionary API](https://dictionaryapi.dev/)

Publisher content remains credited to its source. Feeds are externally maintained and their availability and contents can change.

## Loading performance

The four original font families are self-hosted with Latin and Latin Extended subsets and their OFL licenses in `public/fonts/`. Only four critical faces are preloaded; all font filenames contain content hashes and receive immutable cache headers. No font provider request is required at build time or in the browser.

The first news render includes 21 stories. Load more and automatic refresh fetch small API pages. News pages omit the update toolbar and source filter. Article and section links do not prefetch entire collections. Publisher images use responsive WebP optimization on an explicit host allowlist, reserve their layout space, and load lazily except for the lead image. Image optimization requires the normal Node/Next.js server or compatible hosting.

`npm run perf:check` guards production HTML, stylesheet, initial story count, preload count, and API payload budgets. [Measured before/after results](docs/performance.md) describe the scope and limitations of the local comparison.

## Market Ledger

The Markets edition loads a small SVG chart and a scrolling ticker of stock and index prices on demand. Only this price ticker scrolls; section headings remain stationary. The ticker pauses on hover, keyboard focus, or its Pause prices button, and stays stationary for reduced-motion preferences. News listings use four flowing columns on desktop, two on tablets, and one on narrow screens. On the front page, the lead story spans the two middle columns at the top, with smaller stories stacked to either side and two flowing columns beneath the lead.

`/api/markets?symbol=AAPL` serves allowlisted symbols only (S&P 500, Nasdaq Composite, Nifty 50, Apple, Microsoft, Nvidia). It uses Yahoo Finance's public, unofficial chart endpoint without an API key or paid account. This endpoint is externally maintained and can change or rate-limit requests. Quotes cache for five minutes, carry their original market timestamps and currencies, and may be delayed. The chart displays three months of daily closing prices. Source failures show an unavailable message; a browser retains its last successful quote with the original timestamp. No simulated prices are used.

## Word of the Day

The top card in the front page’s rightmost column fetches `/api/word-of-the-day`. A curated vocabulary selects the edition’s word at midnight in India; its definition, part of speech, and pronunciation come from [Free Dictionary API](https://dictionaryapi.dev/) without a key or account. Dictionary entries cache for a day, while the small API response expires at the next edition boundary. Source and license links accompany each definition. The widget loads independently of headlines and checks for a new edition while open. If the dictionary fails, it labels a local archive selection clearly and offers Retry.
