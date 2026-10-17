import Link from "next/link";
import { gameList } from "@/lib/games/core";
import GameIllustration from "@/components/games/GameIllustration";
import DailyProgress from "@/components/games/DailyProgress";
export default function Amusements() {
  return (
    <section className="amusements-index">
      <div className="amusement-folio">
        <span>THE LIGHTPOST SUPPLEMENT</span>
        <span>FOR THE INQUISITIVE MIND</span>
      </div>
      <header className="amusement-masthead">
        <span className="amusement-ornament" aria-hidden="true">
          ❦
        </span>
        <h1>The Amusements</h1>
        <p>
          A little wit. A little wisdom. A welcome pause between the headlines.
        </p>
        <div className="amusement-rule">
          <span>PUZZLES, PASTIMES & THE FUNNY PAPERS</span>
        </div>
      </header>
      <div className="amusement-intro">
        <p>
          <span className="amusement-dropcap">D</span>ear reader, lay aside the
          affairs of the world for a moment. Here are a few small challenges for
          a lively mind. Take your time; the news will be here when you return.
        </p>
        <DailyProgress />
      </div>
      <div className="amusement-cards">
        {gameList.map((game, i) => (
          <Link
            prefetch={false}
            className="amusement-card"
            key={game.id}
            href={`/fun/${game.id}`}
          >
            <div className="amusement-card-caption">
              <span>No. {String(i + 1).padStart(2, "0")}</span>
              <span>{game.kind}</span>
            </div>
            <GameIllustration kind={game.mark} />
            <div className="amusement-card-copy">
              <h2>{game.name}</h2>
              <p className="amusement-deck">{game.deck}</p>
              <p>{game.detail}</p>
              <div className="amusement-card-bottom">
                <span>{game.time}</span>
                <strong>
                  {game.id === "comic" ? "Read the papers" : "Take a seat"}{" "}
                  <span aria-hidden="true">↗</span>
                </strong>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="amusement-colophon">
        <span aria-hidden="true">✧</span>
        <p>
          Five daily puzzles. No accounts, no entry fee.
          <br />
          The games work without an external service; comics have an in-house
          alternative.
        </p>
        <Link prefetch={false} href="/">
          Return to the dispatches →
        </Link>
      </div>
    </section>
  );
}
