import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess, type Square } from 'chess.js';
import chessFixture from './fixtures/lichess-puzzle.json';
import sudokuFixture from './fixtures/dosuku-board.json';
import { makePrintChess, parseDosuku, parseLichess, playOnlineMove, validOnlineChess } from '../lib/online-puzzles';
import { countSolutions } from '../lib/games/sudoku';
import { validWord } from '../lib/games/words';

test('Lichess PGN is advanced through the opponent setup move before the solution starts', () => {
  const state = parseLichess(chessFixture);
  assert.equal(validOnlineChess(state), true);
  const board = new Chess(state.fen);
  assert.equal(board.turn(), state.player);
  for (const move of state.solution) assert.ok(board.move(move));
});
test('online chess plays an automatic reply and completes a full tactical line', () => {
  let state = parseLichess(chessFixture);
  while (state.status === 'playing') {
    const uci = state.solution[state.step];
    const expected = Math.min(state.step + 2, state.solution.length);
    state = playOnlineMove(state, uci.slice(0,2) as Square, uci.slice(2,4) as Square).state;
    assert.equal(state.step, expected);
  }
  assert.equal(state.status, 'solved');
  assert.throws(() => playOnlineMove(state, 'a1', 'a2'));
});
test('wrong legal chess moves restore the position and illegal moves cannot mutate it', () => {
  const state = parseLichess(chessFixture);
  const board = new Chess(state.fen);
  const wrong = board.moves({ verbose: true }).find(move => move.lan !== state.solution[0])!;
  const result = playOnlineMove(state, wrong.from, wrong.to);
  assert.equal(result.state.fen, state.fen);
  assert.equal(result.state.step, 0);
  assert.equal(result.state.attempts, 1);
  assert.throws(() => playOnlineMove(state, 'a1', 'a1'));
  assert.equal(state.attempts, 0);
});
test('any valid mate in one wins even when another mating move is in the official line', () => {
  const state = makePrintChess(() => 4/6);
  const board = new Chess(state.fen);
  const alternate = board.moves({ verbose: true }).find(move => {
    if (move.lan === state.solution[0]) return false;
    board.move(move); const mate = board.isCheckmate(); board.undo(); return mate;
  })!;
  assert.ok(alternate);
  assert.equal(playOnlineMove(state, alternate.from, alternate.to).state.status, 'solved');
});
test('malformed chess data and illegal upstream solutions are rejected', () => {
  for (const value of [null, {}, { ...chessFixture, puzzle: { ...chessFixture.puzzle, id: '../evil' } }, { ...chessFixture, puzzle: { ...chessFixture.puzzle, solution: ['a1a8'] } }]) {
    assert.throws(() => parseLichess(value));
  }
});
test('ambiguous online Sudoku is repaired with extra clues, preserving the source figures', () => {
  const state = parseDosuku(sudokuFixture);
  assert.equal(countSolutions(state.givens), 1);
  const original = sudokuFixture.newboard.grids[0].value.flat();
  original.forEach((value, index) => { if (value) assert.equal(state.givens[index], value); });
  assert.deepEqual(state.cells, state.givens);
  assert.ok(state.givens.filter(Boolean).length <= original.filter(Boolean).length + 5, "Repair should add targeted clues, not reveal whole rows");
  assert.ok(state.givens.some(value => value === 0));
});
test('invalid Sudoku shapes, conflicting clues and fabricated solutions are rejected', () => {
  for (const value of [null, {}, { newboard: { grids: [{ value: [[1]], solution: [[1]] }] } }]) assert.throws(() => parseDosuku(value));
  const invalid = structuredClone(sudokuFixture);
  invalid.newboard.grids[0].solution[0][0] = invalid.newboard.grids[0].solution[0][1];
  assert.throws(() => parseDosuku(invalid));
});
test('online words support a broad dictionary while invalid input and guesses are rejected', () => {
  assert.equal(validWord({ word: 'reading', clue: 'Studying printed matter.', guessed: ['r'], hintUsed: false }), true);
  assert.equal(validWord({ word: '<script>', clue: 'Bad', guessed: [], hintUsed: false }), false);
  assert.equal(validWord({ word: 'reading', clue: 'A clue', guessed: ['xx'], hintUsed: false }), false);
});

test('comic navigation skips missing #404 and wraps in both directions', async () => {
  const { comicNeighbor } = await import('../lib/comics');
  assert.equal(comicNeighbor(403, 3000, 1), 405);
  assert.equal(comicNeighbor(405, 3000, -1), 403);
  assert.equal(comicNeighbor(3000, 3000, 1), 1);
  assert.equal(comicNeighbor(1, 3000, -1), 3000);
  assert.throws(() => comicNeighbor(0, 3000, 1));
});
test('dictionary clues hide the answer case-insensitively and stay brief', async () => {
  const { dictionaryClue } = await import('../lib/games/words');
  assert.equal(dictionaryClue('Reading is the art of READING.', 'reading'), '_____ is the art of _____.');
  assert.ok(dictionaryClue('A lengthy description. '.repeat(50), 'reading').length <= 220);
});
