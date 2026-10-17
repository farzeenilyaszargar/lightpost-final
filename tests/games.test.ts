import { test } from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";
import { editionKey, seededRandom } from "../lib/games/core";
import {
  makeSudoku,
  countSolutions,
  candidates,
  sudokuDone,
  validSudoku,
} from "../lib/games/sudoku";
import {
  makeArithmetic,
  validAnswer,
  equationAnswer,
  validArithmetic,
  arithmeticDone,
} from "../lib/games/arithmetic";
import {
  makeWord,
  guessLetter,
  wordWon,
  wrongLetters,
  validWord,
} from "../lib/games/words";
import { chessProblems, matingMoves, validChess } from "../lib/games/chess";
import {
  shuffleTiles,
  slideTile,
  canSlide,
  isSlidingSolved,
} from "../lib/sliding-puzzle";
test("the daily edition changes at Indian midnight", () => {
  assert.equal(editionKey(new Date("2026-10-17T18:29:59Z")), "2026-10-17");
  assert.equal(editionKey(new Date("2026-10-17T18:30:00Z")), "2026-10-18");
});
test("daily randomness is stable, and a different seed changes the puzzle", () => {
  const a = seededRandom("same"),
    b = seededRandom("same"),
    c = seededRandom("other");
  const xs = Array.from({ length: 20 }, () => a());
  assert.deepEqual(
    xs,
    Array.from({ length: 20 }, () => b()),
  );
  assert.notDeepEqual(
    xs,
    Array.from({ length: 20 }, () => c()),
  );
});
test("every Sudoku difficulty yields a unique, consistent solution", () => {
  for (const level of ["gentle", "standard", "challenging"]) {
    for (let edition = 0; edition < 3; edition++) {
      const s = makeSudoku(seededRandom(`edition-${edition}-${level}`), level);
      assert.equal(validSudoku(s), true);
      assert.equal(countSolutions(s.givens), 1);
      assert.ok(s.givens.filter((n) => !n).length >= 30);
      assert.ok(
        s.solution.every((n, i) => candidates(s.solution, i).includes(n)),
      );
      assert.equal(sudokuDone(s), false);
      assert.equal(sudokuDone({ ...s, cells: s.solution }), true);
      s.givens.forEach((n, i) => {
        if (n) assert.equal(n, s.solution[i]);
      });
    }
  }
});
test("Sudoku generation is deterministic and does not mutate a solution during counting", () => {
  const a = makeSudoku(seededRandom("edition")),
    b = makeSudoku(seededRandom("edition"));
  assert.deepEqual(a, b);
  const before = [...a.givens];
  countSolutions(a.givens);
  assert.deepEqual(a.givens, before);
});
test("a repeated word-game guess does not cost an extra chance", () => {
  const s = { word: "quill", clue: "A feather", guessed: [], hintUsed: false };
  const next = guessLetter(s, "z");
  assert.equal(wrongLetters(next).length, 1);
  assert.equal(guessLetter(next, "z"), next);
  assert.equal(guessLetter(next, "1"), next);
});
test("word games stop accepting guesses on both win and loss", () => {
  let s = makeWord(seededRandom("word"));
  assert.ok(validWord(s));
  for (const c of s.word) s = guessLetter(s, c);
  assert.equal(wordWon(s), true);
  assert.equal(guessLetter(s, "z"), s);
  const lost = {
    word: "quill",
    clue: "A feather",
    guessed: ["a", "b", "c", "d", "e", "f"],
    hintUsed: false,
  };
  assert.equal(guessLetter(lost, "q"), lost);
});
test("generated equations accept their intended answer, including integer division", () => {
  for (let n = 0; n < 30; n++) {
    const s = makeArithmetic(seededRandom(String(n)));
    assert.ok(validArithmetic(s));
    for (const q of s.questions) assert.ok(validAnswer(q, equationAnswer(q)));
    const completed = {
      ...s,
      answers: s.questions.map(equationAnswer),
      checked: Array(6).fill(true),
    };
    assert.ok(arithmeticDone(completed));
    assert.equal(
      arithmeticDone({ ...completed, checked: Array(6).fill(false) }),
      false,
    );
  }
});
test("equivalent arithmetic signs are accepted and malformed numbers are rejected", () => {
  const q = { a: 2, b: 2, c: 4, op: "+" as const, blank: "op" as const };
  assert.ok(validAnswer(q, "×"));
  assert.ok(validAnswer(q, "+"));
  assert.equal(validAnswer(q, "÷"), false);
  const n = { ...q, blank: "c" as const };
  for (const value of ["", "4junk", "4.1", "Infinity", "NaN", "-4"])
    assert.equal(validAnswer(n, value), false);
  assert.ok(validAnswer(n, "04"));
});
test("every chess problem is legal, initially unsolved, and has a verified mate in one", () => {
  chessProblems.forEach((problem, index) => {
    const chess = new Chess(problem.fen);
    assert.equal(chess.isCheckmate(), false);
    assert.equal(chess.isCheck(), false);
    const wins = matingMoves(problem.fen);
    assert.ok(wins.length > 0, problem.name);
    for (const win of wins) {
      const board = new Chess(problem.fen);
      board.move(win);
      assert.ok(board.isCheckmate());
      assert.ok(
        validChess({
          problem: index,
          fen: board.fen(),
          attempts: 1,
          hinted: false,
          status: "solved",
        }),
      );
    }
  });
});
test("sliding starts are nontrivial, solvable permutations; undo restores exactly", () => {
  for (let n = 0; n < 50; n++) {
    const tiles = shuffleTiles(3, seededRandom(String(n)));
    assert.equal(isSlidingSolved(tiles), false);
    const values = tiles.filter(Boolean);
    const inversions = values.reduce(
      (sum, value, i) =>
        sum + values.slice(i + 1).filter((other) => other < value).length,
      0,
    );
    assert.equal(inversions % 2, 0);
    const index = tiles.findIndex((_, i) => canSlide(tiles, i));
    const moved = slideTile(tiles, index);
    assert.notDeepEqual(moved, tiles);
    assert.deepEqual(slideTile(moved, tiles.indexOf(0)), tiles);
    assert.deepEqual([...moved].sort(), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  }
  assert.equal(canSlide([1, 2, 0, 4, 5, 6, 7, 8, 3], 3), false);
});
test("invalid saved game shapes are rejected", () => {
  for (const value of [null, {}, [], "bad", { cells: [1, 2] }]) {
    assert.equal(validSudoku(value), false);
    assert.equal(validWord(value), false);
    assert.equal(validArithmetic(value), false);
    assert.equal(validChess(value), false);
  }
});

test("contradictory Sudoku givens have no solution", () => {
  const s = makeSudoku(seededRandom("contradiction"));
  const invalid = [...s.solution];
  invalid[0] = invalid[1];
  assert.equal(countSolutions(invalid), 0);
});
