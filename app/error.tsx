"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="site-container empty-state">
      <span>↗</span>
      <h1>A momentary interruption.</h1>
      <p>We couldn’t load this edition. Please try again.</p>
      <button className="primary-button" onClick={reset}>
        Try again
      </button>
      <Link href="/">Return to the latest headlines</Link>
    </main>
  );
}
