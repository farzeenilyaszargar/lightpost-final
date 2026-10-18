import Header from "@/components/Header";
import Navbar from "@/components/NavBar";
export const metadata = {
  title: { default: "The Amusements", template: "%s | Lightpost" },
  description:
    "Fresh online chess tactics, Sudoku, word games and comics, alongside endless print puzzles. A screen-sized Victorian newspaper supplement.",
};
export default function FunLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="amusements-shell">
      <Header />
      <Navbar />
      <main id="main" className="amusements-frame">
        {children}
      </main>
    </div>
  );
}
