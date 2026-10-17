"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { isRouteActive } from "@/lib/navigation";

export interface NavItem {
  name: string;
  link: string;
  icons: string;
  inactiveIcons: string;
}

export const navList: NavItem[] = [
  {
    name: "Latest",
    link: "/",
    icons: "/icons/recents.svg",
    inactiveIcons: "/icons/inactive-recents.svg",
  },
  {
    name: "Politics",
    link: "/news/politics",
    icons: "/icons/politics.svg",
    inactiveIcons: "/icons/inactive-politics.svg",
  },
  {
    name: "Markets",
    link: "/news/business",
    icons: "/icons/money.png",
    inactiveIcons: "/icons/inactive-money.png",
  },
  {
    name: "Tech",
    link: "/news/technology",
    icons: "/icons/tech.svg",
    inactiveIcons: "/icons/inactive-tech.svg",
  },
  {
    name: "Science",
    link: "/news/science",
    icons: "/icons/science.svg",
    inactiveIcons: "/icons/inactive-science.svg",
  },
  {
    name: "Sports",
    link: "/news/sports",
    icons: "/icons/sports.svg",
    inactiveIcons: "/icons/inactive-sports.svg",
  },
  {
    name: "Culture",
    link: "/news/entertainment",
    icons: "/icons/culture.png",
    inactiveIcons: "/icons/inactive-culture.png",
  },
  {
    name: "Fun",
    link: "/fun",
    icons: "/icons/inactive-games.svg",
    inactiveIcons: "/icons/inactive-games.svg",
  },
];

export default function NavbarComp() {
  const path = usePathname();
  const itemsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const items = itemsRef.current;
    const active = items?.querySelector('[aria-current="page"]');
    if (!items || !active || items.scrollWidth <= items.clientWidth) return;
    const itemRect = active.getBoundingClientRect();
    const containerRect = items.getBoundingClientRect();
    items.scrollTo({
      left: items.scrollLeft + itemRect.left - containerRect.left -
        (items.clientWidth - itemRect.width) / 2,
    });
  }, [path]);
  return (
    <nav
      aria-label="Main navigation"
      className="w-full border-border border-b  justify-center flex sticky top-0 bg-background z-100 "
    >
      <div ref={itemsRef} className="navigation-items w-5/6 border-l border-r border-border">
        {navList.map((item: NavItem) => {
          const isActive = isRouteActive(item.link, path);
          return (
            <Link
              prefetch={false}
              key={item.name}
              href={item.link}
              aria-current={isActive ? "page" : undefined}
              className="navigation-item font-menu"
            >
              <Image
                src={isActive ? item.icons : item.inactiveIcons}
                className="navigation-icon invert-[var(--reverse-invert)]"
                unoptimized
                alt=""
                width={25}
                height={25}
              />
              <span className="navigation-label">
                <span aria-hidden="true" className="navigation-reserve">{item.name}</span>
                <span className={isActive ? "text-string-primary font-black" : "text-string-secondary font-bold"}>{item.name}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
