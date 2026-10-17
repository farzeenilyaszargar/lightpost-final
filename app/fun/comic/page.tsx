"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";
type Comic = { num: number; title: string; img: string; alt: string };
export default function Comics() {
  const [comic, setComic] = useState<Comic | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/comic");
      if (!response.ok) throw new Error();
      setComic(await response.json());
    } catch {
      setError("The comic desk is taking a break. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <>
      <Header />
      <Navbar />
      <main id="main" className="site-container games-main">
        <div className="edition-heading">
          <div>
            <span className="eyebrow">A LITTLE HUMOUR / XKCD</span>
            <h1>
              A different <em>perspective.</em>
            </h1>
            <p>Comics by Randall Munroe. A small detour for your day.</p>
          </div>
          <button className="primary-button" onClick={load} disabled={loading}>
            {loading ? "Finding a comic…" : "Another comic ↗"}
          </button>
        </div>
        {error && (
          <p className="feed-notice" role="status">
            {error}
          </p>
        )}
        {comic && (
          <article className="comic-panel">
            <h2>{comic.title}</h2>
            <Image
              src={comic.img}
              alt={comic.alt}
              width={900}
              height={700}
              unoptimized
              style={{
                objectFit: "contain",
                height: "auto",
                maxHeight: "65vh",
                width: "auto",
                maxWidth: "100%",
              }}
            />
            <p>{comic.alt}</p>
            <a
              href={`https://xkcd.com/${comic.num}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Read at xkcd ↗
            </a>
          </article>
        )}
      </main>
      <Footer />
    </>
  );
}
