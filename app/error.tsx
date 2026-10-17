"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="site-container empty-state font-main">
      <h1>Unable to load the news</h1>
      <p>Please try again in a moment.</p>
      <button onClick={reset} className="primary-button">
        Try again
      </button>
      <Link href="/">Back to the latest news</Link>
    </main>
  );
}
