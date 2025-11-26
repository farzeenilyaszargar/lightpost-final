"use client";

import Header from "@/components/Header";
import NavbarComp from "@/components/NavBar";
import React, { useEffect, useState } from "react";

const maxWrong = 6;

// Simple hangman stages (ASCII style, you can replace with images)
const hangmanStages = [
  "",
  "O",
  "O\n |",
  "\t      O\n/|",
  "\t\tO \n/|\\",
  "O\n/|\\\n/",
  "O\n/|\\\n/ \\",
];

const Hangman: React.FC = () => {
  const [word, setWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);

  // Fetch a random word from API
  const fetchWord = async () => {
    try {
      const res = await fetch("https://random-word-api.herokuapp.com/word?length=5");
      const data: string[] = await res.json();
      setWord(data[0].toLowerCase());
      setGuessedLetters([]);
      setWrongGuesses(0);
      setHintUsed(false);
    } catch (err) {
      console.error(err);
      // fallback
      setWord("nextjs");
    }
  };

  useEffect(() => {
    fetchWord();
  }, []);

  const handleGuess = (letter: string) => {
    if (!guessedLetters.includes(letter)) {
      setGuessedLetters([...guessedLetters, letter]);
      if (!word.includes(letter)) {
        setWrongGuesses(wrongGuesses + 1);
      }
    }
  };

  const giveHint = () => {
    if (!hintUsed) {
      const remainingLetters = word.split("").filter(l => !guessedLetters.includes(l));
      if (remainingLetters.length > 0) {
        const randomLetter = remainingLetters[Math.floor(Math.random() * remainingLetters.length)];
        handleGuess(randomLetter);
        setHintUsed(true);
      }
    }
  };

  const displayWord = word
    .split("")
    .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
    .join(" ");

  const isWinner = word && word.split("").every((letter) => guessedLetters.includes(letter));
  const isLoser = wrongGuesses >= maxWrong;

  return (
    <div className="flex flex-col items-center w-screen h-screen">
      <Header />
      <NavbarComp />
      <div className="w-5/6 flex flex-col items-center justify-center h-full border-border border-l border-r p-4">
        <h1 className="text-2xl font-bold mb-4">Hangman Game</h1>

        <pre className="text-xl font-mono mb-4 whitespace-pre-line">
          {hangmanStages[wrongGuesses]}
        </pre>

        <div className="text-2xl font-mono mb-4">{displayWord}</div>
        <p>Wrong guesses: {wrongGuesses} / {maxWrong}</p>

        {isWinner && <p className="text-green-600 font-bold mt-4">You won! 🎉</p>}
        {isLoser && <p className="text-red-600 font-bold mt-4">You lost! The word was "{word}"</p>}

        {!isWinner && !isLoser && (
          <>
            <div className="grid grid-cols-7 gap-2 mt-4">
              {"abcdefghijklmnopqrstuvwxyz".split("").map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={guessedLetters.includes(letter)}
                  className={`px-2 py-1 rounded ${guessedLetters.includes(letter)
                      ? "bg-gray-300"
                      : "bg-string-primary text-background hover:opacity-80 font-bold"
                    }`}
                >
                  {letter}
                </button>
              ))}
            </div>
            <button
              className={`mt-4 px-4 py-2 rounded text-white ${hintUsed ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              onClick={giveHint}
              disabled={hintUsed}
            >
              Hint
            </button>
          </>
        )}

        <button
          className="mt-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={fetchWord}
        >
          Restart
        </button>
      </div>
    </div>

  );
};

export default Hangman;
