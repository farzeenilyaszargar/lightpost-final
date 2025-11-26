'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { NewsItem } from "@/types/news";
import NewsGridCols from "@/components/MainStyleCols";
import SummaryOfTheDay from "@/components/SummaryDay";
import WordOfTheDayyy from "@/components/WordOfDay";
import { JSX } from "react";
import InteractionBtns from "@/components/InteractionBtns";




type AdItem= {
  id:string;
  image_url:string;
  title:string;
  description:string;
}

type MixedItem = NewsItem | AdItem;



const adItems: AdItem[] = [
  { id: "ad-1", image_url: "/ads/ad1.png", title: "Get Flights Cheap! 🎉", description: "superflights has the cheapest flights"} ,
  { id: "ad-2", image_url: "/ads/ad2.png", title: "Try Out Surfers Today! 🎉", description: "surf in the seas" } ,
  { id: "ad-3", image_url: "/images/sudoku.png", title: "Check Out Sudoku", description: "ads 3rd the lool" } ,

];


export function injectAds(news: NewsItem[], ads: AdItem[]): MixedItem[] {
  let result: MixedItem[] = [...news]; // explicitly MixedItem[]
  ads.forEach((ad) => {
    const randomIndex = Math.floor(Math.random() * (result.length + 1));
    result.splice(randomIndex, 0, ad); // insert ad at random place
  });
  return result;
}


export default function AnotherTry() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    async function loadNews() {
      const res = await fetch('/api/news');
      const data: NewsItem[] = await res.json();
      setNews(Array.isArray(data) ? data : []);
    }
    loadNews();
  }, []);

  function splitIntoColumns<T>(items: T[], numCols: number): T[][] {
    const columns: T[][] = Array.from({ length: numCols }, () => []);
    items.forEach((item, index) => columns[index % numCols].push(item));
    return columns;
  }

  function parseBold(text: string): (string | JSX.Element)[] {
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <b className="text-string-primary" key={i}>{part.slice(2, -2)}</b>;
      }
      return part;
    });
  }

  // Inject ads
  const mixedItems: MixedItem[] = injectAds(news, adItems);

  // Safely take the first news as top news
  const topNewsItem: NewsItem | null = news.length > 0 ? news[0] : null;

  // Exclude top news from other columns
  const otherNews = mixedItems.filter(n => topNewsItem && n.id !== topNewsItem.id);

  return (
    <div className="w-full border-border flex justify-center ">
      <div className="flex md:flex-row flex-col w-5/6 border-border justify-between pt-5 border-l border-r gap-5 p-5 font-main">

        {/* Left column */}
        <div className="md:w-1/4 space-y-5">
          <h1 className="text-2xl p-3 mb-0 font-bold -mt-3">What Happening 🌏</h1>
          <SummaryOfTheDay />
          <div className="space-y-5 ">
            <NewsGridCols news={otherNews} colIndex={0} />
          </div>
        </div>

        {/* Center / top news */}
        <div className="md:w-1/2 border-border">
          {topNewsItem && (
            <div className="mb-5 p-3 border border-border rounded-2xl block">
              <Link href={`/news/${topNewsItem.topic}/${topNewsItem.slug}`}>

                <h1 className="text-3xl mb-3 font-black">{topNewsItem.title}</h1>
                {topNewsItem.image_url && (
                  <Image
                    src={topNewsItem.image_url}
                    alt={topNewsItem.title ?? "News image"}
                    width={2000}
                    height={1000}
                    className="w-full rounded-2xl opacity-[var(--my-opacity)]"
                  />
                )}
                <p className="font-para text-sm mt-2 text-string-secondary">{topNewsItem.description}</p>
              </Link>
              <div className="w-full flex justify-center">
                <div className="w-2/3">
              <InteractionBtns newsId={topNewsItem.id} likes={topNewsItem.likes} dislikes={topNewsItem.dislikes} comments={0} interactions={topNewsItem.interactions} />
                </div>
              </div>
            </div>
          )}
          <div className="flex md:flex-row flex-col space-x-5">
            <div className="md:w-1/2 space-y-5">
              <NewsGridCols news={otherNews} colIndex={1} />
            </div>
            <div className="md:w-1/2 space-y-5">
              <NewsGridCols news={otherNews} colIndex={2} />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="md:w-1/4 space-y-5">
          <WordOfTheDayyy />
          <div className="space-y-5">
            <NewsGridCols news={otherNews} colIndex={3} />
          </div>
        </div>

      </div>
    </div>
  );
}
