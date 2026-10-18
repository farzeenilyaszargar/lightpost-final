export const marketSymbols = {
  '^GSPC': 'S&P 500',
  '^IXIC': 'Nasdaq Composite',
  '^NSEI': 'Nifty 50',
  AAPL: 'Apple',
  MSFT: 'Microsoft',
  NVDA: 'Nvidia',
} as const;
export type MarketSymbol = keyof typeof marketSymbols;
export type MarketQuote = {
  symbol: MarketSymbol;
  name: string;
  currency: string;
  price: number;
  changePercent: number | null;
  asOf: string;
  history: { date: string; close: number }[];
};
export function isMarketSymbol(value: string): value is MarketSymbol {
  return Object.hasOwn(marketSymbols, value);
}

// The public chart endpoint needs no credentials. Validate upstream data before
// displaying it; missing quotes must never become zeroes or simulated prices.
export function parseMarketChart(symbol: MarketSymbol, data: unknown): MarketQuote {
  const result = (data as { chart?: { result?: unknown[] } })?.chart?.result?.[0] as {
    meta?: { symbol?: string; currency?: string; regularMarketPrice?: number; regularMarketTime?: number; exchangeTimezoneName?: string; gmtoffset?: number };
    timestamp?: number[];
    indicators?: { quote?: { close?: (number | null)[] }[] };
  } | undefined;
  const meta = result?.meta;
  if (meta?.symbol !== symbol || !Number.isFinite(meta.regularMarketPrice) || !Number.isFinite(meta.regularMarketTime) || !meta.currency) {
    throw new Error('Invalid market quote');
  }
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const history = (result?.timestamp ?? []).flatMap((time, index) => {
    const close = closes[index];
    return Number.isFinite(time) && typeof close === 'number' && Number.isFinite(close) && close > 0
      ? [{ date: new Date(time * 1000).toISOString(), close }] : [];
  });
  if (history.length < 2 || meta.regularMarketPrice! <= 0) throw new Error('Missing price history');
  // Compare trading dates in the exchange's timezone. The last history point
  // may be today's unfinished candle; chartPreviousClose is the range's start.
  const tradingDate = (date: string) => {
    if (meta.exchangeTimezoneName) {
      try {
        return new Intl.DateTimeFormat('en-CA', { timeZone: meta.exchangeTimezoneName, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date));
      } catch { /* Use the supplied exchange offset if its timezone is invalid. */ }
    }
    return Number.isFinite(meta.gmtoffset)
      ? new Date(new Date(date).getTime() + meta.gmtoffset! * 1000).toISOString().slice(0, 10) : null;
  };
  const asOf = new Date(meta.regularMarketTime! * 1000).toISOString();
  const quoteDate = tradingDate(asOf);
  const previousClose = quoteDate ? history.filter(point => {
    const date = tradingDate(point.date);
    return date && date < quoteDate;
  }).sort((a, b) => b.date.localeCompare(a.date))[0]?.close : undefined;
  return {
    symbol, name: marketSymbols[symbol], currency: meta.currency,
    price: meta.regularMarketPrice!,
    changePercent: previousClose ? (meta.regularMarketPrice! / previousClose - 1) * 100 : null,
    asOf, history,
  };
}
