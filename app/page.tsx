import { Suspense } from "react";
import Hero from "@/components/Hero";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import NewsExplorer from "@/components/NewsExplorer";
import NewsSkeleton from "@/components/NewsSkeleton";
import { getNews } from "@/lib/news";
export const revalidate = 300;
async function Edition() {
  return <NewsExplorer feed={await getNews()} />;
}
export default function Home() {
  return (
    <>
      <Header />
      <NavBar />
      <Hero />
      <Suspense fallback={<NewsSkeleton />}>
        <Edition />
      </Suspense>
      <Footer />
    </>
  );
}
