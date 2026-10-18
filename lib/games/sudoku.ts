import { shuffled, isNumberArray } from "./core";
export type SudokuState = {
  givens: number[];
  solution: number[];
  cells: number[];
  hinted: number[];
  hints: number;
  checks: number;
};
export function candidates(cells: number[], index: number) {
  const row = Math.floor(index / 9),
    col = index % 9;
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
    (n) =>
      !cells.some(
        (value, i) =>
          i !== index &&
          value === n &&
          (Math.floor(i / 9) === row ||
            i % 9 === col ||
            (Math.floor(i / 27) === Math.floor(row / 3) &&
              Math.floor((i % 9) / 3) === Math.floor(col / 3))),
      ),
  );
}
export function countSolutions(cells: number[], limit = 2, onSolution?: (solution: number[]) => void): number {
  if (
    !isNumberArray(cells, 81, 9) ||
    cells.some((n, i) => n !== 0 && !candidates(cells, i).includes(n))
  )
    return 0;
  const copy = [...cells];
  function solve(): number {
    let best = -1,
      options: number[] = [];
    for (let i = 0; i < 81; i++) {
      if (copy[i]) continue;
      const available = candidates(copy, i);
      if (!available.length) return 0;
      if (best < 0 || available.length < options.length) {
        best = i;
        options = available;
        if (options.length === 1) break;
      }
    }
    if (best < 0) { onSolution?.([...copy]); return 1; }
    let count = 0;
    for (const n of options) {
      copy[best] = n;
      count += solve();
      if (count >= limit) break;
    }
    copy[best] = 0;
    return count;
  }
  return solve();
}
export function makeSudoku(
  random: () => number,
  difficulty = "standard",
): SudokuState {
  const groups = () =>
    shuffled([0, 1, 2], random).flatMap((group) =>
      shuffled([0, 1, 2], random).map((n) => group * 3 + n),
    );
  const rows = groups(),
    cols = groups(),
    digits = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9], random);
  const solution = rows.flatMap((row) =>
    cols.map((col) => digits[(row * 3 + Math.floor(row / 3) + col) % 9]),
  );
  const givens = [...solution];
  let removed = 0;
  const target =
    difficulty === "gentle" ? 34 : difficulty === "challenging" ? 49 : 42;
  for (const i of shuffled(
    Array.from({ length: 81 }, (_, i) => i),
    random,
  )) {
    const value = givens[i];
    givens[i] = 0;
    if (countSolutions(givens) === 1) removed++;
    else givens[i] = value;
    if (removed >= target) break;
  }
  return {
    givens,
    solution,
    cells: [...givens],
    hinted: [],
    hints: 0,
    checks: 0,
  };
}
export function validSudoku(value: unknown): value is SudokuState {
  if (!value || typeof value !== "object") return false;
  const s = value as SudokuState;
  return (
    isNumberArray(s.givens, 81, 9) &&
    isNumberArray(s.solution, 81, 9) &&
    isNumberArray(s.cells, 81, 9) &&
    Array.isArray(s.hinted) &&
    s.hinted.every((i) => Number.isInteger(i) && i >= 0 && i < 81) &&
    Number.isInteger(s.hints) &&
    s.hints >= 0 &&
    s.hints <= 3 &&
    Number.isInteger(s.checks) &&
    s.checks >= 0
  );
}
export const sudokuDone = (state: SudokuState) =>
  state.cells.every((value, i) => value === state.solution[i]);
