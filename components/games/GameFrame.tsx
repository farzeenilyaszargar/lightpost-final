"use client";
import { useState } from "react";
import type { PuzzleSource } from "@/lib/online-puzzles";
import Icon from "../Icon";
import Link from "next/link";
import type { ReactNode } from "react";
import { gameList } from "@/lib/games/core";
export default function GameFrame({
  id,
  title,
  description,
  rules,
  children,
  controls,
  aside,
}: {
  id: string;
  title: string;
  description: string;
  rules: string[];
  children: ReactNode;
  controls?: ReactNode;
  aside?: ReactNode;
}) {
  const [showRules, setShowRules] = useState(false);
  return (
    <section className="puzzle-page" data-game={id}>
      <header className="puzzle-title">
        <button className="puzzle-rules-toggle" aria-expanded={showRules} aria-controls="puzzle-instructions" onClick={() => setShowRules(value => !value)}>{showRules ? "Close rules" : "Rules & more"}</button>
        <p className="amusement-kicker">THE LIGHTPOST • AMUSEMENTS</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <div className="puzzle-layout">
        <div className="puzzle-playing">
          <div className="puzzle-toolbar">{controls}</div>
          {children}
        </div>
        <aside id="puzzle-instructions" className={`puzzle-notes${showRules ? " is-open" : ""}`}>
          <h2>A word of instruction</h2>
          <ol>
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
          {aside}
          <div className="puzzle-more">
            <h2>Another diversion?</h2>
            {gameList
              .filter((game) => game.id !== id)
              .map((game) => (
                <Link prefetch={false} key={game.id} href={`/fun/${game.id}`}>
                  {game.name}
                  <span aria-hidden="true"><Icon name="arrowUpRight" size={20} className="outbound-icon" /></span>
                </Link>
              ))}
          </div>
          <p className="puzzle-storage-note">
            {id === "comic"
              ? "xkcd by Randall Munroe · CC BY-NC 2.5. Print sketches by Lightpost."
              : "No daily play limit. Online editions use free sources; printed puzzles remain available offline."}
          </p>
        </aside>
      </div>
    </section>
  );
}
export function PuzzleControls({ game, children }: {
  game: {
    round: number;
    newPuzzle: () => void;
    daily: () => void;
    source?: PuzzleSource;
    pending?: boolean;
    online?: boolean;
  };
  children?: ReactNode;
}) {
  const { round, newPuzzle, daily, source, pending = false, online = false } = game;
  return (
    <>
      <span className="puzzle-edition">
        {online ? `Open edition · No. ${round || 1}` : round === 0 ? "Today’s puzzle" : `Free play · No. ${round}`}
      </span>
      <div className="puzzle-controls">
        {children}
        {!online && round > 0 && <button onClick={daily}>Today&apos;s puzzle</button>}
        <button className="puzzle-next" disabled={pending} onClick={newPuzzle}>{pending ? "Fetching the next edition…" : "Next puzzle →"}</button>
      </div>
      {source && <p className="puzzle-source">{source.fallback ? "The wire is down · " : "Source: "}{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.name}</a> : source.name}</p>}
    </>
  );
}
export function PuzzleLoading() {
  return (
    <div className="puzzle-loading" role="status">
      Setting the puzzle…
    </div>
  );
}
