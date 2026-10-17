"use client";
import { useEffect, useState } from "react";
import { editionKey, gameList } from "@/lib/games/core";
import { PROGRESS_EVENT } from "./useDailyGame";
export default function DailyProgress() {
  const [complete, setComplete] = useState<string[]>([]);
  useEffect(() => {
    function sync() {
      try {
        const stored: unknown = JSON.parse(
          localStorage.getItem(`lightpost-completed:${editionKey()}`) || "[]",
        );
        setComplete(
          Array.isArray(stored)
            ? stored.filter((item): item is string => typeof item === "string")
            : [],
        );
      } catch {
        setComplete([]);
      }
    }
    sync();
    const interval = window.setInterval(sync, 60_000);
    window.addEventListener("storage", sync);
    window.addEventListener(PROGRESS_EVENT, sync);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", sync);
      window.removeEventListener(PROGRESS_EVENT, sync);
    };
  }, []);
  return (
    <div className="amusement-progress">
      <span>Your daily diversions</span>
      <div>
        {gameList
          .filter((game) => game.id !== "comic")
          .map((game) => (
            <span
              key={game.id}
              className={complete.includes(game.id) ? "complete" : ""}
              title={`${game.name}: ${complete.includes(game.id) ? "completed" : "not completed"}`}
              aria-label={`${game.name}: ${complete.includes(game.id) ? "completed" : "not completed"}`}
            >
              {complete.includes(game.id) ? "✓" : "◇"}
            </span>
          ))}
      </div>
      <small>
        {
          gameList.filter(
            (game) => game.id !== "comic" && complete.includes(game.id),
          ).length
        }{" "}
        of 5 completed · saved on this device
      </small>
    </div>
  );
}
