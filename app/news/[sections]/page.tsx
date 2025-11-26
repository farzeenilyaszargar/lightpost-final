'use client';

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NavbarComp from "@/components/NavBar";
import { NewsItem } from "@/types/news";
import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from '@supabase/supabase-js';
import DispPageTitle from "@/components/VisualTitle";
import NewsGrid from "@/components/NewsComp";
import { useParams } from "next/navigation";
import { AdItem } from "@/types/ad";

type Props = {
  params: { sections: string };
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);



type MixedItem = NewsItem | AdItem;



const adItems: AdItem[] = [
  { id: "ad-1", image_url: "/ads/ad1.png", title: "Get Flights Cheap! 🎉", description: "superflights has the cheapest flights", links:"https://www.superflights.co.in/"} ,
  { id: "ad-2", image_url: "/ads/ad2.png", title: "Try Out Surfers Today! 🎉", description: "superflights has the cheapest flights" , links:"https://www.surfers.co.in/"} ,
  { id: "ad-3", image_url: "/ads/ad3.png", title: "Check Out Games", description: "", links:"/fun/" } ,
  { id: "ad-4", image_url: "/ads/ad4.png", title: "Comics", description: "check out funny comics", links:"/fun/comics" } ,

];


export function injectAds(news: NewsItem[], ads: AdItem[]): MixedItem[] {
  let result: MixedItem[] = [...news]; // explicitly MixedItem[]
  ads.forEach((ad) => {
    const randomIndex = Math.floor(Math.random() * (result.length + 1));
    result.splice(randomIndex, 0, ad); // insert ad at random place
  });
  return result;
}

async function loadNews(topic: string) {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('topic', topic)
    .order('published_at', { ascending: false });

  if (error) {
    console.error("Error fetching news:", error);
    return [];
  }
  return data || [];
}


export default function BlogPost() {
  const params = (useParams()) as { sections: string };
  const [news, setNews] = useState<NewsItem[]>([]);
  useEffect(() => {
    async function fetchNews() {
      const topic = params.sections; // get the topic from URL
      const data = await loadNews(topic);
      setNews(data);
    }
    fetchNews();
  }, [params.sections]);



const mixedItems = injectAds(news, adItems);


  return (
    <div className="flex flex-col items-center justify-around">
      <Header />
      <NavbarComp />
      <DispPageTitle title={params.sections}/>
      <div className="w-5/6 border-border border-l border-r p-5">
        
        <NewsGrid news={mixedItems}/>


      </div>
      <Footer />

    </div>
  );
}