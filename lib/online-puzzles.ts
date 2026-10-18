import { Chess, type Square, type PieceSymbol } from 'chess.js';
import { chessProblems, matingMoves } from './games/chess';
import { candidates, countSolutions, type SudokuState } from './games/sudoku';

export type PuzzleSource = { name: string; url: string; fallback?: boolean };
export type OnlineChess = {
  id: string; initialFen: string; fen: string; solution: string[]; step: number;
  player: 'w' | 'b'; rating: number | null; themes: string[];
  attempts: number; hinted: boolean; status: 'playing' | 'solved' | 'revealed';
};
export function makePrintChess(random: () => number): OnlineChess {
  const index = Math.floor(random() * chessProblems.length);
  const problem = chessProblems[index];
  return {
    id: `print-${index}`, initialFen: problem.fen, fen: problem.fen,
    solution: [matingMoves(problem.fen)[0].lan], player: 'w', rating: null,
    themes: ['mate in one'], step: 0, attempts: 0, hinted: false, status: 'playing',
  };
}
export function validOnlineChess(value: unknown): value is OnlineChess {
  if (!value || typeof value !== 'object') return false;
  const item = value as OnlineChess;
  try {
    if (!/^[\w-]{1,30}$/.test(item.id) || !Array.isArray(item.solution) || !item.solution.length || item.solution.length > 30 ||
      !item.solution.every(move => typeof move === 'string' && /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move)) ||
      !Number.isInteger(item.step) || item.step < 0 || item.step > item.solution.length ||
      !['w','b'].includes(item.player) || !['playing','solved','revealed'].includes(item.status)) return false;
    const board = new Chess(item.initialFen);
    if (board.turn() !== item.player) return false;
    for (const move of item.solution) board.move(move);
    new Chess(item.fen);
    return true;
  } catch { return false; }
}
export function parseLichess(data: unknown): OnlineChess {
  const payload = data as {
    game?: { pgn?: string };
    puzzle?: { id?: string; initialPly?: number; solution?: string[]; rating?: number; themes?: string[] };
  };
  const puzzle = payload?.puzzle;
  if (!puzzle || typeof payload.game?.pgn !== 'string' || payload.game.pgn.length > 20000 ||
    !Number.isInteger(puzzle.initialPly) || puzzle.initialPly! < 0 || puzzle.initialPly! > 500 ||
    !/^[a-zA-Z0-9]{5}$/.test(puzzle.id || '')) throw new Error('Invalid chess puzzle');
  const played = new Chess();
  played.loadPgn(payload.game.pgn);
  const history = played.history();
  if (history.length < puzzle.initialPly! + 1) throw new Error('Incomplete chess position');
  const board = new Chess();
  history.slice(0, puzzle.initialPly! + 1).forEach(move => board.move(move));
  const item: OnlineChess = {
    id: puzzle.id!, fen: board.fen(), initialFen: board.fen(), player: board.turn(),
    solution: puzzle.solution || [], step: 0, attempts: 0, hinted: false, status: 'playing',
    rating: typeof puzzle.rating === 'number' && Number.isFinite(puzzle.rating) ? puzzle.rating : null,
    themes: Array.isArray(puzzle.themes) ? puzzle.themes.filter(theme => typeof theme === 'string' && /^[a-zA-Z]+$/.test(theme)).slice(0, 8) : [],
  };
  if (!validOnlineChess(item)) throw new Error('Illegal chess solution');
  return item;
}
export function parseDosuku(data: unknown): SudokuState {
  const grid = (data as { newboard?: { grids?: { value?: unknown; solution?: unknown }[] } })?.newboard?.grids?.[0];
  const flatten = (value: unknown) => {
    if (!Array.isArray(value) || value.length !== 9 || !value.every(row => Array.isArray(row) && row.length === 9)) throw new Error('Invalid Sudoku grid');
    const cells: unknown[] = value.flat();
    if (!cells.every(cell => Number.isInteger(cell) && Number(cell) >= 0 && Number(cell) <= 9)) throw new Error('Invalid Sudoku values');
    return cells as number[];
  };
  const givens = flatten(grid?.value), solution = flatten(grid?.solution);
  if (givens.filter(Boolean).length < 17 || givens.every(Boolean) || solution.some((n, i) => n === 0 || !candidates(solution, i).includes(n) || (givens[i] && givens[i] !== n))) throw new Error('Invalid Sudoku solution');
  // Add clues only at cells where an alternative solution differs. Filling
  // arbitrary blanks would expose whole rows without removing the ambiguity.
  for (let added = 0; added < 81; added++) {
    const alternatives: number[][] = [];
    const count = countSolutions(givens, 2, board => {
      if (board.some((value, index) => value !== solution[index])) alternatives.push(board);
    });
    if (count === 1) break;
    if (count === 0) throw new Error('Unsolvable Sudoku');
    let best = -1, score = 0;
    for (let index = 0; index < 81; index++) {
      if (givens[index]) continue;
      const removed = alternatives.filter(board => board[index] !== solution[index]).length;
      if (removed > score) { best = index; score = removed; }
    }
    if (best < 0) throw new Error('Cannot repair Sudoku');
    givens[best] = solution[best];
  }
  if (countSolutions(givens) !== 1) throw new Error('Unsolvable Sudoku');
  return { givens, solution, cells: [...givens], hinted: [], hints: 0, checks: 0 };
}

export function playOnlineMove(state: OnlineChess, from: Square, to: Square, promotion: PieceSymbol = 'q') {
  if (state.status !== 'playing') throw new Error('Puzzle already ended');
  const board = new Chess(state.fen);
  const move = board.move({ from, to, promotion });
  if (move.lan !== state.solution[state.step] && !board.isCheckmate()) {
    return { correct: false as const, move, attemptedFen: board.fen(), reply: null, state: { ...state, attempts: state.attempts + 1 }, message: 'That is legal, but another move is stronger. Try again from the same position.' };
  }
  let step = board.isCheckmate() ? state.solution.length : state.step + 1;
  const attemptedFen = board.fen();
  let reply: ReturnType<Chess['move']> | null = null;
  if (step < state.solution.length) { reply = board.move(state.solution[step]); step++; }
  const solved = step >= state.solution.length;
  return {
    correct: true as const, move, attemptedFen, reply,
    state: { ...state, fen: board.fen(), step, attempts: state.attempts + 1, hinted: false, status: solved ? 'solved' as const : 'playing' as const },
    message: solved ? 'Beautifully played! The whole line is solved. A fresh puzzle awaits with Next.' : `Correct. Opponent replies ${reply?.san}. Find your next move.`,
  };
}
