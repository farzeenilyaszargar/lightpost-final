"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ---------------- Types ----------------
export type Direction = "across" | "down";

export interface Entry {
  id: string; // unique id (e.g., "1A")
  number: number; // display number
  row: number; // 0-indexed start row
  col: number; // 0-indexed start col
  direction: Direction;
  answer: string; // UPPERCASE letters, no spaces
  clue: string;
}

export interface Puzzle {
  title?: string;
  rows: number;
  cols: number;
  entries: Entry[];
}

// ---------------- Helpers ----------------
const alpha = /^[A-Za-z]$/;

type Cell = {
  row: number;
  col: number;
  id: string; // `${row}-${col}`
  // ids of entries that pass through this cell
  acrossId?: string;
  downId?: string;
  solution?: string; // correct letter if any
  number?: number; // numbering shown in the corner
  isBlock: boolean; // true if unused by any entry
};

function buildGrid(puzzle: Puzzle): { grid: Cell[][]; byId: Record<string, Entry> } {
  const grid: Cell[][] = Array.from({ length: puzzle.rows }, (_, r) =>
    Array.from({ length: puzzle.cols }, (_, c) => ({
      row: r,
      col: c,
      id: `${r}-${c}`,
      isBlock: true,
    }))
  );

  const byId: Record<string, Entry> = {};
  for (const e of puzzle.entries) {
    byId[e.id] = e;
    let r = e.row;
    let c = e.col;
    for (let i = 0; i < e.answer.length; i++) {
      const cell = grid[r]?.[c];
      if (!cell) break;
      cell.isBlock = false;
      const letter = e.answer[i].toUpperCase();
      // Overlaps must match
      if (cell.solution && cell.solution !== letter) {
        console.warn(`Entry overlap mismatch at ${r},${c}`);
      } else {
        cell.solution = letter;
      }
      if (e.direction === "across") cell.acrossId = e.id;
      else cell.downId = e.id;
      if (e.direction === "across") c += 1; else r += 1;
    }
  }

  // compute numbering: a cell gets a number if it starts an entry
  for (const e of puzzle.entries) {
    const cell = grid[e.row][e.col];
    cell.number = Math.min(cell.number ?? e.number, e.number);
  }

  return { grid, byId };
}

function getCellsForEntry(entry: Entry): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  let r = entry.row;
  let c = entry.col;
  for (let i = 0; i < entry.answer.length; i++) {
    cells.push({ row: r, col: c });
    if (entry.direction === "across") c += 1; else r += 1;
  }
  return cells;
}

function formatId(r: number, c: number) {
  return `${r}-${c}`;
}

// ---------------- Sample Puzzle (used if no props provided) ----------------
const samplePuzzle: Puzzle = {
  title: "Mini Crossword",
  rows: 7,
  cols: 7,
  entries: [
    { id: "1A", number: 1, row: 0, col: 0, direction: "across", answer: "CODE", clue: "Write software" },
    { id: "4A", number: 4, row: 0, col: 5, direction: "across", answer: "API", clue: "Interface for devs" },
    { id: "5A", number: 5, row: 2, col: 0, direction: "across", answer: "REACT", clue: "UI library from Meta" },
    { id: "7A", number: 7, row: 3, col: 2, direction: "across", answer: "TAILWIND", clue: "Utility-first CSS framework" },
    { id: "10A", number: 10, row: 5, col: 1, direction: "across", answer: "NODE", clue: "JS runtime" },

    { id: "1D", number: 1, row: 0, col: 0, direction: "down", answer: "CORE", clue: "Essential part" },
    { id: "2D", number: 2, row: 0, col: 3, direction: "down", answer: "DATA", clue: "Info for machines" },
    { id: "3D", number: 3, row: 0, col: 6, direction: "down", answer: "API", clue: "Dev bridge, briefly" },
    { id: "6D", number: 6, row: 2, col: 2, direction: "down", answer: "TDD", clue: "Test-first dev, abbr." },
    { id: "8D", number: 8, row: 3, col: 4, direction: "down", answer: "WEB", clue: "Where sites live" },
    { id: "9D", number: 9, row: 3, col: 5, direction: "down", answer: "IDEA", clue: "Aha!" },
  ],
};

// ---------------- Component ----------------
export interface CrosswordProps {
  puzzle?: Puzzle; // Pass your own puzzle or use the built-in sample
  className?: string;
  cellSize?: number; // px, default 44
  showTitle?: boolean;
}

export default function Crossword({ puzzle = samplePuzzle, className = "", cellSize = 44, showTitle = true }: CrosswordProps) {
  const { grid, byId } = useMemo(() => buildGrid(puzzle), [puzzle]);

  // user-filled letters keyed by cell id
  const [fill, setFill] = useState<Record<string, string>>({});
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [activeDir, setActiveDir] = useState<Direction>("across");
  const [checked, setChecked] = useState(false);

  // compute current active entry based on active cell & direction
  const activeEntry = useMemo(() => {
    if (!activeCell) return null;
    const cell = grid[activeCell.row][activeCell.col];
    const entryId = (activeDir === "across" ? cell.acrossId : cell.downId) || (cell.acrossId || cell.downId);
    return entryId ? byId[entryId] : null;
  }, [activeCell, activeDir, grid, byId]);

  const focusNextCell = useCallback((delta: number) => {
    if (!activeEntry) return;
    const cells = getCellsForEntry(activeEntry);
    const idx = activeCell ? cells.findIndex(c => c.row === activeCell.row && c.col === activeCell.col) : 0;
    const next = cells[Math.min(Math.max(idx + delta, 0), cells.length - 1)];
    setActiveCell(next);
  }, [activeCell, activeEntry]);

  const jumpToStart = useCallback(() => {
    if (!activeEntry) return;
    const start = { row: activeEntry.row, col: activeEntry.col };
    setActiveCell(start);
  }, [activeEntry]);

  const selectEntry = useCallback((entry: Entry) => {
    setActiveDir(entry.direction);
    setActiveCell({ row: entry.row, col: entry.col });
  }, []);

  // keyboard input
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ignore if not focused within component
      if (!containerRef.current) return;
      const within = containerRef.current.contains(document.activeElement);
      if (!within) return;

      if (!activeCell) return;
      const cellId = formatId(activeCell.row, activeCell.col);

      if (e.key === "Tab") {
        e.preventDefault();
        // cycle to next clue
        const dirEntries = puzzle.entries
          .filter(en => en.direction === activeDir)
          .sort((a, b) => a.number - b.number);
        const idx = activeEntry ? dirEntries.findIndex(x => x.id === activeEntry.id) : 0;
        const next = dirEntries[(idx + (e.shiftKey ? -1 : 1) + dirEntries.length) % dirEntries.length];
        selectEntry(next);
        return;
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const r = activeCell.row + (e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0);
        const c = activeCell.col + (e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0);
        const cell = grid[r]?.[c];
        if (cell && !cell.isBlock) {
          setActiveCell({ row: r, col: c });
          if (e.key === "ArrowUp" || e.key === "ArrowDown") setActiveDir("down");
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") setActiveDir("across");
        }
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        setFill(prev => ({ ...prev, [cellId]: "" }));
        focusNextCell(-1);
        return;
      }

      if (alpha.test(e.key)) {
        e.preventDefault();
        const ch = e.key.toUpperCase();
        setFill(prev => ({ ...prev, [cellId]: ch }));
        focusNextCell(1);
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        setActiveDir(d => (d === "across" ? "down" : "across"));
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        jumpToStart();
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeCell, activeDir, activeEntry, focusNextCell, jumpToStart, grid, puzzle.entries, selectEntry]);

  // correctness helpers
  const isCellCorrect = useCallback((cell: Cell) => {
    const v = fill[cell.id] || "";
    return v !== "" && v === cell.solution;
  }, [fill]);

  const isWordCompleteAndCorrect = useCallback((entry: Entry) => {
    const cells = getCellsForEntry(entry);
    return cells.every(({ row, col }, i) => fill[formatId(row, col)] === entry.answer[i]);
  }, [fill]);

  const clearEntry = useCallback((entry: Entry) => {
    setFill(prev => {
      const next = { ...prev };
      for (const { row, col } of getCellsForEntry(entry)) next[formatId(row, col)] = "";
      return next;
    });
  }, []);

  const revealEntry = useCallback((entry: Entry) => {
    setFill(prev => {
      const next = { ...prev };
      for (let i = 0; i < entry.answer.length; i++) {
        const { row, col } = getCellsForEntry(entry)[i];
        next[formatId(row, col)] = entry.answer[i].toUpperCase();
      }
      return next;
    });
  }, []);

  const revealCell = useCallback((cell: Cell) => {
    if (!cell.solution) return;
    setFill(prev => ({ ...prev, [cell.id]: cell.solution! }));
  }, []);

  const resetAll = useCallback(() => {
    setFill({});
    setChecked(false);
  }, []);

  // focus first non-block when mount
  useEffect(() => {
    if (!activeCell) {
      outer: for (let r = 0; r < puzzle.rows; r++) {
        for (let c = 0; c < puzzle.cols; c++) {
          const cell = grid[r][c];
          if (!cell.isBlock) {
            setActiveCell({ row: r, col: c });
            break outer;
          }
        }
      }
    }
  }, [activeCell, grid, puzzle.cols, puzzle.rows]);

  return (
    <div ref={containerRef} className={`w-full max-w-5xl mx-auto ${className}`}>
      {showTitle && (
        <div className="mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">{puzzle.title ?? "Crossword"}</h2>
          <p className="text-sm text-muted-foreground">Use letters A–Z. Space toggles direction. Tab jumps clues. Enter goes to word start.</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[auto,1fr]">
        {/* Grid */}
        <div className="inline-block">
          <div
            className="rounded-2xl p-2 shadow-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            style={{ width: puzzle.cols * (cellSize + 2) + 8 }}
          >
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${puzzle.cols}, ${cellSize}px)`, gridTemplateRows: `repeat(${puzzle.rows}, ${cellSize}px)` }}
            >
              {grid.flat().map((cell) => {
                const isActive = activeCell && cell.row === activeCell.row && cell.col === activeCell.col;
                const entryForCell = (activeDir === "across" ? cell.acrossId : cell.downId) || (cell.acrossId || cell.downId);
                const isInActiveEntry = activeEntry && entryForCell === activeEntry.id;
                const val = fill[cell.id] ?? "";
                const showCorrectness = checked && !cell.isBlock && val !== "";
                const correct = showCorrectness && isCellCorrect(cell);
                const incorrect = showCorrectness && !isCellCorrect(cell);

                return (
                  <button
                    type="button"
                    key={cell.id}
                    onClick={() => {
                      setActiveCell({ row: cell.row, col: cell.col });
                      // pick a sensible direction on click
                      setActiveDir(prev => {
                        const hasAcross = !!cell.acrossId;
                        const hasDown = !!cell.downId;
                        if (hasAcross && hasDown) return prev; // keep
                        if (hasAcross) return "across";
                        if (hasDown) return "down";
                        return prev;
                      });
                    }}
                    className={`relative select-none border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-lg font-semibold outline-none focus:ring-2 focus:ring-indigo-500 ${
                      cell.isBlock
                        ? "bg-zinc-800 border-zinc-900"
                        : isInActiveEntry
                        ? "bg-indigo-50 dark:bg-indigo-950/40"
                        : "bg-white dark:bg-zinc-900"
                    } ${isActive ? "ring-2 ring-indigo-500 z-10" : ""}`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {/* Corner number */}
                    {!cell.isBlock && cell.number !== undefined && (
                      <span className="absolute top-0.5 left-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">{cell.number}</span>
                    )}

                    {/* Letter */}
                    {!cell.isBlock ? (
                      <span className={`leading-none ${correct ? "text-emerald-600" : ""} ${incorrect ? "text-rose-600" : ""}`}>
                        {val}
                      </span>
                    ) : null}

                    {/* Block fill */}
                    {cell.isBlock && <span className="absolute inset-0 bg-zinc-900" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              onClick={() => setChecked(c => !c)}
            >
              {checked ? "Hide Check" : "Check"}
            </button>
            <button
              className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              onClick={() => activeEntry && revealEntry(activeEntry)}
              disabled={!activeEntry}
            >
              Reveal Word
            </button>
            <button
              className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              onClick={() => {
                if (!activeCell) return;
                const cell = grid[activeCell.row][activeCell.col];
                revealCell(cell);
              }}
              disabled={!activeCell}
            >
              Reveal Letter
            </button>
            <button
              className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              onClick={() => activeEntry && clearEntry(activeEntry)}
              disabled={!activeEntry}
            >
              Clear Word
            </button>
            <button
              className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              onClick={resetAll}
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Clues */}
        <div className="space-y-6">
          {(["across", "down"] as Direction[]).map((dir) => {
            const entries = puzzle.entries
              .filter(e => e.direction === dir)
              .sort((a, b) => a.number - b.number);
            return (
              <div key={dir}>
                <h3 className="text-lg font-semibold mb-2 uppercase tracking-wide text-zinc-500">{dir}</h3>
                <ul className="space-y-1">
                  {entries.map((e) => {
                    const isActive = activeEntry?.id === e.id;
                    const done = isWordCompleteAndCorrect(e);
                    return (
                      <li key={e.id}>
                        <button
                          onClick={() => selectEntry(e)}
                          className={`w-full text-left px-3 py-2 rounded-xl border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 ${
                            isActive ? "bg-indigo-50 dark:bg-indigo-950/40" : ""
                          }`}
                        >
                          <span className="font-semibold mr-2">{e.number}</span>
                          <span className="mr-2 uppercase text-xs text-zinc-500">{e.direction === "across" ? "A" : "D"}</span>
                          <span className="mr-2">{e.clue}</span>
                          <span className="text-zinc-400">({e.answer.length})</span>
                          {done && <span className="ml-2 text-emerald-600 text-xs">✓</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer help */}
      <div className="mt-6 text-sm text-zinc-500">
        <p><span className="font-medium">Shortcuts:</span> Letters to type • Backspace to erase • Space to toggle direction • Arrow keys to move • Tab to next clue • Enter to jump to start of word.</p>
      </div>
    </div>
  );
}

// ---------------- Usage Example ----------------
// import Crossword from "@/components/crossword"; (rename file to crossword.tsx and place under your components dir)
// <Crossword />
// or pass your own puzzle:
// const myPuzzle: Puzzle = { rows: 10, cols: 10, entries: [ { id: "1A", number: 1, row: 0, col: 0, direction: "across", answer: "HELLO", clue: "Greeting" }, ... ] };
// <Crossword puzzle={myPuzzle} cellSize={48} />
