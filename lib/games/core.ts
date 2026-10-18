export function editionKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function seededRandom(seed: string) {
  let value = 2166136261;
  for (const char of seed)
    value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return () => {
    value += 0x6d2b79f5;
    let n = Math.imul(value ^ (value >>> 15), 1 | value);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffled<T>(items: T[], random: () => number) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export const gameList = [
  {
    id: "sudoku",
    name: "Sudoku",
    deck: "Nine squares, one certain answer.",
    detail: "A proper exercise in deduction, with one unique solution.",
    kind: "Logic & reason",
    time: "5–15 minutes",
    mark: "sudoku",
  },
  {
    id: "hangman",
    name: "The Missing Word",
    deck: "A word is missing from the press.",
    detail:
      "Follow the clue and restore the letters before your chances run out.",
    kind: "Words & wit",
    time: "2–4 minutes",
    mark: "word",
  },
  {
    id: "math",
    name: "The Reckoning",
    deck: "A few figures to keep the mind sharp.",
    detail: "Supply the missing numbers and signs in six little equations.",
    kind: "Mental arithmetic",
    time: "3–5 minutes",
    mark: "math",
  },
  {
    id: "sliding",
    name: "The Sliding Square",
    deck: "A place for everything; everything in its place.",
    detail:
      "Arrange eight numbered tiles with a little patience and foresight.",
    kind: "Order & strategy",
    time: "3–8 minutes",
    mark: "sliding",
  },
  {
    id: "chess",
    name: "The Chess Problem",
    deck: "Tactics from real games, printed in ink.",
    detail: "Play a complete tactical line from Lichess, then turn to the next.",
    kind: "A game of kings",
    time: "2–5 minutes",
    mark: "chess",
  },
  {
    id: "comic",
    name: "The Funny Papers",
    deck: "A modest remedy for a serious day.",
    detail:
      "A comic from xkcd, with a little in-house humour when the wire is down.",
    kind: "Illustrated diversion",
    time: "A brief interlude",
    mark: "comic",
  },
] as const;
export function isNumberArray(value: unknown, length: number, max: number) {
  return (
    Array.isArray(value) &&
    value.length === length &&
    value.every((n) => Number.isInteger(n) && n >= 0 && n <= max)
  );
}
