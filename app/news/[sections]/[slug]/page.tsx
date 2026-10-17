import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";
import StoryImage from "@/components/StoryImage";
import StoryActions from "@/components/StoryActions";
import { getArticle } from "@/lib/news";
import { topics, topicLabels, type Topic } from "@/types/news";
type Props = { params: Promise<{ sections: string; slug: string }> };
export const revalidate = 300;
export async function generateMetadata({ params }: Props) {
  const { sections, slug } = await params;
  if (!topics.includes(sections as Topic)) return {};
  const article = await getArticle(sections as Topic, slug);
  return {
    title: article
      ? `${article.title} | Lightpost`
      : "Story unavailable | Lightpost",
    description: article?.description,
  };
}
export default async function ArticlePage({ params }: Props) {
  const { sections, slug } = await params;
  if (!topics.includes(sections as Topic)) notFound();
  const topic = sections as Topic;
  const article = await getArticle(topic, slug);
  if (!article) notFound();
  return (
    <>
      <Header />
      <Navbar />
      <main
        id="main"
        className="w-5/6 border-border border-l border-r mx-auto p-5 md:p-6 pb-20 font-main"
      >
        <div className="md:w-1/2 mx-auto">
          <Link
            href={`/news/${topic}`}
            className="text-xs text-string-secondary inline-block mb-4"
          >
            ← Back to {topicLabels[topic]}
          </Link>
          <article className="border border-border rounded-2xl p-5">
            <div className="flex gap-2 mb-3">
              <span className="border border-border px-2 rounded-2xl text-string-secondary text-sm">
                {topicLabels[topic]}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
            <div className="rounded-xl overflow-hidden mb-6">
              <StoryImage
                src={article.image_url}
                title={article.title}
                topic={topic}
                eager
              />
            </div>
            <p className="leading-relaxed text-base text-string-secondary">
              {article.description}
            </p>
            <time
              dateTime={article.published_at}
              className="block text-string-secondary text-right text-xs mt-3"
            >
              {new Date(article.published_at).toLocaleString("en", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Kolkata",
              })}{" "}
              IST
            </time>
            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-sm text-string-secondary mb-3">
                This is the publisher&apos;s news excerpt. Read the full report
                at the original source.
              </p>
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-border rounded-2xl px-3 py-1 text-sm hover:bg-string-primary hover:text-background"
              >
                Read at {article.source} ↗
              </a>
            </div>
            <StoryActions article={article} />
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
