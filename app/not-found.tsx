import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export default function NotFound() {
  return (
    <>
      <Header />
      <main
        id="main"
        className="w-5/6 mx-auto border-l border-r border-border min-h-[70vh] flex flex-col justify-center items-center p-5 font-main text-center"
      >
        <h1 className="font-black text-7xl">404</h1>
        <p className="font-extralight text-xl mt-3">Page Not Found 😬</p>
        <p className="text-sm text-string-secondary mt-3">
          This story may have left the current news feed.
        </p>
        <Link
          href="/"
          className="m-5 border border-border rounded-2xl px-4 py-2"
        >
          Go Back
        </Link>
      </main>
      <Footer />
    </>
  );
}
