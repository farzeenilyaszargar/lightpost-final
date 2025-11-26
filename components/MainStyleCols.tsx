'use client';

import { NewsItem } from "@/types/news";
import Image from "next/image";
import Link from "next/link";
import InteractionBtns from "./InteractionBtns";
import { AdItem } from "@/types/ad";


type MixedItem = NewsItem | AdItem;

interface Props {
  news: MixedItem[];
  colIndex: number; // 0, 1, 2, 3 for 4 columns
  numCols?: number; // default 4
}

export default function NewsGridCols({ news, colIndex, numCols = 4 }: Props) {
  // Filter items for this column
  const columnItems = news.filter((_, index) => index % numCols === colIndex);

  return (
    <>
      {columnItems.map((item) => {
        // Check if item is a NewsItem
        if ("topic" in item && "slug" in item) {
          return (
            <div key={item.id} className="block">
              <div className="border border-border p-2 rounded-2xl ">
                <Link className="block" href={`/news/${item.topic}/${item.slug}`}>
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      width={300}
                      height={200}
                      className="w-full rounded-lg"
                      unoptimized
                    />
                  ) : (
                    <Image
                      src="/placeholder.png"
                      alt="placeholder"
                      width={300}
                      height={200}
                      className="w-full rounded-lg"
                    />
                  )}
                  <h2 className="font-semibold text-xl mt-2">{item.title}</h2>
                  <p className="text-sm text-string-secondary">{item.description}</p>
                </Link>
                <InteractionBtns newsId={item.id} likes={item.likes} dislikes={item.dislikes} comments={0} interactions={item.interactions} />
              </div>
              
            </div>
          );
        } else {
          // Render AdItem
          return (
            <div key={item.id} className="block">
              <div className="border border-border p-2 rounded-2xl bg-background">
                {item.image_url && (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    width={300}
                    height={200}
                    className="w-full rounded-lg"
                    unoptimized
                  />
                )}
                <h2 className="font-semibold text-xl mt-2">{item.title}</h2>
                <p className="text-sm text-string-secondary">{item.description}</p>
              </div>
            </div>
          );
        }
      })}
    </>
  );
}
