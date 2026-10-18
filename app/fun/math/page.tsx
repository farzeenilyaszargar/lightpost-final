"use client";
import GameFrame, {
  PuzzleControls,
  PuzzleLoading,
} from "@/components/games/GameFrame";
import { useDailyGame, useMarkComplete } from "@/components/games/useDailyGame";
import {
  makeArithmetic,
  validArithmetic,
  validAnswer,
  equationAnswer,
  arithmeticDone,
  type Equation,
} from "@/lib/games/arithmetic";
export default function Arithmetic() {
  const game = useDailyGame("arithmetic", makeArithmetic, validArithmetic);
  const s = game.state,
    done = !!s && arithmeticDone(s);
  useMarkComplete("math", done, game.round === 0, game.day);
  function answer(index: number, value: string) {
    if (done) return;
    game.update((old) => ({
      ...old,
      answers: old.answers.map((a, i) => (i === index ? value : a)),
      checked: old.checked.map((v, i) => (i === index ? false : v)),
    }));
  }
  function hint() {
    if (!s || done || s.hints >= 3) return;
    const i = s.questions.findIndex((q, i) => !validAnswer(q, s.answers[i]));
    if (i < 0) return;
    game.update((old) => ({
      ...old,
      answers: old.answers.map((a, j) =>
        j === i ? equationAnswer(old.questions[i]) : a,
      ),
      checked: old.checked.map((a, j) => (j === i ? true : a)),
      hints: old.hints + 1,
    }));
  }
  function part(q: Equation, index: number, key: Equation["blank"]) {
    return q.blank !== key ? (
      <span>{q[key]}</span>
    ) : key === "op" ? (
      <select
        disabled={done}
        value={s!.answers[index]}
        onChange={(e) => answer(index, e.target.value)}
        aria-label={`Answer to equation ${index + 1}`}
      >
        <option value="">?</option>
        {["+", "−", "×", "÷"].map((op) => (
          <option key={op}>{op}</option>
        ))}
      </select>
    ) : (
      <input
        aria-label={`Answer to equation ${index + 1}`}
        autoComplete="off"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={3}
        placeholder="?"
        value={s!.answers[index]}
        disabled={done}
        onChange={(e) => {
          if (/^\d*$/.test(e.target.value)) answer(index, e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter")
            game.update((old) => ({
              ...old,
              checked: old.questions.map(() => true),
              checks: old.checks + 1,
            }));
        }}
      />
    );
  }
  const correct =
    s?.questions.filter((q, i) => s.checked[i] && validAnswer(q, s.answers[i]))
      .length || 0;
  return (
    <GameFrame
      id="math"
      title="The Reckoning"
      description="The accounts are almost in order. Supply the figures the clerk has omitted."
      rules={[
        "Fill each missing number. In the final equation, choose the missing sign.",
        "Press Check answers when ready. Typing a number does not count as a mistake.",
        "A tick means the equation is correct. Any mathematically valid sign is accepted.",
        "Three hints are available. A new sheet resets answers and hints without reloading the page.",
      ]}
      controls={<PuzzleControls game={game} />}
    >
      {!s ? (
        <PuzzleLoading />
      ) : (
        <>
          <div className="puzzle-stats">
            <span>{correct} of 6 correct</span>
            <span>{3 - s.hints} hints remaining</span>
          </div>
          <div className="arithmetic-sheet">
            {s.questions.map((q, i) => (
              <div
                className={`arithmetic-row ${s.checked[i] ? (validAnswer(q, s.answers[i]) ? "answer-correct" : "answer-incorrect") : ""}`}
                key={`${game.key}:${i}`}
              >
                <span className="equation-number">
                  {String(i + 1).padStart(2, "0")}.
                </span>
                {part(q, i, "a")}
                {part(q, i, "op")}
                {part(q, i, "b")}
                <span>=</span>
                {part(q, i, "c")}
                <span
                  className="equation-feedback"
                  aria-label={
                    s.checked[i]
                      ? validAnswer(q, s.answers[i])
                        ? "Correct"
                        : "Try again"
                      : "Not checked"
                  }
                >
                  {s.checked[i]
                    ? validAnswer(q, s.answers[i])
                      ? "✓"
                      : "?"
                    : "·"}
                </span>
              </div>
            ))}
          </div>
          <div className="puzzle-buttons">
            <button
              className="ink-button"
              disabled={done}
              onClick={() =>
                game.update((old) => ({
                  ...old,
                  checked: old.questions.map(() => true),
                  checks: old.checks + 1,
                }))
              }
            >
              Check answers
            </button>
            <button disabled={done || s.hints >= 3} onClick={hint}>
              A hint ({3 - s.hints})
            </button>
            <button onClick={game.reset}>Start over</button>
          </div>
          <p
            className={`puzzle-message ${done ? "success" : ""}`}
            role="status"
          >
            {done
              ? "The books balance beautifully. All six are correct!"
              : s.checks > 0
                ? `${correct} of 6 correct. Review the equations marked with a question mark.`
                : "Pencil in your answers, then check the sheet."}
          </p>
        </>
      )}
    </GameFrame>
  );
}
