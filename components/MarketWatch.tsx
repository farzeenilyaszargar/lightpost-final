'use client';
import Icon from "./Icon";

import { useEffect, useState } from 'react';
import { marketSymbols, type MarketQuote, type MarketSymbol } from '@/lib/markets';

const symbols = Object.keys(marketSymbols) as MarketSymbol[];
const movementClass = (quote?: MarketQuote) => quote?.changePercent == null || quote.changePercent === 0
  ? '' : quote.changePercent > 0 ? 'market-gain' : 'market-loss';
const movement = (quote: MarketQuote) => quote.changePercent == null ? ''
  : ` (${new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'exceptZero' }).format(quote.changePercent)}%)`;
const price = (quote: MarketQuote, value = quote.price) => quote.symbol.startsWith('^')
  ? `${new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value)} pts`
  : new Intl.NumberFormat('en', { style: 'currency', currency: quote.currency, maximumFractionDigits: 2 }).format(value);

export default function MarketWatch() {
  const [selected, setSelected] = useState<MarketSymbol>('^GSPC');
  const [tickerPaused, setTickerPaused] = useState(false);
  const [quotes, setQuotes] = useState<Partial<Record<MarketSymbol, MarketQuote>>>({});
  const [pending, setPending] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setPending(true);
      const results = await Promise.allSettled(symbols.map(async symbol => {
        const response = await fetch(`/api/markets?symbol=${encodeURIComponent(symbol)}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Unavailable');
        return await response.json() as MarketQuote;
      }));
      if (controller.signal.aborted) return;
      // Keep the last successful values visible and label them during outages.
      setQuotes(previous => {
        const next = { ...previous };
        for (const result of results) if (result.status === 'fulfilled') next[result.value.symbol] = result.value;
        return next;
      });
      setFailed(results.some(result => result.status === 'rejected'));
      setPending(false);
    }
    void load();
    const interval = setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 300000);
    return () => { controller.abort(); clearInterval(interval); };
  }, [attempt]);
  const quote = quotes[selected];
  const history = quote?.history ?? [];
  const values = history.map(point => point.close);
  const low = Math.min(...values), high = Math.max(...values);
  const spread = high - low || high * 0.01 || 1;
  const points = history.map((point, index) => `${45 + index / Math.max(history.length - 1, 1) * 700},${180 - (point.close - low) / spread * 150}`).join(' ');
  return (
    <section aria-labelledby="market-watch-title" className="m-5 p-4 border border-border rounded-2xl">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
        <h2 id="market-watch-title" className="font-logo text-2xl">The Market Ledger</h2>
        <label className="text-sm">Market{' '}
          <select value={selected} onChange={event => setSelected(event.target.value as MarketSymbol)} className="bg-background border border-border rounded-full px-3 py-1">
            {symbols.map(symbol => <option key={symbol} value={symbol}>{marketSymbols[symbol]}</option>)}
          </select>
        </label>
      </div>
      <div className="border-y border-border py-3">
        <div className="flex items-center justify-between gap-3 mb-2 text-xs text-string-secondary">
          <p>Latest available prices · % vs previous close · may be delayed</p>
          <button type="button" className="shrink-0 underline underline-offset-4" aria-pressed={tickerPaused} aria-controls="market-price-ticker" onClick={() => setTickerPaused(value => !value)}>
            {tickerPaused ? 'Resume prices' : 'Pause prices'}
          </button>
        </div>
        <div id="market-price-ticker" className={`market-price-ticker${tickerPaused ? ' is-paused' : ''}`} tabIndex={0} role="region" aria-label="Market price ticker. Use Pause prices to stop scrolling.">
          <div className="market-price-belt">
            {[0, 1].map(copy => (
              <ul key={copy} className="market-price-track text-sm" aria-label={copy === 0 ? 'Latest available market prices' : undefined} aria-hidden={copy === 1 ? true : undefined}>
                {symbols.map(symbol => (
                  <li key={symbol}>
                    <span className="font-bold">{marketSymbols[symbol]}</span>{' '}
                    <span className={movementClass(quotes[symbol])}>{quotes[symbol] ? `${price(quotes[symbol]!)}${movement(quotes[symbol]!)}` : pending ? '…' : 'Unavailable'}</span>
                    {quotes[symbol] && <time dateTime={quotes[symbol]!.asOf} className="block text-xs text-string-secondary">{new Date(quotes[symbol]!.asOf).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} IST</time>}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
      {quote ? <>
        <p className="mt-4 font-bold">{quote.name} · <span className={movementClass(quote)}>{price(quote)}{movement(quote)}</span></p>
        <svg viewBox="0 0 800 220" role="img" aria-labelledby="market-chart-title market-chart-description" className="w-full max-h-72 text-string-primary">
          <title id="market-chart-title">{quote.name}: three months of daily closing prices</title>
          <desc id="market-chart-description">{history.length} trading sessions. First close {price(quote, history[0].close)}, last close {price(quote, history[history.length - 1].close)}. Low {price(quote, low)}, high {price(quote, high)}.</desc>
          {[30, 105, 180].map(y => <line key={y} x1="45" x2="745" y1={y} y2={y} stroke="currentColor" opacity="0.15" />)}
          <polyline className={movementClass(quote)} points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <g fill="currentColor" fontSize="12"><text x="45" y="210">{history[0].date.slice(0, 10)}</text><text x="745" y="210" textAnchor="end">{history[history.length - 1].date.slice(0, 10)}</text><text x="755" y="35">{high.toFixed(0)}</text><text x="755" y="180">{low.toFixed(0)}</text></g>
        </svg>
        <p className="text-xs text-string-secondary">Quote as of {new Date(quote.asOf).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })} IST. Daily closing-price chart; quotes may be delayed. Prices refresh every five minutes.</p>
      </> : <p className="py-6 text-sm" role="status">{pending ? 'Loading market prices…' : 'Prices for this market are temporarily unavailable.'}</p>}
      {failed && <p role="status" className="text-xs mt-3">Some prices could not refresh. Any displayed values retain their original timestamps. <button className="underline" disabled={pending} onClick={() => setAttempt(value => value + 1)}>Retry</button></p>}
      <p className="text-xs text-string-secondary mt-3">Source: <a className="underline" href={`https://finance.yahoo.com/quote/${encodeURIComponent(selected)}/history/`} target="_blank" rel="noopener noreferrer">Yahoo Finance <Icon name="arrowUpRight" size={20} className="outbound-icon" /></a></p>
    </section>
  );
}
