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
    meta?: { symbol?: string; currency?: string; regularMarketPrice?: number; regularMarketTime?: number };
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
  return {
    symbol, name: marketSymbols[symbol], currency: meta.currency,
    price: meta.regularMarketPrice!,
    asOf: new Date(meta.regularMarketTime! * 1000).toISOString(), history,
  };
}
