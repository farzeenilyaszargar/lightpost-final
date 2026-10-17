"use client";
import { useRef } from "react";
import GameFrame, {
  PuzzleControls,
  PuzzleLoading,
} from "@/components/games/GameFrame";
import { useDailyGame, useMarkComplete } from "@/components/games/useDailyGame";
import {
  shuffleTiles,
  canSlide,
  slideTile,
  isSlidingSolved,
} from "@/lib/sliding-puzzle";
import { isNumberArray } from "@/lib/games/core";
type State = { tiles: number[]; history: number[][]; moves: number };
const create = (random: () => number): State => ({
  tiles: shuffleTiles(3, random),
  history: [],
  moves: 0,
});
function valid(value: unknown): value is State {
  if (!value || typeof value !== "object") return false;
  const s = value as State;
  const board = (v: unknown) =>
    isNumberArray(v, 9, 8) && new Set(v as number[]).size === 9;
  return (
    board(s.tiles) &&
    Array.isArray(s.history) &&
    s.history.length <= 200 &&
    s.history.every(board) &&
    Number.isInteger(s.moves) &&
    s.moves >= 0
  );
}
export default function Sliding() {
  const game = useDailyGame("sliding", create, valid);
  const s = game.state,
    done = !!s && isSlidingSolved(s.tiles);
  const board = useRef<HTMLDivElement>(null);
  useMarkComplete("sliding", done, game.round === 0, game.day);
  function move(i: number) {
    if (!s || done || !canSlide(s.tiles, i)) return;
    game.update((old) => ({
      ...old,
      tiles: slideTile(old.tiles, i),
      history: [...old.history, old.tiles].slice(-200),
      moves: old.moves + 1,
    }));
  }
  function undo() {
    game.update((old) =>
      old.history.length
        ? {
            tiles: old.history.at(-1)!,
            history: old.history.slice(0, -1),
            moves: Math.max(0, old.moves - 1),
          }
        : old,
    );
  }
  return (
    <GameFrame
      id="sliding"
      title="The Sliding Square"
      description="Eight tiles have fallen out of order. Restore a little harmony to the page."
      rules={[
        "Arrange the numbers from 1 to 8, reading left to right, with the empty space at the bottom right.",
        "Only a tile touching the empty square may move. Tap it to slide it into the gap.",
        "With the board focused, arrow keys move the empty square in that direction.",
        "Every starting arrangement is solvable. Undo a move or start over at any time.",
      ]}
      controls={<PuzzleControls {...game} />}
    >
      {!s ? (
        <PuzzleLoading />
      ) : (
        <>
          <div className="puzzle-stats">
            <span>{s.moves} moves</span>
            <span>
              {s.tiles.filter((n, i) => n !== 0 && n === i + 1).length} of 8 in
              place
            </span>
          </div>
          <div
            className="sliding-board"
            ref={board}
            role="group"
            tabIndex={0}
            aria-label="Sliding puzzle. Arrow keys move the empty square."
            onKeyDown={(e) => {
              if (!e.key.startsWith("Arrow")) return;
              e.preventDefault();
              const blank = s.tiles.indexOf(0);
              const offsets: Record<string, number> = {
                ArrowUp: -3,
                ArrowDown: 3,
                ArrowLeft: -1,
                ArrowRight: 1,
              };
              move(blank + offsets[e.key]);
            }}
          >
            {s.tiles.map((n, i) =>
              n ? (
                <button
                  key={n}
                  onClick={() => move(i)}
                  disabled={done || !canSlide(s.tiles, i)}
                  className={n === i + 1 ? "tile-in-place" : ""}
                  aria-label={`Slide tile ${n}`}
                >
                  <span>{n}</span>
                </button>
              ) : (
                <div
                  key="empty"
                  className="sliding-empty"
                  aria-label="Empty square"
                />
              ),
            )}
          </div>
          <p className="puzzle-caption">
            The finished square: 1 2 3 · 4 5 6 · 7 8 □
          </p>
          <div className="puzzle-buttons">
            <button disabled={!s.history.length} onClick={undo}>
              Undo move
            </button>
            <button onClick={game.reset}>Start over</button>
          </div>
          <p
            className={`puzzle-message ${done ? "success" : ""}`}
            role="status"
          >
            {done
              ? `Order restored in ${s.moves} moves. A most satisfying arrangement.`
              : "Tap a tile beside the empty square. One move at a time."}
          </p>
        </>
      )}
    </GameFrame>
  );
}
