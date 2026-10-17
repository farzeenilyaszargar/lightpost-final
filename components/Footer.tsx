import Link from "next/link";
export default function Footer() {
  return (
    <footer className="site-footer site-container">
      <Link href="/" className="footer-brand">
        lightpost.
      </Link>
      <p>Stay curious. Read widely.</p>
      <span>
        Headlines from <a href="https://www.bbc.com/news">BBC News</a> &{" "}
        <a href="https://www.theguardian.com">The Guardian</a>.
      </span>
      <a href="#top">Back to top ↑</a>
    </footer>
  );
}
