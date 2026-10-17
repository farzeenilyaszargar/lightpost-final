"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
export default function Header() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    let enabled = false;
    try {
      enabled = localStorage.getItem("darkMode") === "true";
    } catch {
      /* Storage may be disabled by the browser. */
    }
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem("darkMode", String(next));
    } catch {
      /* Theme still works for this visit. */
    }
    document.documentElement.classList.toggle("dark", next);
  }
  return (
    <header className="masthead">
      <div className="site-container masthead-inner">
        <Link href="/" className="wordmark" aria-label="Lightpost home">
          <span className="brand-mark">
            l<span>p</span>
          </span>
          lightpost<span className="brand-dot">.</span>
        </Link>
        <span className="masthead-note">
          A little clarity in a noisy world.
        </span>
        <div className="header-actions">
          <Link href="/saved" className="saved-link">
            Bookmarks <span aria-hidden="true">↗</span>
          </Link>
          <button
            className="theme-button"
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {dark ? "☀" : "◐"}
          </button>
        </div>
      </div>
    </header>
  );
}
