"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import GameFrame from "@/components/games/GameFrame";
import HouseComic from "@/components/games/HouseComic";
type Comic = { num: number; title: string; img: string; alt: string };
export default function FunnyPapers() {
  const [comic, setComic] = useState<Comic | null>(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [house, setHouse] = useState(0),
    [mode, setMode] = useState<"house" | "xkcd">("house");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function load() {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setMode("xkcd");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/comic", {
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(14000),
        ]),
      });
      if (!response.ok) throw new Error();
      const data: unknown = await response.json();
      const item = data as Comic;
      if (
        !item ||
        !Number.isInteger(item.num) ||
        typeof item.title !== "string" ||
        typeof item.img !== "string" ||
        !item.img.startsWith("https://imgs.xkcd.com/")
      )
        throw new Error();
      setComic(item);
    } catch {
      if (controller.signal.aborted) return;
      setError(
        "The xkcd wire is unavailable. The Lightpost sketchbook is open below.",
      );
      setMode("house");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  function local() {
    request.current?.abort();
    setLoading(false);
    setMode("house");
    setHouse((n) => n + 1);
    setError("");
  }
  return (
    <GameFrame
      id="comic"
      title="The Funny Papers"
      description="A small illustrated diversion, prescribed for excessively serious days."
      rules={[
        "The Lightpost sketchbook opens immediately, without a network request.",
        "Select Read xkcd for a random comic by Randall Munroe, credited with a link to the original.",
        "If the comic wire is down, our in-house panels remain available.",
      ]}
      controls={
        <>
          <span className="puzzle-edition">Illustrated diversions</span>
          <div className="puzzle-controls">
            <button onClick={local}>Another sketch ↻</button>
            <button onClick={load} disabled={loading}>
              {loading
                ? "Calling the wire…"
                : mode === "xkcd"
                  ? "Another xkcd ↻"
                  : "Read xkcd ↗"}
            </button>
          </div>
        </>
      }
    >
      {error && (
        <p className="puzzle-message" role="status">
          {error}
        </p>
      )}
      {mode === "xkcd" && loading && (
        <p className="puzzle-loading" role="status">
          A comic is on its way. The sketchbook remains at hand.
        </p>
      )}
      {mode === "xkcd" && comic && !loading ? (
        <article className="xkcd-comic">
          <p className="amusement-kicker">XKCD • RANDALL MUNROE</p>
          <h2>{comic.title}</h2>
          <Image
            src={comic.img}
            alt={comic.alt || comic.title}
            width={900}
            height={700}
            unoptimized
            onError={() => {
              setError(
                "The comic image could not be reached. Here is a sketch from our own papers.",
              );
              setMode("house");
            }}
          />
          <p>{comic.alt}</p>
          <a
            href={`https://xkcd.com/${comic.num}/`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the original at xkcd ↗
          </a>
        </article>
      ) : (
        <HouseComic index={house} />
      )}
    </GameFrame>
  );
}
