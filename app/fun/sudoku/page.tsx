"use client";
import { useCallback, useRef, useState } from "react";
import GameFrame, {
  PuzzleControls,
  PuzzleLoading,
} from "@/components/games/GameFrame";
import { useMarkComplete } from "@/components/games/useDailyGame";
import { useOnlineGame } from "@/components/games/useOnlineGame";
import { makeSudoku, validSudoku, sudokuDone } from "@/lib/games/sudoku";
export default function Sudoku() {
  const [difficulty, setDifficulty] = useState("standard"),
    [selected, setSelected] = useState(0),
    [checked, setChecked] = useState(false);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const create = useCallback(
    (random: () => number) => makeSudoku(random, difficulty),
    [difficulty],
  );
  const game = useOnlineGame(`/api/puzzles/sudoku?difficulty=${difficulty}`, create, validSudoku);
  const s = game.state;
  const done = !!s && sudokuDone(s);
  useMarkComplete("sudoku", done, game.round === 0, game.day);
  function enter(n: number) {
    if (!s || done || s.givens[selected] || s.hinted.includes(selected)) return;
    game.update((old) => ({
      ...old,
      cells: old.cells.map((value, i) => (i === selected ? n : value)),
    }));
    setChecked(false);
  }
  function hint() {
    if (!s || done || s.hints >= 3) return;
    const index =
      !s.givens[selected] && s.cells[selected] !== s.solution[selected]
        ? selected
        : s.cells.findIndex((n, i) => n !== s.solution[i]);
    if (index < 0) return;
    game.update((old) => ({
      ...old,
      cells: old.cells.map((n, i) => (i === index ? old.solution[i] : n)),
      hinted: [...old.hinted, index],
      hints: old.hints + 1,
    }));
    setSelected(index);
    setChecked(false);
  }
  const wrong =
    s?.cells.filter((n, i) => n !== 0 && n !== s.solution[i]).length || 0;
  return (
    <GameFrame
      id="sudoku"
      title="Sudoku"
      description="Every figure has its place. Find the one arrangement that fits."
      rules={[
        "Fill every row, column, and 3 × 3 box with the numbers 1 to 9. Each number appears once.",
        "Select a square, then type a number or use the number buttons. Arrow keys move around the board; Backspace erases.",
        "Printed figures cannot be changed. Check your work when ready, or use up to three hints.",
        "Online boards are checked for a unique solution. The difficulty selector applies to offline fallback boards.",
      ]}
      controls={
        <PuzzleControls game={game}>
          <label className="puzzle-difficulty">
            Offline difficulty{" "}
            <select
              aria-label="Sudoku difficulty"
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setChecked(false);
              }}
            >
              <option value="gentle">Gentle</option>
              <option value="standard">Standard</option>
              <option value="challenging">Challenging</option>
            </select>
          </label>
        </PuzzleControls>
      }
    >
      {!s ? (
        <PuzzleLoading />
      ) : (
        <>
          <div className="puzzle-stats">
            <span>{s.cells.filter(Boolean).length} / 81 filled</span>
            <span>{3 - s.hints} hints remaining</span>
          </div>
          <div
            className="sudoku-board"
            role="group"
            aria-label="Sudoku board"
            onKeyDown={(e) => {
              let next = selected;
              if (/^[1-9]$/.test(e.key)) {
                e.preventDefault();
                enter(Number(e.key));
              } else if (
                e.key === "Backspace" ||
                e.key === "Delete" ||
                e.key === "0"
              ) {
                e.preventDefault();
                enter(0);
              } else if (e.key.startsWith("Arrow")) {
                e.preventDefault();
                if (e.key === "ArrowRight") next = Math.min(80, selected + 1);
                if (e.key === "ArrowLeft") next = Math.max(0, selected - 1);
                if (e.key === "ArrowDown") next = Math.min(80, selected + 9);
                if (e.key === "ArrowUp") next = Math.max(0, selected - 9);
                setSelected(next);
                refs.current[next]?.focus();
              }
            }}
          >
            {s.cells.map((n, i) => {
              const fixed = !!s.givens[i] || s.hinted.includes(i);
              return (
                <button
                  key={`${game.key}:${i}`}
                  ref={(element) => {
                    refs.current[i] = element;
                  }}
                  className={`${selected === i ? "selected" : ""} ${fixed ? "given" : ""} ${checked && n && n !== s.solution[i] ? "incorrect" : ""} ${i % 9 === 2 || i % 9 === 5 ? "box-right" : ""} ${Math.floor(i / 9) === 2 || Math.floor(i / 9) === 5 ? "box-bottom" : ""}`}
                  tabIndex={selected === i ? 0 : -1}
                  onClick={() => setSelected(i)}
                  aria-label={`Row ${Math.floor(i / 9) + 1}, column ${(i % 9) + 1}, ${n || "empty"}${fixed ? ", printed figure" : ""}`}
                  aria-pressed={selected === i}
                >
                  {n || ""}
                </button>
              );
            })}
          </div>
          <div className="sudoku-keypad" aria-label="Number pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => enter(n)}
                disabled={done}
                aria-label={`Enter ${n}`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => enter(0)}
              disabled={done}
              aria-label="Erase selected square"
            >
              ⌫
            </button>
          </div>
          <div className="puzzle-buttons">
            <button
              onClick={() => {
                setChecked(true);
                game.update((old) => ({ ...old, checks: old.checks + 1 }));
              }}
              disabled={done}
            >
              Check work
            </button>
            <button onClick={hint} disabled={done || s.hints >= 3}>
              A hint ({3 - s.hints})
            </button>
            <button
              onClick={() => {
                game.reset();
                setChecked(false);
              }}
            >
              Start over
            </button>
          </div>
          <p
            className={`puzzle-message ${done ? "success" : ""}`}
            role="status"
          >
            {done
              ? "Perfectly arranged! You have solved the square."
              : checked
                ? wrong
                  ? `${wrong} ${wrong === 1 ? "figure needs" : "figures need"} another look. Marked squares may be corrected.`
                  : "All entered figures are correct. Carry on!"
                : "Select a square to begin. No haste required."}
          </p>
        </>
      )}
    </GameFrame>
  );
}
