export type Operator = "+" | "−" | "×" | "÷";
export type Equation = {
  a: number;
  b: number;
  c: number;
  op: Operator;
  blank: "a" | "b" | "c" | "op";
};
export type ArithmeticState = {
  questions: Equation[];
  answers: string[];
  checked: boolean[];
  hints: number;
  checks: number;
};
export function makeArithmetic(random: () => number): ArithmeticState {
  const questions = Array.from({ length: 6 }, (_, i) => {
    const op = (["+", "−", "×", "÷"] as const)[Math.floor(random() * 4)];
    let a = 2 + Math.floor(random() * 11),
      b = 2 + Math.floor(random() * 11),
      c: number;
    if (op === "+") c = a + b;
    else if (op === "−") {
      if (a < b) [a, b] = [b, a];
      c = a - b;
    } else if (op === "×") c = a * b;
    else {
      c = a;
      a = b * c;
    }
    return {
      a,
      b,
      c,
      op,
      blank:
        i === 5
          ? ("op" as const)
          : (["a", "b", "c"] as const)[Math.floor(random() * 3)],
    };
  });
  return {
    questions,
    answers: Array(6).fill(""),
    checked: Array(6).fill(false),
    hints: 0,
    checks: 0,
  };
}
export function validAnswer(q: Equation, answer: string) {
  let { a, b, c, op } = q;
  if (q.blank === "op") {
    if (!["+", "−", "×", "÷"].includes(answer)) return false;
    op = answer as Operator;
  } else {
    if (!/^\d+$/.test(answer.trim())) return false;
    const n = Number(answer);
    if (q.blank === "a") a = n;
    else if (q.blank === "b") b = n;
    else c = n;
  }
  return op === "+"
    ? a + b === c
    : op === "−"
      ? a - b === c
      : op === "×"
        ? a * b === c
        : b !== 0 && a / b === c;
}
export function equationAnswer(q: Equation) {
  return String(q.blank === "op" ? q.op : q[q.blank]);
}
export function arithmeticDone(s: ArithmeticState) {
  return s.questions.every(
    (q, i) => s.checked[i] && validAnswer(q, s.answers[i]),
  );
}
export function validArithmetic(value: unknown): value is ArithmeticState {
  if (!value || typeof value !== "object") return false;
  const s = value as ArithmeticState;
  return (
    Array.isArray(s.questions) &&
    s.questions.length === 6 &&
    s.questions.every(
      (q) =>
        q &&
        [q.a, q.b, q.c].every(
          (n) => Number.isInteger(n) && n >= 0 && n <= 200,
        ) &&
        ["+", "−", "×", "÷"].includes(q.op) &&
        ["a", "b", "c", "op"].includes(q.blank),
    ) &&
    Array.isArray(s.answers) &&
    s.answers.length === 6 &&
    s.answers.every((a) => typeof a === "string") &&
    Array.isArray(s.checked) &&
    s.checked.length === 6 &&
    s.checked.every((c) => typeof c === "boolean") &&
    Number.isInteger(s.hints) &&
    s.hints >= 0 &&
    s.hints <= 3 &&
    Number.isInteger(s.checks) &&
    s.checks >= 0
  );
}
