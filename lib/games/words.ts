export const words = [
  {
    word: "inquiry",
    clue: "A search for knowledge; the beginning of a good report.",
  },
  {
    word: "gazette",
    clue: "A newspaper, especially one carrying official notices.",
  },
  { word: "lantern", clue: "A portable light to guide the evening reader." },
  { word: "curious", clue: "Eager to discover what lies beyond the headline." },
  {
    word: "chapter",
    clue: "One division of a book, or a new stage in a story.",
  },
  { word: "compass", clue: "A travelling instrument that points the way." },
  { word: "inkwell", clue: "A small vessel once found beside every writer." },
  {
    word: "dispatch",
    clue: "A report sent promptly from a distant correspondent.",
  },
  {
    word: "cabinet",
    clue: "A cupboard of curiosities, or a council of ministers.",
  },
  { word: "orchard", clue: "A place where fruit trees grow together." },
  {
    word: "parlour",
    clue: "A room in which visitors were received and games were played.",
  },
  { word: "riddle", clue: "A question whose answer requires a little wit." },
  { word: "silhouette", clue: "An outline filled with a single dark shade." },
  {
    word: "telescope",
    clue: "An instrument that brings distant stars into view.",
  },
  {
    word: "notebook",
    clue: "A small companion for a reporter’s observations.",
  },
  { word: "quill", clue: "A feather once sharpened for writing." },
  {
    word: "almanac",
    clue: "A yearly book of dates, facts, and useful predictions.",
  },
  {
    word: "circuit",
    clue: "A complete path, whether for a traveller or electricity.",
  },
  {
    word: "whisper",
    clue: "Speech meant for a nearby listener, not the whole room.",
  },
  {
    word: "library",
    clue: "A collection of books, and a haven for the inquisitive.",
  },
  {
    word: "portrait",
    clue: "A likeness of a person, painted or described in words.",
  },
  { word: "theatre", clue: "A house where stories come alive upon the stage." },
  { word: "velvet", clue: "A fabric with a soft, closely woven pile." },
  { word: "voyage", clue: "A journey, especially by sea." },
  { word: "pioneer", clue: "One who opens a path for others to follow." },
  { word: "archive", clue: "A collection preserving the records of the past." },
  { word: "sonnet", clue: "A poem of fourteen lines." },
  { word: "chronicle", clue: "A record of events in the order they occurred." },
  { word: "marvellous", clue: "Worthy of wonder and delight." },
  { word: "tinker", clue: "To make small experimental adjustments." },
];
export type WordState = {
  word: string;
  clue: string;
  guessed: string[];
  hintUsed: boolean;
};
export function makeWord(random: () => number): WordState {
  return {
    ...words[Math.floor(random() * words.length)],
    guessed: [],
    hintUsed: false,
  };
}
export function validWord(value: unknown): value is WordState {
  if (!value || typeof value !== "object") return false;
  const s = value as WordState;
  return (
    words.some((w) => w.word === s.word && w.clue === s.clue) &&
    Array.isArray(s.guessed) &&
    s.guessed.every((c) => typeof c === "string" && /^[a-z]$/.test(c)) &&
    typeof s.hintUsed === "boolean"
  );
}
export const wordWon = (s: WordState) =>
  s.word.split("").every((c) => s.guessed.includes(c));
export const wrongLetters = (s: WordState) =>
  s.guessed.filter((c) => !s.word.includes(c));
export function guessLetter(s: WordState, letter: string): WordState {
  const c = letter.toLowerCase();
  if (
    wordWon(s) ||
    wrongLetters(s).length >= 6 ||
    !/^[a-z]$/.test(c) ||
    s.guessed.includes(c)
  )
    return s;
  return { ...s, guessed: [...s.guessed, c] };
}
