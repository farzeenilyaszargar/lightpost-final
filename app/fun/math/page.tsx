"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export type Op = "+" | "-" | "*" | "/";

export interface Equation {
  id: string;
  a: number;
  b: number;
  op: Op;
  c: number;
  blank: "a" | "b" | "op" | "c"; // which part is missing
}

export interface MathPuzzleProps {
  title?: string;
  className?: string;
  count?: number; // how many equations to generate
  showTitle?: boolean;
  cellSize?: number; // input size
  hints?: number; // number of hints available
}

// helpers
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEquation(id: number): Equation {
  // generate A op B = C with integer math and small numbers
  // prefer ops +,-,*,/ ensuring integer division
  const ops: Op[] = ["+","-","*","/"];
  while (true) {
    const op = pick(ops);
    let a = randInt(1, 12);
    let b = randInt(1, 12);
    let c: number;
    if (op === "+") c = a + b;
    else if (op === "-") {
      // ensure non-negative
      if (a < b) [a, b] = [b, a];
      c = a - b;
    } else if (op === "*") c = a * b;
    else {
      // division: ensure integer result
      // pick c and b then compute a = b * c
      b = randInt(1, 12);
      c = randInt(1, 12);
      a = b * c;
    }

    // valid equation found
    const blanks: Equation["blank"][] = ["a","b","op","c"];
    const blank = pick(blanks);
    return { id: String(id), a, b, op, c, blank };
  }
}

export default function MathPuzzle({ title = "Math Puzzle", className = "", count = 6, showTitle = true, cellSize = 56, hints = 3 }: MathPuzzleProps) {
  // generate fresh puzzle on each mount
  const equations = useMemo(() => Array.from({ length: count }, (_, i) => generateEquation(i+1)), [count]);

  // user answers keyed by equation id
  const [answers, setAnswers] = useState<Record<string, string>>(() => ({}));
  // correctness map
  const [correct, setCorrect] = useState<Record<string, boolean>>(() => ({}));
  // track wrong attempts count
  const [wrongCount, setWrongCount] = useState(0);
  // timer
  const [seconds, setSeconds] = useState(0);
  // hints left
  const [hintsLeft, setHintsLeft] = useState(hints);

  const focusedRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // compute solution text for a given equation and blank
  const solutionFor = (eq: Equation) => {
    if (eq.blank === "a") return String(eq.a);
    if (eq.blank === "b") return String(eq.b);
    if (eq.blank === "c") return String(eq.c);
    return eq.op;
  };

  // validate an input for an equation
  const validate = (eq: Equation, value: string) => {
    const sol = solutionFor(eq);
    // for operator compare exact, for numbers allow leading/trailing spaces
    return value.trim() === sol;
  };

  // handle change
  const handleChange = (id: string, eq: Equation, value: string) => {
    // unlimited editing allowed
    setAnswers(prev => {
      // avoid counting same input repeatedly
      const prevVal = prev[id] ?? "";
      if (prevVal === value) return prev;
      const next = { ...prev, [id]: value };

      // correctness check
      const wasCorrect = correct[id] ?? false;
      const nowCorrect = validate(eq, value);

      // update correctness map
      setCorrect(prevC => ({ ...prevC, [id]: nowCorrect }));

      // count a wrong attempt when value incorrect AND previous value wasn't the same incorrect value
      if (!nowCorrect && value.trim() !== "") {
        // increment wrong count only if previous value was different
        if (prevVal.trim() !== value.trim()) setWrongCount(w => w + 1);
      }

      // if user cleared input, don't change wrongCount
      return next;
    });
  };

  const handleHint = () => {
    if (hintsLeft <= 0) return;
    // reveal first unanswered equation
    for (const eq of equations) {
      const id = eq.id;
      const cur = answers[id] ?? "";
      if (!validate(eq, cur)) {
        const sol = solutionFor(eq);
        setAnswers(prev => ({ ...prev, [id]: sol }));
        setCorrect(prev => ({ ...prev, [id]: true }));
        setHintsLeft(h => h - 1);
        return;
      }
    }
  };

  const solvedAll = equations.every(eq => validate(eq, answers[eq.id] ?? ""));

  // mobile keypad injection helper
  const onPadPress = (ch: string) => {
    const el = focusedRef.current;
    if (!el) return;
    const id = el.dataset.eqid!;
    const eq = equations.find(e => e.id === id)!;
    // For operator blanks accept only operator chars
    let nextVal = ch;
    // For numeric blanks, allow multi-digit but keep it short
    if (eq.blank === "a" || eq.blank === "b" || eq.blank === "c") {
      // append digit
      const prev = answers[id] ?? "";
      nextVal = (prev + ch).slice(0, 4); // limit length
    }
    // update input value programmatically
    setAnswers(prev => ({ ...prev, [id]: nextVal }));
    // trigger correctness and wrongCount logic similar to handleChange
    const prevVal = (answers[id] ?? "").trim();
    const nowCorrect = validate(eq, nextVal);
    setCorrect(prev => ({ ...prev, [id]: nowCorrect }));
    if (!nowCorrect && nextVal.trim() !== "" && prevVal !== nextVal.trim()) setWrongCount(w => w + 1);
  };

  // rendering helpers
  const inputStyle = "w-24 h-10 text-center border rounded px-2 py-1 text-lg font-medium";
  const opStyle = "w-20 h-10 text-center border rounded px-2 py-1 text-lg font-medium";

  return (
    <div className={`max-w-3xl mx-auto p-4 ${className}`}>
      {showTitle && (
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <div className="text-sm text-gray-600">⏱ {Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')} • ❌ {wrongCount} • Hints {hintsLeft}</div>
        </div>
      )}

      <div className="space-y-3">
        {equations.map((eq) => {
          const id = eq.id;
          const val = answers[id] ?? "";
          const isCorrect = correct[id] ?? false;
          const showCorrect = val !== "" && isCorrect;
          const showWrong = val !== "" && !isCorrect;

          const aEl = (
            eq.blank === "a" ? (
              <input
                data-eqid={id}
                ref={el => { if (el && document.activeElement === el) focusedRef.current = el; }}
                value={val}
                onFocus={(e) => { focusedRef.current = e.currentTarget; }}
                onChange={(e) => handleChange(id, eq, e.target.value)}
                className={`${inputStyle} ${showCorrect ? "border-green-600 text-green-700" : showWrong ? "border-red-600 text-red-600" : "border-gray-300"}`}
              />
            ) : (
              <div className="w-24 h-10 flex items-center justify-center text-lg font-medium">{eq.a}</div>
            )
          );

          const bEl = (
            eq.blank === "b" ? (
              <input
                data-eqid={id}
                ref={el => { if (el && document.activeElement === el) focusedRef.current = el; }}
                value={val}
                onFocus={(e) => { focusedRef.current = e.currentTarget; }}
                onChange={(e) => handleChange(id, eq, e.target.value)}
                className={`${inputStyle} ${showCorrect ? "border-green-600 text-green-700" : showWrong ? "border-red-600 text-red-600" : "border-gray-300"}`}
              />
            ) : (
              <div className="w-24 h-10 flex items-center justify-center text-lg font-medium">{eq.b}</div>
            )
          );

          const opEl = (
            eq.blank === "op" ? (
              <input
                data-eqid={id}
                ref={el => { if (el && document.activeElement === el) focusedRef.current = el; }}
                value={val}
                onFocus={(e) => { focusedRef.current = e.currentTarget; }}
                onChange={(e) => handleChange(id, eq, e.target.value)}
                className={`${opStyle} ${showCorrect ? "border-green-600 text-green-700" : showWrong ? "border-red-600 text-red-600" : "border-gray-300"}`}
              />
            ) : (
              <div className="w-20 h-10 flex items-center justify-center text-lg font-medium">{eq.op}</div>
            )
          );

          const cEl = (
            eq.blank === "c" ? (
              <input
                data-eqid={id}
                ref={el => { if (el && document.activeElement === el) focusedRef.current = el; }}
                value={val}
                onFocus={(e) => { focusedRef.current = e.currentTarget; }}
                onChange={(e) => handleChange(id, eq, e.target.value)}
                className={`${inputStyle} ${showCorrect ? "border-green-600 text-green-700" : showWrong ? "border-red-600 text-red-600" : "border-gray-300"}`}
              />
            ) : (
              <div className="w-24 h-10 flex items-center justify-center text-lg font-medium">{eq.c}</div>
            )
          );

          return (
            <div key={id} className="flex items-center gap-3">
              <div className="w-6 text-right text-sm text-gray-600">{id}.</div>
              {aEl}
              {opEl}
              {bEl}
              <div className="text-lg font-medium">=</div>
              {cEl}
              <div className="ml-4 text-sm text-gray-500">{isCorrect ? "✓" : ""}</div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={handleHint} disabled={hintsLeft<=0} className="px-3 py-2 bg-black text-white rounded">Hint ({hintsLeft})</button>
        <button onClick={() => window.location.reload()} className="px-3 py-2 border rounded">New</button>
      </div>

      {/* Mobile keypad - visible only on small screens */}
      <div className="mt-6 md:hidden grid grid-cols-5 gap-2">
        {["1","2","3","4","5","6","7","8","9","+","-","*","/","0"].map(ch => (
          <button key={ch} onClick={() => onPadPress(ch)} className="p-3 bg-gray-200 rounded text-lg">{ch}</button>
        ))}
      </div>

      {solvedAll && <div className="mt-4 text-green-700 font-semibold">All correct — nice!</div>}
    </div>
  );
}
