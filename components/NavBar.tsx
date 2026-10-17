"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { topics, topicLabels } from "@/types/news";
export default function NavbarComp() {
  const path = usePathname();
  return (
    <nav className="main-nav" aria-label="Main navigation">
      <div className="site-container nav-inner">
        <div className="nav-links">
          {[
            ["/", "Latest"],
            ...topics.map((topic) => [`/news/${topic}`, topicLabels[topic]]),
            ["/fun", "The break room"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                (
                  href === "/"
                    ? path === "/" || path === "/news/latest"
                    : path.startsWith(href)
                )
                  ? "page"
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
        </div>
        <span className="nav-live">
          <span />
          Independent perspectives
        </span>
      </div>
    </nav>
  );
}
