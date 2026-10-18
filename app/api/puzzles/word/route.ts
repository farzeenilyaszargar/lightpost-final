import { NextResponse } from 'next/server';
import { parseDailyWord } from '@/lib/daily-word';
import { shuffled } from '@/lib/games/core';
import { makeWord, dictionaryClue } from '@/lib/games/words';
export async function GET() {
  try {
    const response = await fetch('https://random-word-api.herokuapp.com/word?number=100&length=7', { next: { revalidate: 300 }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('Word source unavailable');
    const words: unknown = await response.json();
    if (!Array.isArray(words)) throw new Error('Invalid words');
    for (const word of shuffled(words.filter((word): word is string => typeof word === 'string' && /^[a-z]{5,10}$/.test(word)), Math.random).slice(0, 4)) {
      try {
        const dictionary = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(1500) });
        if (!dictionary.ok) continue;
        const entry = parseDailyWord(await dictionary.json(), word, 'free-play');
        const clue = dictionaryClue(entry.definition, word);
        return NextResponse.json({ state: { word, clue, guessed: [], hintUsed: false }, source: { name: `Wiktionary · ${entry.license || 'Free Dictionary API'}`, url: entry.sourceUrl } }, { headers: { 'Cache-Control': 'no-store' } });
      } catch { /* Try another valid dictionary word. */ }
    }
  } catch { /* A local puzzle keeps the press running during an outage. */ }
  return NextResponse.json({ state: makeWord(Math.random), source: { name: 'Offline print edition · Lightpost wordbook', url: '', fallback: true } }, { headers: { 'Cache-Control': 'no-store' } });
}
