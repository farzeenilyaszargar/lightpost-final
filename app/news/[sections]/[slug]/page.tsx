import Header from "@/components/Header";
import NavbarComp from "@/components/NavBar";
import Image from "next/image";
import { notFound } from "next/navigation";
import { NewsItem } from "@/types/news";
import { createClient } from "@supabase/supabase-js";
import { JSX } from "react";
import InteractionBtns from "@/components/InteractionBtns";

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
async function incrementViews(slug: string) {
  const { data, error } = await supabase
    .from("news")
    .select("interactions")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching views:", error);
    return;
  }

  const { error: updateError } = await supabase
    .from("news")
    .update({ interactions: (data.interactions || 0) + 1 })
    .eq("slug", slug);

  if (updateError) {
    console.error("Error updating views:", updateError);
  }
}


export default async function UniqueNews({ params }: NewsPageProps) {
  const news = await loadNews(params.slug);

  if (!news) return notFound();
  incrementViews(news.slug);


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
            <Image src={news.image_url} alt={news.title} className="rounded-xl mb-6" width={800} height={400} unoptimized />
          )}

          <p className="leading-relaxed text-base text-string-secondary">{parseBold(news.summary)}</p>

            <p className="text-gray-500 text-right text-xs mt-3">{news.published_at.replace("T", ", ")}</p>

          <p className="border-b w-fit text-lg mt-4">Bias Report:</p>
          <div className="relative md:w-2/3 h-5 bg-gray-200 rounded-full overflow-hidden mt-2 mb-2" style={{background: `linear-gradient(to right, #1b3a57 0%, #555555 50%, #5c2f1f 100%)`}}>
            <div className="absolute inset-0 rounded-full flex justify-between items-center pl-2 pr-2">
              <p className="text-xs text-gray-300">neutral</p>
              <p className="text-xs text-gray-300">bias score: {news.bias_score}</p>
              <p className="text-xs text-gray-300">biased</p>
            </div>

            <div
              className="absolute top-0 h-full w-2 bg-white border-2 border-gray-600 rounded-full" 
              style={{ left: `${news.bias_score * 10}%` }}
            />
          </div>
          <p className="mb-5 text-string-secondary text-sm">{news.bias_reason}</p>

        <InteractionBtns newsId={news.id} likes={news.likes} dislikes={news.dislikes} comments={0} interactions={news.interactions} />

        </div>
      </div>
    </div>
  );
}
