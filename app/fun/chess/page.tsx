"use client";

import Header from "@/components/Header";
import NavbarComp from "@/components/NavBar";
import Image from "next/image";
import { useState, useEffect } from "react";

interface PuzzleData {
  Players: string;
  Site: string;
  Image: string;
  Link: string;
  Text: string;
}

export default function Chess() {
  const [error, setError] = useState(false);
  const [chess, setChess] = useState<PuzzleData | null>(null);

  useEffect(() => {
    async function getPuzzle() {
      try {
        const res = await fetch("https://chesspuzzle.net/Daily/Api", {
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error("Failed to fetch puzzle");
        const data = await res.json();
        setChess(data);
      } catch (err) {
        console.error("Error fetching puzzle:", err);
        setError(true);
      }
    }

    getPuzzle();
  }, []);

  if (error)
    return (
      <>
        <Header />
        <NavbarComp />
        <main id="main" className="site-container empty-state">
          <h1>The chess desk is taking a break.</h1>
          <p>The puzzle provider is unavailable. Please try again later.</p>
          <a
            className="primary-button"
            href="https://chesspuzzle.net/Daily"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit ChessPuzzle ↗
          </a>
        </main>
      </>
    );
  if (!chess) {
    return (
      <p className="min-h-screen w-screen justify-center flex items-center">
        Loading daily puzzle...
      </p>
    );
  }
  return (
    <div className="w-screen min-h-screen flex flex-col items-center">
      <Header />
      <NavbarComp />
      <div id="main" className="border-border border-l border-r w-5/6 h-full flex flex-col justify-center items-center">
        <h1 className="font-black text-2xl mb-5">Daily Chess Puzzle</h1>
        <div className="border-border border rounded-2xl p-5 w-1/2 flex flex-col  items-center mb-10">
          <p className="font-semibold underline text-xl">
            {chess.Players.replace("-", " vs. ")}
          </p>
          <span className="font-medium text-base mb-5">
            {chess.Site.replace(/<br\s*\/?>/gi, " ")}
          </span>

          <a id="" href={chess.Link}>
            <Image
              alt="Daily Chess Puzzle"
              src={chess.Image}
              width={500}
              height={500}
              unoptimized
              className="w-full max-w-90 h-auto"
            />
          </a>
          <br />
          <h3 className="">{chess.Text} !</h3>
        </div>
      </div>
    </div>
  );
}
