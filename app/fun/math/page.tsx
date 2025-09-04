"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NavbarComp from "@/components/NavBar";
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
  const ops: Op[] = ["+", "-", "*", "/"];
  while (true) {
    const op = pick(ops);
    let a = randInt(1, 12);
    let b = randInt(1, 12);
    let c: number;

    if (op === "+") c = a + b;
    else if (op === "-") {
      if (a < b) [a, b] = [b, a];
      c = a - b;
    } else if (op === "*") c = a * b;
    else {
      b = randInt(1, 12);
      c = randInt(1, 12);
      a = b * c;
    }

    const blank: Equation["blank"] = pick(["a", "b", "op", "c"]);
    return { id: String(id), a, b, op, c, blank };
  }
}

export default function MathPuzzle({
  title = "Math Puzzle",
  className = "",
  count = 6,
  showTitle = true,
  cellSize = 56,
  hints = 3
}: MathPuzzleProps) {
  const equations = useMemo(() => Array.from({ length: count }, (_, i) => generateEquation(i + 1)), [count]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [correct, setCorrect] = useState<Record<string, boolean>>({});
  const [wrongCount, setWrongCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(hints);

  const focusedRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const solutionFor = (eq: Equation) => {
    if (eq.blank === "a") return String(eq.a);
    if (eq.blank === "b") return String(eq.b);
    if (eq.blank === "c") return String(eq.c);
    return eq.op;
  };

  const validate = (eq: Equation, value: string) => value.trim() === solutionFor(eq);

  const handleChange = (id: string, eq: Equation, value: string) => {
    setAnswers(prevAnswers => {
      const prevVal = prevAnswers[id] ?? "";
      if (prevVal === value) return prevAnswers;

      const nowCorrect = validate(eq, value);

      setCorrect(prevCorrect => ({ ...prevCorrect, [id]: nowCorrect }));

      setWrongCount(prevWrong => {
        const prevCorrect = correct[id] ?? false;
        if (!nowCorrect && prevVal.trim() !== value.trim() && !prevCorrect) {
          return prevWrong + 1;
        }
        return prevWrong;
      });

      return { ...prevAnswers, [id]: value };
    });
  };

  const handleHint = () => {
    if (hintsLeft <= 0) return;
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

  const onPadPress = (ch: string) => {
    const el = focusedRef.current;
    if (!el) return;
    const id = el.dataset.eqid!;
    const eq = equations.find(e => e.id === id)!;

    let nextVal = ch;
    if (eq.blank === "a" || eq.blank === "b" || eq.blank === "c") {
      const prev = answers[id] ?? "";
      nextVal = (prev + ch).slice(0, 4);
    }

    handleChange(id, eq, nextVal);
  };

  const inputStyle = "w-24 h-10 text-center border rounded px-2 py-1 text-lg font-medium";
  const opStyle = "w-20 h-10 text-center border rounded px-2 py-1 text-lg font-medium";

  return (
    <div className="flex flex-col items-center h-screen">
      <Header />
      <NavbarComp />
      <div className="border-l border-r border-border w-5/6 h-full flex justify-center items-center">
        <div className={`md:w-1/2 border h-fit p-4 ${className}`}>
          {showTitle && (
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-2xl font-semibold">{title}</h2>
              <div className="text-sm text-gray-600">
                ⏱️ {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')} • ❌ {wrongCount} • Hints {hintsLeft}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {equations.map(eq => {
              const id = eq.id;
              const val = answers[id] ?? "";
              const isCorrect = correct[id] ?? false;
              const showCorrect = val !== "" && isCorrect;
              const showWrong = val !== "" && !isCorrect;

              const getInput = (blank: "a" | "b" | "op" | "c", display: string, style: string) => (
                eq.blank === blank ? (
                  <input
                    data-eqid={id}
                    ref={el => { if (el && document.activeElement === el) focusedRef.current = el; }}
                    value={val}
                    onFocus={e => { focusedRef.current = e.currentTarget; }}
                    onChange={e => handleChange(id, eq, e.target.value)}
                    className={`${style} ${showCorrect ? "border-green-600 text-green-700" : showWrong ? "border-red-600 text-red-600" : "border-gray-300"}`}
                  />
                ) : (
                  <div className={`${style} flex items-center justify-center`}>{display}</div>
                )
              );

              return (
                <div key={id} className="flex items-center gap-3">
                  <div className="w-6 text-right text-sm text-gray-600">{id}.</div>
                  {getInput("a", String(eq.a), inputStyle)}
                  {getInput("op", eq.op, opStyle)}
                  {getInput("b", String(eq.b), inputStyle)}
                  <div className="text-lg font-medium">=</div>
                  {getInput("c", String(eq.c), inputStyle)}
                  <div className="ml-4 text-sm text-gray-500">{isCorrect ? "✓" : ""}</div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleHint} disabled={hintsLeft <= 0} className="px-3 py-2 bg-black text-white rounded">
              Hint ({hintsLeft})
            </button>
            <button onClick={() => window.location.reload()} className="px-3 py-2 border rounded">
              New
            </button>
          </div>

          {/* Mobile keypad */}
          <div className="mt-6 md:hidden grid grid-cols-5 gap-2">
            {["1","2","3","4","5","6","7","8","9","+","-","*","/","0"].map(ch => (
              <button key={ch} onClick={() => onPadPress(ch)} className="p-3 bg-gray-200 rounded text-lg">{ch}</button>
            ))}
          </div>

          {solvedAll && <div className="mt-4 text-green-700 font-semibold">All correct — nice!</div>}
        </div>
      </div>
      <Footer />
    </div>
  );
}
