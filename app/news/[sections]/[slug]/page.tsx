import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import StoryImage from "@/components/StoryImage";
import BookmarkButton from "@/components/BookmarkButton";
import { getArticle, getNews } from "@/lib/news";
import { topics, topicLabels, type Topic } from "@/types/news";
type Props = { params: Promise<{ sections: string; slug: string }> };
export const revalidate = 300;
export async function generateMetadata({ params }: Props) {
  const { sections, slug } = await params;
  if (!topics.includes(sections as Topic)) return {};
  const article = await getArticle(sections as Topic, slug);
  return {
    title: article?.title || "Story unavailable",
    description: article?.description,
  };
}
export default async function ArticlePage({ params }: Props) {
  const { sections, slug } = await params;
  if (!topics.includes(sections as Topic)) notFound();
  const topic = sections as Topic;
  const article = await getArticle(topic, slug);
  if (!article) notFound();
  const related = (await getNews(topic)).articles
    .filter((item) => item.id !== article.id)
    .slice(0, 3);
  return (
    <>
      <Header />
      <NavBar />
      <main id="main" className="site-container article-main">
        <Link href={`/news/${topic}`} className="back-link">
          ← Back to {topicLabels[topic]}
        </Link>
        <article className="article-layout">
          <div className="article-content">
            <div className="eyebrow topic-tag">
              {topicLabels[topic]} / THE DISPATCH
            </div>
            <h1>{article.title}</h1>
            <div className="article-byline">
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {article.source} ↗
              </a>
              <time dateTime={article.published_at}>
                {new Date(article.published_at).toLocaleString("en", {
                  dateStyle: "long",
                  timeStyle: "short",
                  timeZone: "UTC",
                })}{" "}
                UTC
              </time>
              <BookmarkButton article={article} />
            </div>
            <div className="article-image">
              <StoryImage
                src={article.image_url}
                title={article.title}
                topic={topic}
                eager
              />
            </div>
            <p className="article-description">{article.description}</p>
            <div className="source-note">
              <span className="eyebrow">GO TO THE SOURCE</span>
              <h2>There’s more to the story.</h2>
              <p>
                This is the publisher’s feed excerpt. Read the full report,
                context, and updates directly at {article.source}.
              </p>
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="primary-button"
              >
                Read at {article.source} ↗
              </a>
            </div>
          </div>
          <aside className="related-stories">
            <span className="eyebrow">FOLLOW THE THREAD</span>
            <h2>More in {topicLabels[topic]}</h2>
            {related.map((item) => (
              <Link key={item.id} href={`/news/${topic}/${item.slug}`}>
                <h3>{item.title}</h3>
                <span>{item.source} ↗</span>
              </Link>
            ))}
          </aside>
        </article>
      </main>
      <Footer />
    </>
  );
}
