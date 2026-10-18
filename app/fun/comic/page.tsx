"use client";
import Icon from "@/components/Icon";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { comicNeighbor } from "@/lib/comics";
import GameFrame, { PuzzleLoading } from "@/components/games/GameFrame";
import HouseComic from "@/components/games/HouseComic";
type Comic = { num: number; title: string; img: string; alt: string; latest: number };
export default function FunnyPapers() {
  const [comic, setComic] = useState<Comic | null>(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [house, setHouse] = useState(0),
    [mode, setMode] = useState<"house" | "xkcd">("house");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const load = useCallback(async (number?: number) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setMode("xkcd");
    setLoading(true);
    setError("");
    try {
      const response = await fetch(number ? `/api/comic?num=${number}` : "/api/comic", {
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
      if (!Number.isInteger(item.latest) || item.latest < item.num) throw new Error();
      if (controller.signal.aborted) return;
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
  }, []);
  useEffect(() => { void load(); }, [load]);
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
        "The latest xkcd opens automatically. Next and Previous browse its archive without a daily cap.",
        "At either end of the archive, keep going to wrap around. Comic 404 is deliberately missing and is skipped.",
        "If the comic wire is down, our in-house panels remain available.",
      ]}
      controls={
        <>
          <span className="puzzle-edition">{comic && mode === "xkcd" ? `xkcd · No. ${comic.num} of ${comic.latest}` : "The Lightpost sketchbook"}</span>
          <div className="puzzle-controls">
            <button disabled={loading || !comic} onClick={() => { if (comic) { void load(comicNeighbor(comic.num, comic.latest, -1)); } }}>Previous</button>
            <button onClick={() => { void load(comic ? comicNeighbor(comic.num, comic.latest, 1) : undefined); }} disabled={loading}>{loading ? 'Calling the wire…' : 'Next comic →'}</button>
            <button onClick={local}>Sketchbook</button>
          </div>
        </>
      }
    >
      {error && (
        <p className="puzzle-message" role="status">
          {error}
        </p>
      )}
      {mode === "xkcd" && comic ? (
        <article className="xkcd-comic" aria-busy={loading}>
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
            Read the original at xkcd <Icon name="arrowUpRight" size={20} className="outbound-icon" />
          </a>
        </article>
      ) : mode === "xkcd" && loading ? (
        <PuzzleLoading />
      ) : (
        <HouseComic index={house} />
      )}
    </GameFrame>
  );
}
