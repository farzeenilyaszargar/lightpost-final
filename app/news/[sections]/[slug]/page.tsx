import Header from "@/components/Header";
import NavbarComp from "@/components/NavBar";
import Image from "next/image";
import { notFound } from "next/navigation";
import { NewsItem } from "@/types/news";
import { createClient } from "@supabase/supabase-js";
import { JSX } from "react";

interface NewsPageProps {
  params: {
    slug: string;
    sections: string;
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);


function parseBold(text: string): (string | JSX.Element)[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <b className="text-string-primary" key={i}>{part.slice(2, -2)}</b>;
    }
    return part;
  });
}

async function loadNews(slug: string): Promise<NewsItem | null> {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching news:", error);
    return null;
  }
  return data;
}

export default async function UniqueNews({ params }: NewsPageProps) {
  const news = await loadNews(params.slug);

  if (!news) return notFound();

  return (
    <div>
      <Header />
      <NavbarComp />
      <div className="w-5/6 border-border border-l border-r mx-auto p-6 pb-30 flex justify-center items-center font-main ">
        <div className="md:w-1/2 border border-border rounded-2xl p-5">
          <div className="flex pb-3 flex-wrap gap-2">
            {news.tags && (

              news.tags.map((tagg, key) => (
                <p key={key} className="border border-border pl-2 pr-2 rounded-2xl text-border font-main text-sm">{tagg}</p>
              )
              )
            )}
          </div>
          <h1 className="text-3xl font-bold mb-4">{news.title}</h1>

          {news.image_url && (
            <Image
              src={news.image_url}
              alt={news.title}
              className="rounded-xl mb-6"
              width={800}
              height={400} unoptimized
            />
          )}

          <p className="leading-relaxed text-lg text-string-secondary">{parseBold(news.summary)}</p>


          <p className="border-b w-fit text-lg mt-4">Bias Report:</p>
          <div className="relative md:w-2/3 h-5 bg-gray-200 rounded-full overflow-hidden mt-2 mb-2" style={{background: `linear-gradient(to right, #1b3a57 0%, #555555 50%, #5c2f1f 100%)`}}>
            <div className="absolute inset-0 rounded-full flex justify-between items-center pl-2 pr-2">
              <p className="text-xs text-string-secondary">neutral</p>
              <p className="text-xs text-string-secondary">bias score: {news.bias_score}</p>
              <p className="text-xs text-string-secondary">biased</p>
            </div>

            <div
              className="absolute top-0 h-full w-1.5 bg-white border border-border rounded" 
              style={{ left: `${news.bias_score * 10}%` }}
            />
          </div>
          <p className="mb-5 text-string-secondary">{news.bias_reason}</p>

            <p className="text-gray-500 ">{news.published_at}</p>
        </div>
      </div>
    </div>
  );
}
