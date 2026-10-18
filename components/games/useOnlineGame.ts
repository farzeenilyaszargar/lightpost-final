'use client';
import { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react';
import { editionKey } from '@/lib/games/core';
import type { PuzzleSource } from '@/lib/online-puzzles';

export function useOnlineGame<T>(api: string, create: (random: () => number) => T, valid: (value: unknown) => value is T) {
  const [state, setState] = useState<T | null>(null);
  const [source, setSource] = useState<PuzzleSource>();
  const [pending, setPending] = useState(false);
  const [round, setRound] = useState(0);
  const controller = useRef<AbortController | null>(null);
  const original = useRef<T | null>(null);
  const load = useCallback(async () => {
    controller.current?.abort();
    const active = new AbortController();
    controller.current = active;
    setPending(true);
    try {
      const response = await fetch(api, { cache: 'no-store', signal: AbortSignal.any([active.signal, AbortSignal.timeout(12000)]) });
      if (!response.ok) throw new Error('Puzzle unavailable');
      const data = await response.json();
      if (!valid(data.state) || typeof data.source?.name !== 'string') throw new Error('Invalid puzzle');
      if (active.signal.aborted) return;
      original.current = data.state;
      setState(data.state);
      setSource(data.source);
    } catch {
      if (active.signal.aborted) return;
      const fallback = create(Math.random);
      original.current = fallback;
      setState(fallback);
      setSource({ name: 'Offline print edition · a local puzzle', url: '', fallback: true });
    } finally {
      if (!active.signal.aborted) { setPending(false); setRound(value => value + 1); }
    }
  }, [api, create, valid]);
  useEffect(() => { void load(); return () => controller.current?.abort(); }, [load]);
  return {
    state: pending ? null : state, source, pending, round, online: true,
    key: `${api}:${round}`, day: editionKey(),
    update: (next: SetStateAction<T>) => setState(old => old === null ? null : typeof next === 'function' ? (next as (value: T) => T)(old) : next),
    newPuzzle: load, daily: load,
    reset: () => { if (original.current) setState(original.current); },
  };
}
