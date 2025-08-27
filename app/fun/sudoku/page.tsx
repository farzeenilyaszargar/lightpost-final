"use client";

import React, { useEffect, useState } from "react";

export interface SudokuProps {
  title?: string;
  className?: string;
  cellSize?: number;
  showTitle?: boolean;
  difficulty?: "easy" | "medium" | "hard" | "evil";
}

type Grid = number[][];

// Utility to deep copy a grid
const copyGrid = (grid: Grid): Grid => grid.map((row) => [...row]);

// Sudoku generator helpers (simple random backtracking)
const isValid = (grid: Grid, row: number, col: number, num: number): boolean => {
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num || grid[x][col] === num) return false;
  }
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
};

const solveGrid = (grid: Grid): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveGrid(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const generateFullGrid = (): Grid => {
  const grid: Grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  const fill = (row: number, col: number): boolean => {
    if (row === 9) return true;
    const nextRow = col === 8 ? row + 1 : row;
    const nextCol = col === 8 ? 0 : col + 1;
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    for (const num of numbers) {
      if (isValid(grid, row, col, num)) {
        grid[row][col] = num;
        if (fill(nextRow, nextCol)) return true;
        grid[row][col] = 0;
      }
    }
    return false;
  };
  fill(0, 0);
  return grid;
};

const removeNumbers = (grid: Grid, difficulty: string): Grid => {
  const attempts = difficulty === "easy" ? 35 : difficulty === "medium" ? 45 : difficulty === "hard" ? 55 : 60;
  const puzzle = copyGrid(grid);
  let count = attempts;
  while (count > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      count--;
    }
  }
  return puzzle;
};

const Sudoku: React.FC<SudokuProps> = ({
  title = "Sudoku",
  className = "",
  cellSize = 50,
  showTitle = true,
  difficulty = "medium",
}) => {
  const [solution, setSolution] = useState<Grid>([]);
  const [puzzle, setPuzzle] = useState<Grid>([]);
  const [grid, setGrid] = useState<Grid>([]);
  const [hints, setHints] = useState(3);

  useEffect(() => {
    const full = generateFullGrid();
    const sol = copyGrid(full);
    const puz = removeNumbers(full, difficulty);
    setSolution(sol);
    setPuzzle(puz);
    setGrid(copyGrid(puz));
    setHints(3);
  }, [difficulty]);

  const handleInput = (row: number, col: number, value: string) => {
    if (puzzle[row][col] !== 0) return; // don't allow changing clues
    const val = parseInt(value);
    if (!isNaN(val) && val >= 1 && val <= 9) {
      const newGrid = copyGrid(grid);
      newGrid[row][col] = val;
      setGrid(newGrid);
    } else if (value === "") {
      const newGrid = copyGrid(grid);
      newGrid[row][col] = 0;
      setGrid(newGrid);
    }
  };

  const giveHint = () => {
    if (hints <= 0) return;
    const empties: [number, number][] = [];
    grid.forEach((row, r) => row.forEach((val, c) => { if (val === 0) empties.push([r,c]); }));
    if (empties.length === 0) return;
    const [r,c] = empties[Math.floor(Math.random() * empties.length)];
    const newGrid = copyGrid(grid);
    newGrid[r][c] = solution[r][c];
    setGrid(newGrid);
    setHints(hints - 1);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {showTitle && <h2 className="text-xl font-bold mb-4 text-black dark:text-white">{title}</h2>}
      <div className="grid grid-cols-9 border-4 border-black" style={{ width: cellSize*9, height: cellSize*9 }}>
        {grid.map((row, r) =>
          row.map((val, c) => {
            const isClue = puzzle[r][c] !== 0;
            const isCorrect = val === solution[r][c];
            const isWrong = val !== 0 && val !== solution[r][c];
            return (
              <input
                key={`${r}-${c}`}
                value={val === 0 ? "" : val}
                onChange={(e) => handleInput(r, c, e.target.value)}
                className={`border text-center font-bold outline-none
                  ${isClue ? "text-black" : isCorrect ? "text-green-600" : isWrong ? "text-red-600" : "text-black"}
                  ${((c+1)%3===0 && c!==8) ? "border-r-4" : "border-r"}
                  ${((r+1)%3===0 && r!==8) ? "border-b-4" : "border-b"}
                  border-gray-700`}
                style={{ width: cellSize, height: cellSize, fontSize: cellSize/2 }}
                disabled={isClue}
              />
            );
          })
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={giveHint}
          disabled={hints <= 0}
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
        >
          Hint ({hints})
        </button>
      </div>
    </div>
  );
};

export default Sudoku;
