import assert from 'node:assert/strict';
import test from 'node:test';
import { isMarketSymbol, parseMarketChart } from '../lib/markets';

const chart = (closes: (number | null)[] = [100, null, 105]) => ({ chart: { result: [{
  meta: { symbol: 'AAPL', currency: 'USD', regularMarketPrice: 106, regularMarketTime: 1720000000 },
  timestamp: [1719800000, 1719900000, 1720000000],
  indicators: { quote: [{ close: closes }] },
}] } });

test('market symbols allow only supported instruments, never arbitrary URLs or prototype properties', () => {
  for (const symbol of ['AAPL', '^GSPC', '^NSEI']) assert.equal(isMarketSymbol(symbol), true);
  for (const symbol of ['https://example.com', '../AAPL', '__proto__', 'toString', 'aapl']) assert.equal(isMarketSymbol(symbol), false);
});
test('market parser retains real timestamps, currency, and closes without turning gaps into zeroes', () => {
  const quote = parseMarketChart('AAPL', chart());
  assert.equal(quote.price, 106);
  assert.equal(quote.currency, 'USD');
  assert.equal(quote.asOf, new Date(1720000000 * 1000).toISOString());
  assert.deepEqual(quote.history.map(point => point.close), [100, 105]);
});
test('market parser rejects source errors and mismatched instruments', () => {
  for (const data of [null, {}, { chart: { error: { code: 'Not Found' }, result: null } }]) {
    assert.throws(() => parseMarketChart('AAPL', data));
  }
  assert.throws(() => parseMarketChart('MSFT', chart()));
});
test('market parser rejects unusable histories and non-finite quotes', () => {
  assert.throws(() => parseMarketChart('AAPL', chart([null, null, null])));
  assert.throws(() => parseMarketChart('AAPL', chart([100, null, null])));
  const data = chart();
  data.chart.result[0].meta.regularMarketPrice = NaN;
  assert.throws(() => parseMarketChart('AAPL', data));
});

test('daily movement uses the previous trading close rather than the three-month opening', () => {
  for (const [current, expected] of [[110, 10], [90, -10], [100, 0]]) {
    const data = { chart: { result: [{
      meta: { symbol: 'AAPL', currency: 'USD', regularMarketPrice: current,
        regularMarketTime: Date.parse('2026-10-19T15:00:00Z') / 1000,
        exchangeTimezoneName: 'America/New_York', chartPreviousClose: 50 },
      timestamp: ['2026-10-15T13:30:00Z', '2026-10-16T13:30:00Z', '2026-10-19T13:30:00Z'].map(date => Date.parse(date) / 1000),
      indicators: { quote: [{ close: [80, 100, current] }] },
    }] } };
    assert.ok(Math.abs(parseMarketChart('AAPL', data).changePercent! - expected) < 1e-10);
    // A missing current candle must still compare to Friday, not Thursday.
    data.chart.result[0].indicators.quote[0].close.pop();
    assert.ok(Math.abs(parseMarketChart('AAPL', data).changePercent! - expected) < 1e-10);
  }
});

test('movement respects the quote session and exchange date across UTC midnight', () => {
  const data = { chart: { result: [{
    meta: { symbol: 'AAPL', currency: 'USD', regularMarketPrice: 110,
      regularMarketTime: Date.parse('2026-10-17T00:00:00Z') / 1000,
      exchangeTimezoneName: 'America/New_York', gmtoffset: -14400 },
    timestamp: ['2026-10-15T13:30:00Z', '2026-10-16T13:30:00Z'].map(date => Date.parse(date) / 1000),
    indicators: { quote: [{ close: [100, 110] }] },
  }] } };
  assert.ok(Math.abs(parseMarketChart('AAPL', data).changePercent! - 10) < 1e-10);
  data.chart.result[0].meta.exchangeTimezoneName = 'invalid';
  assert.ok(Math.abs(parseMarketChart('AAPL', data).changePercent! - 10) < 1e-10);
});

test('missing exchange information leaves movement unknown instead of inventing a gain', () => {
  assert.equal(parseMarketChart('AAPL', chart()).changePercent, null);
});
