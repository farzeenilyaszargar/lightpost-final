# Lightpost

A responsive news reader built with Next.js 15, React 19, TypeScript, and Tailwind CSS 4. News comes from the public BBC News and Guardian RSS feeds. **No API keys, database, account, or environment variables are needed.**

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

`GET /api/news` returns all topics. `GET /api/news?topic=technology` returns one topic.

Topics: `world`, `politics`, `business`, `technology`, `science`, `sports`, `entertainment`.

```json
{
  "articles": [],
  "updatedAt": null,
  "stale": false,
  "unavailableSources": []
}
```

Articles include `id`, `title`, `description`, `published_at`, `image_url`, `topic`, `slug`, `source`, and `source_url`. Unknown topics return 400. Total source unavailability without a saved edition returns 503. The response uses five-minute shared-cache headers.

## Reading experience

- Server-rendered latest and topic editions with search, source filtering, and incremental story loading.
- Responsive navigation, light/dark themes, loading and error states, keyboard focus indicators, and reduced-motion support.
- Bookmarks stored only in the current browser (up to 200). No login or tracking identity.
- Publisher attribution and direct original-report links on cards and article pages.
- A break room with Sudoku, hangman, math, solvable sliding puzzles, chess, and xkcd comics. Comics use a same-origin proxy to the official xkcd JSON endpoint; chess depends on ChessPuzzle's public daily endpoint and shows an outage state when unavailable.

The previous Supabase/OpenAI ingestion jobs, fake bias ratings, database reaction counters, sample news fallback, ad injection, and unused stock endpoints have been removed. Any old deployed environment keys can be removed from hosting settings. The `supabase/` SQL migration is retained only as historical reference and is not used by this app.

## Checks

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm start
```

Tests cover feed normalization, unsafe URLs, dates, deduplication, image selection, partial/total outages, last-good behavior, and sliding-puzzle solvability.

## Sources

- [BBC feeds](https://support.bbc.co.uk/platform/feeds/NewsFeeds.htm)
- [Guardian RSS feeds](https://www.theguardian.com/help/feeds)
- [xkcd JSON interface](https://xkcd.com/json.html)

Publisher content remains credited to its source. Feeds are externally maintained and their availability and contents can change.
