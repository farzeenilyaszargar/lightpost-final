import { AdItem } from "@/types/ad";
import { NewsItem } from "@/types/news";
import Image from "next/image";
import Link from "next/link";



type MixedItem = NewsItem | AdItem;

function splitIntoColumns<T>(items: T[], numCols: number): T[][] {
  const columns: T[][] = Array.from({ length: numCols }, () => []);
  items.forEach((item, index) => {
    columns[index % numCols].push(item);
  });
  return columns;
}

export default function NewsGrid({ news }: { news: MixedItem[] }) {
  const columns = splitIntoColumns(news, 4);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {columns.map((col, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4">
          {col.map((item) => {
            // Check if NewsItem or AdItem
            if ("topic" in item && "slug" in item) {
              // NewsItem
              return (
                <Link
                  href={`/news/${item.topic}/${item.slug}`}
                  key={item.id}
                  className="p-2 border border-border rounded-lg shadow bg-background"
                >
                  {item.image_url && (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      width={300}
                      height={200}
                      className="rounded-lg"
                      unoptimized
                    />
                  )}
                  <h2 className="font-bold text-lg mt-2">{item.title}</h2>
                  <p className="text-sm text-string-secondary">{item.description}</p>
                </Link>
              );
            } else {
              // AdItem
              return (
                <div
                  key={item.id}
                  className="p-2 border border-border rounded-lg bg-background"
                >
                  {item.image_url && (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      width={300}
                      height={200}
                      className="rounded-lg"
                      unoptimized
                    />
                  )}
                  <h2 className="font-bold text-lg my-2">{item.title}</h2>
                  <p className="text-sm text-string-secondary my-1">{item.description}</p>
                  {item.links?
                  (
                    <Link href={item.links} className="border text-xs rounded-2xl px-2 py-1 bg-background hover:invert" >Check Out 🔗</Link>
                  ):(<></>)
                  }
                </div>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
}
