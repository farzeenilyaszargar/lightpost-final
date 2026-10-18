import { editionKey } from './games/core';

// A readable daily selection; all dictionary text comes from Free Dictionary API.
const vocabulary = [
  'serendipity', 'eloquent', 'resilient', 'inquisitive', 'lucid', 'discern',
  'nuance', 'perspective', 'benevolent', 'ephemeral', 'diligent', 'candour',
  'tenacious', 'tranquil', 'curiosity', 'luminous', 'harmony', 'ingenious',
  'fortitude', 'whimsical', 'sagacious', 'mellifluous', 'equanimity', 'vivid',
  'jubilant', 'ardent', 'candid', 'perceptive', 'radiant', 'steadfast',
  'verdant', 'wonder', 'eloquence', 'empathy', 'clarity', 'aspiration',
];
export type DailyWord = {
  word: string;
  pronunciation: string;
  definition: string;
  part: string;
  edition: string;
  fallback: boolean;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
};
export function dailySelection(date = new Date()) {
  const edition = editionKey(date);
  const day = Math.floor(Date.parse(edition) / 86400000);
  return { edition, word: vocabulary[day % vocabulary.length] };
}
function safeText(value: unknown, max: number) {
  return typeof value === 'string' && value.trim().length <= max ? value.trim() : '';
}
export function parseDailyWord(data: unknown, expected: string, edition: string): DailyWord {
  if (!Array.isArray(data)) throw new Error('Invalid dictionary entry');
  for (const entry of data) {
    if (!entry || typeof entry !== 'object' || entry.word?.toLowerCase() !== expected) continue;
    const meanings = Array.isArray(entry.meanings) ? entry.meanings : [];
    for (const meaning of meanings) {
      const part = safeText(meaning?.partOfSpeech, 50);
      const definitions = Array.isArray(meaning?.definitions) ? meaning.definitions : [];
      const definition = definitions.map((item: { definition?: unknown } | null) => safeText(item?.definition, 1000)).find(Boolean);
      if (!part || !definition) continue;
      const phonetics = Array.isArray(entry.phonetics) ? entry.phonetics : [];
      const pronunciation = safeText(entry.phonetic, 150) || phonetics.map((item: { text?: unknown } | null) => safeText(item?.text, 150)).find(Boolean) || '';
      // Link only to trusted dictionary and license hosts, never arbitrary upstream URLs.
      const licenseUrl = safeText(entry.license?.url, 200);
      const license = safeText(entry.license?.name, 80);
      return {
        word: expected, pronunciation, definition, part, edition, fallback: false,
        sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(expected)}`,
        license,
        licenseUrl: /^https:\/\/creativecommons\.org\/licenses\/[a-z0-9/.-]+$/i.test(licenseUrl) ? licenseUrl : '',
      };
    }
  }
  throw new Error('No usable dictionary definition');
}
export async function fetchDailyWord(fetcher: typeof fetch = fetch, date = new Date()): Promise<DailyWord> {
  const { word, edition } = dailySelection(date);
  try {
    const response = await fetcher(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, {
      next: { revalidate: 86400 }, signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) throw new Error('Dictionary unavailable');
    return parseDailyWord(await response.json(), word, edition);
  } catch {
    return {
      word: 'lucid', pronunciation: '/ˈluːsɪd/', part: 'adjective',
      definition: 'Expressed clearly and easily understood.', edition, fallback: true,
      sourceUrl: '', license: '', licenseUrl: '',
    };
  }
}
