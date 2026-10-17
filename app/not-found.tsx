import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="site-container empty-state">
        <span>404</span>
        <h1>This story has moved on.</h1>
        <p>
          The link may be incorrect, or the story may have left the current news
          feed.
        </p>
        <Link className="primary-button" href="/">
          Explore the latest headlines ↗
        </Link>
      </main>
      <Footer />
    </>
  );
}
