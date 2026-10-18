"use client";
import { useEffect } from "react";
import GameFrame, {
  PuzzleControls,
  PuzzleLoading,
} from "@/components/games/GameFrame";
import { useMarkComplete } from "@/components/games/useDailyGame";
import { useOnlineGame } from "@/components/games/useOnlineGame";
import {
  makeWord,
  validWord,
  wordWon,
  wrongLetters,
  guessLetter,
} from "@/lib/games/words";
export default function MissingWord() {
  const game = useOnlineGame("/api/puzzles/word", makeWord, validWord);
  const s = game.state;
  const won = !!s && wordWon(s),
    wrong = s ? wrongLetters(s) : [],
    over = won || wrong.length >= 6;
  useMarkComplete("hangman", won, game.round === 0, game.day);
  useEffect(() => {
    function press(e: KeyboardEvent) {
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (/^[a-z]$/i.test(e.key)) {
        e.preventDefault();
        game.update((old) => guessLetter(old, e.key));
      }
    }
    window.addEventListener("keydown", press);
    return () => window.removeEventListener("keydown", press);
  }, [game]);
  function hint() {
    if (!s || over || s.hintUsed) return;
    const letter = s.word.split("").find((c) => !s.guessed.includes(c));
    if (letter)
      game.update((old) => ({ ...guessLetter(old, letter), hintUsed: true }));
  }
  return (
    <GameFrame
      id="hangman"
      title="The Missing Word"
      description="The printer has misplaced a word. Can you restore it to the page?"
      rules={[
        "Read the clue and guess the missing word, one letter at a time.",
        "Use the letter buttons or your keyboard. You may make six incorrect guesses.",
        "One hint reveals a missing letter without using a chance.",
        "After a win or loss, start over or take on another word.",
      ]}
      controls={<PuzzleControls game={game} />}
    >
      {!s ? (
        <PuzzleLoading />
      ) : (
        <>
          <div className="puzzle-stats">
            <span>{s.word.length} letters</span>
            <span>{6 - wrong.length} chances remaining</span>
          </div>
          <div className="word-drawing" aria-hidden="true">
            <svg
              viewBox="0 0 180 160"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M25 148h125M48 148V15h70v20M48 30l15-15" />
              {wrong.length > 0 && <circle cx="118" cy="48" r="13" />}
              {wrong.length > 1 && <path d="M118 61v37" />}
              {wrong.length > 2 && <path d="M118 70l-23 16" />}
              {wrong.length > 3 && <path d="M118 70l23 16" />}
              {wrong.length > 4 && <path d="M118 98l-20 30" />}
              {wrong.length > 5 && <path d="M118 98l20 30" />}
            </svg>
          </div>
          <p className="word-clue">{s.clue}</p>
          <div
            className="word-spaces"
            aria-label={
              over
                ? s.word
                : s.word
                    .split("")
                    .map((c) => (s.guessed.includes(c) ? c : "blank"))
                    .join(" ")
            }
          >
            {s.word.split("").map((c, i) => (
              <span
                key={i}
                className={!s.guessed.includes(c) && over ? "revealed" : ""}
              >
                {s.guessed.includes(c) || over ? c : ""}
              </span>
            ))}
          </div>
          <div className="letter-keyboard" aria-label="Letter keyboard">
            {"abcdefghijklmnopqrstuvwxyz".split("").map((c) => (
              <button
                key={c}
                onClick={() => game.update((old) => guessLetter(old, c))}
                disabled={over || s.guessed.includes(c)}
                className={
                  s.guessed.includes(c)
                    ? s.word.includes(c)
                      ? "correct-letter"
                      : "wrong-letter"
                    : ""
                }
                aria-label={`Guess ${c.toUpperCase()}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="puzzle-buttons">
            <button onClick={hint} disabled={over || s.hintUsed}>
              {s.hintUsed ? "Hint used" : "Reveal a letter"}
            </button>
            <button onClick={game.reset}>Start over</button>
          </div>
          <p className={`puzzle-message ${won ? "success" : ""}`} role="status">
            {won
              ? "Splendid! The word is restored to the press."
              : over
                ? `The missing word was “${s.word}”. A new word awaits when you are ready.`
                : "A little deduction, a little good fortune."}
          </p>
        </>
      )}
    </GameFrame>
  );
}
