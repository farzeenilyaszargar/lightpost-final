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
