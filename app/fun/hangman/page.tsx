"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NavbarComp from "@/components/NavBar";

import React, { useEffect, useState } from "react";

const maxWrong = 6;

// Simple hangman stages (ASCII style, you can replace with images)
const HANGMANPICS = [
  `
  +---+
  |   |
      |
      |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
      |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
  `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`,
];

export default function HangmanGame() {
  const [word, setWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);

  const fetchWord = () => {
    const words = [
      "earth",
      "light",
      "story",
      "ocean",
      "plant",
      "cloud",
      "river",
      "music",
      "dream",
      "spark",
      "green",
      "peace",
      "world",
      "space",
      "brain",
      "quiet",
      "paper",
      "field",
      "stone",
      "flora",
    ];
    setWord(words[Math.floor(Math.random() * words.length)]);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setHintUsed(false);
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
      const remainingLetters = word
        .split("")
        .filter((l) => !guessedLetters.includes(l));
      if (remainingLetters.length > 0) {
        const randomLetter =
          remainingLetters[Math.floor(Math.random() * remainingLetters.length)];
        handleGuess(randomLetter);
        setHintUsed(true);
      }
    }
  };

  const displayWord = word
    .split("")
    .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
    .join(" ");

  const isWinner =
    word && word.split("").every((letter) => guessedLetters.includes(letter));
  const isLoser = wrongGuesses >= maxWrong;
  return (
    <div className="flex flex-col items-center w-screen min-h-screen">
      <Header />
      <NavbarComp />

      <div id="main" className="border-border border-l border-r w-5/6 h-full flex items-center justify-center ">
        <div className="flex flex-col  items-center  mb-10">
          <pre className="font-mono text-lg">{HANGMANPICS[wrongGuesses]}</pre>
          <div className="text-2xl font-mono mb-4">{displayWord}</div>
          <p>
            Wrong guesses: {wrongGuesses} / {maxWrong}
          </p>

          {isWinner && (
            <p className="text-green-600 font-bold mt-4">You won! 🎉</p>
          )}
          {isLoser && (
            <p className="text-red-600 font-bold mt-4">
              You lost! The word was &quot;{word}&quot;
            </p>
          )}
          {!isWinner && !isLoser && (
            <>
              <div className="grid grid-cols-7 gap-2 mt-4">
                {"abcdefghijklmnopqrstuvwxyz".split("").map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleGuess(letter)}
                    disabled={guessedLetters.includes(letter)}
                    className={`px-2 py-1 rounded ${
                      guessedLetters.includes(letter)
                        ? "bg-gray-400"
                        : "bg-string-primary text-background hover:opacity-80 font-bold"
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="flex gap-5 mt-5">
            <button
              className={`px-4 py-2 rounded text-white ${hintUsed || isLoser ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600"}`}
              onClick={giveHint}
              disabled={hintUsed || isLoser}
            >
              💡 Hint
            </button>

            <button
              className=" px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={fetchWord}
            >
              🔄 Restart
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
