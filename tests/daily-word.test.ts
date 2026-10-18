import test from 'node:test';
import assert from 'node:assert/strict';
import { dailySelection, fetchDailyWord, parseDailyWord } from '../lib/daily-word';

const date = new Date('2026-10-18T19:00:00Z');
const selection = dailySelection(date);
const entry = [{
  word: selection.word,
  phonetics: [{ text: '/example/' }],
  meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: 'A useful dictionary definition.' }] }],
  license: { name: 'CC BY-SA 3.0', url: 'https://creativecommons.org/licenses/by-sa/3.0' },
}];
test('daily vocabulary stays stable within an Indian edition and changes at midnight', () => {
  assert.equal(dailySelection(new Date('2026-10-18T18:29:59Z')).edition, '2026-10-18');
  assert.equal(dailySelection(new Date('2026-10-18T18:30:00Z')).edition, '2026-10-19');
  assert.deepEqual(selection, dailySelection(new Date('2026-10-19T10:00:00Z')));
  assert.notEqual(dailySelection(new Date('2026-10-18T18:29:59Z')).word, selection.word);
});
test('dictionary parser extracts real definition, phonetics and license', () => {
  const result = parseDailyWord(entry, selection.word, selection.edition);
  assert.equal(result.definition, 'A useful dictionary definition.');
  assert.equal(result.pronunciation, '/example/');
  assert.equal(result.fallback, false);
  assert.equal(result.sourceUrl, `https://en.wiktionary.org/wiki/${selection.word}`);
});
test('dictionary parser rejects malformed entries and excludes unsafe license URLs', () => {
  for (const value of [null, {}, [], [{ word: 'wrong' }], [{ word: selection.word, meanings: [{}] }]]) {
    assert.throws(() => parseDailyWord(value, selection.word, selection.edition));
  }
  const malicious = structuredClone(entry);
  malicious[0].license.url = 'javascript:alert(1)';
  assert.equal(parseDailyWord(malicious, selection.word, selection.edition).licenseUrl, '');
});
test('daily fetch uses the free dictionary and returns an honest fallback for outages', async () => {
  const good = await fetchDailyWord((async (url: string) => {
    assert.equal(url, `https://api.dictionaryapi.dev/api/v2/entries/en/${selection.word}`);
    return Response.json(entry);
  }) as typeof fetch, date);
  assert.equal(good.fallback, false);
  for (const response of [Response.json({}, { status: 503 }), Response.json({})]) {
    const fallback = await fetchDailyWord((async () => response) as typeof fetch, date);
    assert.equal(fallback.fallback, true);
    assert.equal(fallback.sourceUrl, '');
    assert.equal(fallback.edition, selection.edition);
  }
});
