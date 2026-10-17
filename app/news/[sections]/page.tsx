import { Suspense } from "react";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import NewsExplorer from "@/components/NewsExplorer";
import NewsSkeleton from "@/components/NewsSkeleton";
import { pageNews } from "@/lib/news-page";
import { getNews } from "@/lib/news";
import { topics, topicLabels, type Topic } from "@/types/news";
export const revalidate = 300;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ sections: string }>;
}) {
  const { sections } = await params;
  return { title: topicLabels[sections as Topic] || "News" };
}
async function TopicEdition({ topic }: { topic: Topic }) {
  return (
    <NewsExplorer
      key={topic}
      feed={pageNews(await getNews(topic))}
      topic={topic}
    />
  );
}
export default async function TopicPage({
  params,
}: {
  params: Promise<{ sections: string }>;
}) {
  const { sections } = await params;
  if (!topics.includes(sections as Topic)) notFound();
  return (
    <>
      <Header />
      <NavBar />
      <Suspense fallback={<NewsSkeleton />}>
        <TopicEdition topic={sections as Topic} />
      </Suspense>
      <Footer />
    </>
  );
}
