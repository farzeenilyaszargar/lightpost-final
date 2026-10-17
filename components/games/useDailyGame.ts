"use client";
import { useEffect, useState, type SetStateAction } from "react";
import { editionKey, seededRandom } from "@/lib/games/core";
export const PROGRESS_EVENT = "lightpost-puzzle-progress";
export function useDailyGame<T>(
  id: string,
  create: (random: () => number) => T,
  valid: (value: unknown) => value is T,
) {
  const [day, setDay] = useState("");
  const [round, setRound] = useState(0);
  const [snapshot, setSnapshot] = useState<{ key: string; value: T } | null>(
    null,
  );
  useEffect(() => {
    const refresh = () => setDay(editionKey());
    refresh();
    const interval = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  const key = day ? `lightpost-puzzle-v1:${id}:${day}:${round}` : "";
  useEffect(() => {
    if (!key) return;
    let value: T | undefined;
    if (round === 0)
      try {
        const stored: unknown = JSON.parse(localStorage.getItem(key) || "null");
        if (valid(stored)) value = stored;
      } catch {
        /* A private browser may not offer storage. */
      }
    setSnapshot({ key, value: value ?? create(seededRandom(key)) });
  }, [key, round, create, valid]);
  useEffect(() => {
    if (!snapshot || snapshot.key !== key || round !== 0) return;
    try {
      localStorage.setItem(key, JSON.stringify(snapshot.value));
    } catch {
      /* Play continues without persistence. */
    }
  }, [snapshot, key, round]);
  function update(next: SetStateAction<T>) {
    setSnapshot((previous) =>
      previous && previous.key === key
        ? {
            ...previous,
            value:
              typeof next === "function"
                ? (next as (old: T) => T)(previous.value)
                : next,
          }
        : previous,
    );
  }
  return {
    state: snapshot?.key === key ? snapshot.value : null,
    update,
    key,
    day,
    round,
    newPuzzle: () => setRound((n) => n + 1),
    daily: () => setRound(0),
    reset: () => {
      if (key) setSnapshot({ key, value: create(seededRandom(key)) });
    },
  };
}
export function useMarkComplete(
  id: string,
  complete: boolean,
  daily: boolean,
  day: string,
) {
  useEffect(() => {
    if (!complete || !daily || day !== editionKey()) return;
    try {
      const key = `lightpost-completed:${editionKey()}`;
      const stored: unknown = JSON.parse(localStorage.getItem(key) || "[]");
      const items = Array.isArray(stored)
        ? stored.filter((item) => typeof item === "string")
        : [];
      if (!items.includes(id)) {
        localStorage.setItem(key, JSON.stringify([...items, id]));
        window.dispatchEvent(new Event(PROGRESS_EVENT));
      }
    } catch {
      /* Completion is still shown on the game. */
    }
  }, [id, complete, daily, day]);
}
