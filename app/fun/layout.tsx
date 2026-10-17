import Header from "@/components/Header";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";
export const metadata = {
  title: "The Amusements | Lightpost",
  description:
    "Sudoku, word games, arithmetic, sliding tiles, chess, and the funny papers. A Victorian newspaper puzzle page for a curious mind.",
};
export default function FunLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Navbar />
      <main id="main" className="amusements-frame">
        {children}
      </main>
      <Footer />
    </>
  );
}
