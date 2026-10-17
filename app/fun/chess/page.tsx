"use client";
import { useEffect, useState } from "react";
import { Chess, type Square } from "chess.js";
import GameFrame, {
  PuzzleControls,
  PuzzleLoading,
} from "@/components/games/GameFrame";
import { useDailyGame, useMarkComplete } from "@/components/games/useDailyGame";
import {
  makeChess,
  validChess,
  chessProblems,
  matingMoves,
} from "@/lib/games/chess";
const glyphs = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};
const names = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};
export default function ChessProblem() {
  const game = useDailyGame("chess", makeChess, validChess);
  const s = game.state;
  const [selected, setSelected] = useState<Square | null>(null),
    [message, setMessage] = useState("");
  useEffect(() => {
    setSelected(null);
    setMessage("");
  }, [game.key]);
  useMarkComplete("chess", s?.status === "solved", game.round === 0, game.day);
  const chess = s ? new Chess(s.fen) : null,
    problem = s ? chessProblems[s.problem] : null;
  const legal =
    chess && selected
      ? chess.moves({ square: selected, verbose: true }).map((move) => move.to)
      : [];
  function select(square: Square) {
    if (!s || !chess || s.status !== "playing") return;
    const piece = chess.get(square);
    if (piece?.color === "w") {
      setSelected(square);
      setMessage(
        `Selected ${names[piece.type]} on ${square}. Choose a destination.`,
      );
      return;
    }
    if (!selected) {
      setMessage("Select a white piece first.");
      return;
    }
    try {
      const move = chess.move({ from: selected, to: square, promotion: "q" });
      if (chess.isCheckmate()) {
        game.update((old) => ({
          ...old,
          fen: chess.fen(),
          attempts: old.attempts + 1,
          status: "solved",
        }));
        setMessage(`Checkmate! ${move.san} is the winning move.`);
        setSelected(null);
      } else {
        game.update((old) => ({ ...old, attempts: old.attempts + 1 }));
        setMessage(
          `${move.san} is legal, but it isn’t checkmate. The position has been restored; try again.`,
        );
        setSelected(null);
      }
    } catch {
      setMessage(
        "That move is not legal. Choose a marked square or select another white piece.",
      );
    }
  }
  function reveal() {
    if (!s || s.status !== "playing") return;
    const solution = matingMoves(s.fen)[0];
    if (!solution) return;
    const board = new Chess(s.fen);
    board.move(solution);
    game.update((old) => ({ ...old, fen: board.fen(), status: "revealed" }));
    setSelected(null);
    setMessage(
      `The solution is ${solution.san}. Replay the position to try it yourself.`,
    );
  }
  return (
    <GameFrame
      id="chess"
      title="The Chess Problem"
      description="White to move. One precise move will settle the matter."
      rules={[
        "Find checkmate in one move. White is at the bottom of the board.",
        "Select a white piece, then its destination. Small dots show its legal moves.",
        "A legal move that is not checkmate is returned to the starting position so you may try again.",
        "A hint gives a clue. Revealing the solution does not mark the daily problem as solved.",
      ]}
      controls={<PuzzleControls {...game} />}
    >
      {!s || !chess || !problem ? (
        <PuzzleLoading />
      ) : (
        <>
          <div className="puzzle-stats">
            <span>{problem.name}</span>
            <span>
              {s.attempts} {s.attempts === 1 ? "attempt" : "attempts"} ·{" "}
              {s.status === "playing" ? "White to move" : "Checkmate"}
            </span>
          </div>
          <div
            className="chess-board"
            role="group"
            aria-label="Chess board. White to move, mate in one."
          >
            {chess.board().flatMap((row, r) =>
              row.map((piece, c) => {
                const square = `${"abcdefgh"[c]}${8 - r}` as Square;
                return (
                  <button
                    key={square}
                    className={`${(r + c) % 2 ? "chess-dark" : "chess-light"} ${selected === square ? "selected" : ""}`}
                    onClick={() => select(square)}
                    disabled={s.status !== "playing"}
                    aria-label={`${square}, ${piece ? `${piece.color === "w" ? "white" : "black"} ${names[piece.type]}` : "empty"}${legal.includes(square) ? ", legal destination" : ""}`}
                    aria-pressed={selected === square}
                  >
                    {piece && (
                      <span className={`chess-piece piece-${piece.color}`}>
                        {glyphs[piece.color][piece.type]}
                      </span>
                    )}
                    {!piece && legal.includes(square) && (
                      <span className="legal-dot" />
                    )}
                    {c === 0 && <small className="chess-rank">{8 - r}</small>}
                    {r === 7 && (
                      <small className="chess-file">{"abcdefgh"[c]}</small>
                    )}
                  </button>
                );
              }),
            )}
          </div>
          <div className="puzzle-buttons">
            <button
              disabled={s.status !== "playing" || s.hinted}
              onClick={() => game.update((old) => ({ ...old, hinted: true }))}
            >
              {s.hinted ? "Hint given" : "A hint"}
            </button>
            <button disabled={s.status !== "playing"} onClick={reveal}>
              Reveal solution
            </button>
            <button
              onClick={() => {
                game.reset();
                setSelected(null);
                setMessage("");
              }}
            >
              Start over
            </button>
          </div>
          {s.hinted && <p className="puzzle-hint">{problem.hint}</p>}
          <p
            className={`puzzle-message ${s.status === "solved" ? "success" : ""}`}
            role="status"
          >
            {message ||
              (s.status === "solved"
                ? "Checkmate! A beautifully reasoned move."
                : s.status === "revealed"
                  ? "The solution is on the board. Start over to replay it."
                  : "Select a white piece to begin. Every problem has a verified mate in one.")}
          </p>
        </>
      )}
    </GameFrame>
  );
}
