'use client';
import { useEffect, useState } from 'react';
import { editionKey } from '@/lib/games/core';
import type { DailyWord } from '@/lib/daily-word';

export default function WordOfDay() {
  const [word, setWord] = useState<DailyWord | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let loadedEdition = '';
    let loading = false;
    async function load() {
      if (loading) return;
      loading = true;
      try {
        const response = await fetch('/api/word-of-the-day', {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
        });
        if (!response.ok) throw new Error('Dictionary unavailable');
        const value: DailyWord = await response.json();
        if (!value.word || !value.definition || value.edition !== editionKey()) throw new Error('Invalid dictionary response');
        if (controller.signal.aborted) return;
        setWord(value);
        setFailed(false);
        loadedEdition = value.edition;
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      } finally { loading = false; }
    }
    void load();
    const refresh = () => {
      if (document.visibilityState === 'visible' && loadedEdition !== editionKey()) void load();
    };
    const interval = setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.abort(); clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [attempt]);
  return (
    <aside aria-labelledby="daily-word-title" className="p-5 border border-border rounded-2xl min-h-44">
      <h2 id="daily-word-title" className="text-xs text-string-secondary mb-2">Word of the Day</h2>
      {word ? <>
        <p className="text-2xl font-black capitalize">{word.word}
          <span className="text-xs ml-2 text-string-secondary font-extralight normal-case">({word.part})</span>
        </p>
        {word.pronunciation && <p className="text-sm text-string-secondary font-extralight">{word.pronunciation}</p>}
        <p className="text-sm text-string-secondary mt-2">{word.definition}</p>
        <p className="text-xs text-string-secondary mt-3">
          {word.fallback ? 'Dictionary unavailable · a Lightpost archive selection' : <>
            <a href={word.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">Wiktionary</a>{' via '}
            <a href="https://dictionaryapi.dev/" target="_blank" rel="noopener noreferrer" className="underline">Free Dictionary API</a>
            {word.license && word.licenseUrl && <> · <a href={word.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">{word.license}</a></>}
          </>}
        </p>
      </> : <p className="text-sm text-string-secondary" role="status">{failed ? 'The dictionary is temporarily unavailable.' : 'Opening today’s dictionary…'}</p>}
      {(failed || word?.fallback) && <button className="text-xs underline mt-2" onClick={() => setAttempt(value => value + 1)}>Try again</button>}
    </aside>
  );
}
