# Loading performance

Measured on 18 October 2026, against `next build` / `next start` on the same local machine. The Victorian design and four font families are preserved.

| Payload                           |      Before |    After | Reduction |
| --------------------------------- | ----------: | -------: | --------: |
| Homepage HTML, gzip               |   163,002 B | 19,933 B |     87.8% |
| Homepage stylesheets, gzip        |   144,773 B |  8,920 B |     93.8% |
| Amusements HTML, gzip             |    33,980 B |  6,452 B |     81.0% |
| Sudoku HTML, gzip                 |    30,741 B |  4,046 B |     86.8% |
| Default news API response, gzip   |   122,320 B |  6,667 B |     94.5% |
| Critical font preload tags        |         750 |        4 |     99.5% |
| Critical font files, uncompressed | 6,072,672 B | 98,976 B |     98.4% |

The default API now returns 21 stories per page rather than the entire edition. Search and publisher filters run against every cached story on the server before pagination; older stories remain discoverable. The HTML includes 21 story cards at first render. Additional pages load on demand.

Font CSS now contains 16 font faces instead of 906. Latin and Latin Extended subsets are self-hosted with their original licenses and content-hashed filenames; missing scripts can fall back to system fonts. Four above-the-fold faces are preloaded. Browsers fetch other faces only when needed.

Publisher images use responsive sizes and cached WebP conversion. A sampled 384-pixel BBC image returned a valid 13,794-byte WebP. The lead image receives priority, while other story images are lazy-loaded with reserved dimensions. Remote optimization is restricted to the BBC and Guardian image hosts.

Article/section links no longer trigger automatic bulk page prefetching. Bookmark JSON is parsed once per stored snapshot and shared across buttons. Search requests are debounced and cancelled when superseded. Refreshing is quiet while the page is hidden, and periodic refresh does not collapse an expanded reading list.

## Repeat the check

```sh
npm run build
npm run start -- --port 3010
# In a second terminal:
npm run perf:check -- http://localhost:3010
```

The script warms each route before measuring local request time and checks payload budgets. Byte counts are the response body size and Node gzip encoding, not a full browser transfer measurement. Feed contents vary, and local request times do not represent mobile-network load times, LCP, or a Lighthouse score. External feed/image latency still affects cold requests. Normal Next.js/Node hosting is needed for image optimization.
