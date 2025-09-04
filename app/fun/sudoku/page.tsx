"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NavbarComp from "@/components/NavBar";
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
  difficulty = "hard",
}) => {
  const [solution, setSolution] = useState<Grid>([]);
  const [puzzle, setPuzzle] = useState<Grid>([]);
  const [grid, setGrid] = useState<Grid>([]);
  const [hints, setHints] = useState(3);
  const [mistakes, setMistakes] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null); // row, col of selected cell
  const [time, setTime] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState<"easy" | "medium" | "hard" | "evil">(difficulty);



  useEffect(() => {
    const full = generateFullGrid();
    const sol = copyGrid(full);
    const puz = removeNumbers(full, difficultyLevel);
    setSolution(sol);
    setPuzzle(puz);
    setGrid(copyGrid(puz));
    setHints(3);
    setMistakes(0);
  }, [difficultyLevel]);

  useEffect(() => {
    setTime(0); // reset timer on new game
    const interval = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval); // cleanup when component unmounts or new game starts
  }, [puzzle]); // runs whenever a new puzzle is generated


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleInput = (row: number, col: number, value: string) => {
    if (puzzle[row][col] !== 0) return; // don't allow changing clues
    const val = parseInt(value);
    if (!isNaN(val) && val >= 1 && val <= 9) {
      const newGrid = copyGrid(grid);
      newGrid[row][col] = val;
      setGrid(newGrid);
      setSelectedNumber(val);

      if (val !== solution[row][col]) {
        setMistakes((prev) => prev + 1);
      }
    } else if (value === "") {
      const newGrid = copyGrid(grid);
      newGrid[row][col] = 0;
      setGrid(newGrid);
      setSelectedNumber(null);
    }
  };

  const giveHint = () => {
    if (hints <= 0) return;
    const empties: [number, number][] = [];
    grid.forEach((row, r) => row.forEach((val, c) => { if (val === 0) empties.push([r, c]); }));
    if (empties.length === 0) return;
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    const newGrid = copyGrid(grid);
    newGrid[r][c] = solution[r][c];
    setGrid(newGrid);
    setHints(hints - 1);
  };
  const startNewGame = () => {
    const full = generateFullGrid();
    const sol = copyGrid(full);
    const puz = removeNumbers(full, difficulty);
    setSolution(sol);
    setPuzzle(puz);
    setGrid(copyGrid(puz));
    setHints(3);
    setMistakes(0);
    setSelectedNumber(null);
    setSelectedCell(null);
    setTime(0);
  };


  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Header />
      <NavbarComp />
      <div className=" w-5/6 flex flex-col justify-center items-center border-border border-l border-r h-full">
        <div className="flex justify-between items-center w-115  m-4 mb-1">
          <p className="font-bold text-lg">{title}</p>
          <div className="text-sm">Time: {formatTime(time)}</div>
        </div>
        <div className="grid grid-cols-9 border-3 border-border">
          {grid.map((row, r) =>
            row.map((val, c) => {
              const isClue = puzzle[r][c] !== 0;
              const isCorrect = val === solution[r][c];
              const isWrong = val !== 0 && val !== solution[r][c];
              const isSelectedNumber = val === selectedNumber || null;

              return (
                <input
                  key={`${r}-${c}`}
                  value={val === 0 ? "" : val}
                  onChange={(e) => handleInput(r, c, e.target.value)}
                  onFocus={() => {
                    setSelectedCell([r, c]);
                    setSelectedNumber(grid[r][c] === 0 ? null : grid[r][c]);
                  }}
                  className={`border text-center font-bold outline-none caret-string-primary
                  ${isClue ? "text-string-primary" : isCorrect ? "text-green-600" : isWrong ? "text-red-600" : "text-black"}
                  ${((c + 1) % 3 === 0 && c !== 8) ? "border-r-3" : "border-r"}
                  ${((r + 1) % 3 === 0 && r !== 8) ? "border-b-3" : "border-b"}
                  ${isSelectedNumber ? "bg-secondary-col" : "bg-background"}
                  border-border`}
                  style={{ width: cellSize, height: cellSize, fontSize: cellSize / 2 }}
                  disabled={isClue}
                />
              );
            })
          )}
        </div>
        <div className="flex gap-2 m-3 mt-5 ">
          {(["easy", "medium", "hard", "evil"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setDifficultyLevel(level)}
              className={`px-3 py-1 rounded 
        ${difficultyLevel === level ? "bg-string-secondary text-black font-bold " : "bg-gray-200 text-black"}`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>



        <div className="flex gap-3 m-3  justify-around items-center ">
          <button
            onClick={giveHint}
            disabled={hints <= 0}
            className="px-2 py-1 bg-string-primary text-background rounded disabled:opacity-50"
          >
            💡 Hint ({hints})
          </button>
          <button
            onClick={startNewGame}
            className="px-2 py-1 bg-string-primary text-background rounded"
          >
            🔄 New Game
          </button>
          <p>Mistakes: {mistakes}</p>

        </div>
      </div>

      <Footer />

    </div>
  );
};

export default Sudoku;
