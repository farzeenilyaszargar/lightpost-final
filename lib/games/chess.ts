import { Chess } from "chess.js";
export const chessProblems = [
  {
    name: "The back rank",
    fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    hint: "The rook can make use of the king’s crowded back rank.",
  },
  {
    name: "A royal escort",
    fen: "7k/8/5KQ1/8/8/8/8/8 w - - 0 1",
    hint: "Bring the queen closer. The white king is there to protect her.",
  },
  {
    name: "No room at the inn",
    fen: "6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1",
    hint: "A knight can leap over a king’s own crowded defences.",
  },
  {
    name: "The open file",
    fen: "6k1/5ppp/8/8/2B5/8/5PPP/3R2K1 w - - 0 1",
    hint: "There is an open road for the rook, straight to the last rank.",
  },
  {
    name: "The cornered monarch",
    fen: "7k/5Kpp/8/6Q1/8/8/8/8 w - - 0 1",
    hint: "The queen has two ways to deliver mate. Look at the back rank and the pawn on g7.",
  },
  {
    name: "Across the board",
    fen: "k7/pp6/8/8/8/8/PP6/K2R4 w - - 0 1",
    hint: "The rook belongs on the eighth rank, where there is nowhere for the king to flee.",
  },
];
export type ChessState = {
  problem: number;
  fen: string;
  attempts: number;
  hinted: boolean;
  status: "playing" | "solved" | "revealed";
};
export function makeChess(random: () => number): ChessState {
  const problem = Math.floor(random() * chessProblems.length);
  return {
    problem,
    fen: chessProblems[problem].fen,
    attempts: 0,
    hinted: false,
    status: "playing",
  };
}
export function matingMoves(fen: string) {
  const engine = new Chess(fen);
  return engine.moves({ verbose: true }).filter((move) => {
    engine.move(move);
    const mate = engine.isCheckmate();
    engine.undo();
    return mate;
  });
}
export function validChess(value: unknown): value is ChessState {
  if (!value || typeof value !== "object") return false;
  const s = value as ChessState;
  if (
    !Number.isInteger(s.problem) ||
    !chessProblems[s.problem] ||
    !Number.isInteger(s.attempts) ||
    s.attempts < 0 ||
    typeof s.hinted !== "boolean" ||
    !["playing", "solved", "revealed"].includes(s.status)
  )
    return false;
  try {
    const chess = new Chess(s.fen);
    return s.status === "playing"
      ? s.fen === chessProblems[s.problem].fen
      : chess.isCheckmate();
  } catch {
    return false;
  }
}
