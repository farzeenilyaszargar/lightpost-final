"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Icon, { type IconName } from "./Icon";
import { isRouteActive } from "@/lib/navigation";

export interface NavItem {
  name: string;
  link: string;
  icon: IconName;
}

export const navList: NavItem[] = [
  {
    name: "Latest",
    link: "/",
    icon: "newspaper",
  },
  {
    name: "Politics",
    link: "/news/politics",
    icon: "parliament",
  },
  {
    name: "Markets",
    link: "/news/business",
    icon: "markets",
  },
  {
    name: "Tech",
    link: "/news/technology",
    icon: "chip",
  },
  {
    name: "Sports",
    link: "/news/sports",
    icon: "trophy",
  },
  {
    name: "Culture",
    link: "/news/entertainment",
    icon: "theatre",
  },
  {
    name: "Fun",
    link: "/fun",
    icon: "dice",
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
              className={`navigation-item font-menu ${isActive ? "text-string-primary" : "text-string-secondary"}`}
            >
              <Icon name={item.icon} size={22} className="navigation-icon" />
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
