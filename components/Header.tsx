"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { isDarkTheme, serverTheme, subscribeTheme, toggleTheme } from "@/lib/theme";

function Top() {
  const dateTxt = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Kolkata",
  }).format(new Date());
  return (
    <div className="w-full border-b flex justify-center font-menu h-6 border-border">
      <div className="w-5/6 border-l border-r flex justify-end text-[10px] border-border items-center">
        <time className="pr-5 text-string-secondary" suppressHydrationWarning>{dateTxt}</time>
      </div>
    </div>
  );
}

export default function Header() {
  const darkMode = useSyncExternalStore(subscribeTheme, isDarkTheme, serverTheme);
  return (
    <header className="w-full flex flex-col items-center border-border border-b">
      <Top />
      <div className="masthead w-5/6 border-l border-r border-border">
        <Link href="/" aria-label="Lightpost home" className="masthead-logo font-logo">LIGHTPOST</Link>
        <div className="masthead-actions">
          <button onClick={toggleTheme} aria-label="Dark theme" aria-pressed={darkMode} title="Toggle light or dark theme">
            <Image src="/icons/moon.png" alt="" width={25} height={25} unoptimized className="theme-moon invert-[var(--my-invert)]" />
            <Image src="/icons/sun.png" alt="" width={25} height={25} unoptimized className="theme-sun invert-[var(--my-invert)]" />
          </button>
          <Link href="/saved" prefetch={false} aria-label="Saved stories" title="Saved stories">
            <Image src="/icons/profile.png" alt="" width={35} height={35} unoptimized className="invert-[var(--my-invert)]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
