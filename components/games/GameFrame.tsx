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
  return (
    <section className="puzzle-page">
      <Link prefetch={false} href="/fun" className="amusement-back">
        ← Return to the Amusements
      </Link>
      <header className="puzzle-title">
        <p className="amusement-kicker">THE LIGHTPOST • AMUSEMENTS</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <div className="puzzle-layout">
        <div className="puzzle-playing">
          <div className="puzzle-toolbar">{controls}</div>
          {children}
        </div>
        <aside className="puzzle-notes">
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
                <Link key={game.id} href={`/fun/${game.id}`}>
                  {game.name}
                  <span aria-hidden="true"><Icon name="arrowUpRight" size={20} className="outbound-icon" /></span>
                </Link>
              ))}
          </div>
          <p className="puzzle-storage-note">
            {id === "comic"
              ? "Original sketches by Lightpost. External comics are credited to xkcd."
              : "Daily game progress is kept in this browser. No account required."}
          </p>
        </aside>
      </div>
    </section>
  );
}
export function PuzzleControls({
  round,
  newPuzzle,
  daily,
  children,
}: {
  round: number;
  newPuzzle: () => void;
  daily: () => void;
  children?: ReactNode;
}) {
  return (
    <>
      <span className="puzzle-edition">
        {round === 0 ? "Today’s puzzle" : `Free play · No. ${round}`}
      </span>
      <div className="puzzle-controls">
        {children}
        {round > 0 && <button onClick={daily}>Today&apos;s puzzle</button>}
        <button onClick={newPuzzle}>Another puzzle ↻</button>
      </div>
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
