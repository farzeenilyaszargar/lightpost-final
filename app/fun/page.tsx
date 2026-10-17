import Link from "next/link";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
const games = [
  {
    name: "Sudoku",
    path: "sudoku",
    mark: "1 2 3",
    text: "Nine squares. Endless possibilities.",
    label: "LOGIC",
  },
  {
    name: "Hangman",
    path: "hangman",
    mark: "a_b",
    text: "A little wordplay goes a long way.",
    label: "WORDS",
  },
  {
    name: "Math puzzles",
    path: "math",
    mark: "±",
    text: "Find the missing piece of the equation.",
    label: "NUMBERS",
  },
  {
    name: "Sliding tiles",
    path: "sliding",
    mark: "▦",
    text: "Put everything back in its place.",
    label: "SPATIAL",
  },
  {
    name: "Daily chess",
    path: "chess",
    mark: "♞",
    text: "One position. Your next great move.",
    label: "STRATEGY",
  },
  {
    name: "Comics",
    path: "comic",
    mark: "☺",
    text: "A different perspective, one panel at a time.",
    label: "A LITTLE HUMOUR",
  },
];
export default function Fun() {
  return (
    <>
      <Header />
      <NavBar />
      <main id="main" className="site-container games-main">
        <div className="edition-heading">
          <div>
            <span className="eyebrow">STEP AWAY FROM THE HEADLINES</span>
            <h1>
              The <em>break room.</em>
            </h1>
            <p>A small reset for a curious mind. Pick something to play.</p>
          </div>
        </div>
        <div className="games-grid">
          {games.map((game) => (
            <Link
              href={`/fun/${game.path}`}
              key={game.path}
              className="game-card"
            >
              <span className="game-mark">{game.mark}</span>
              <span className="eyebrow">{game.label}</span>
              <h2>
                {game.name} <span>↗</span>
              </h2>
              <p>{game.text}</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
