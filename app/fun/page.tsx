import Link from 'next/link';
import Icon from '@/components/Icon';
import { gameList } from '@/lib/games/core';
import GameIllustration from '@/components/games/GameIllustration';
export default function Amusements() {
  return (
    <section className="amusements-hub">
      <header className="hub-masthead">
        <p className="amusement-kicker">THE LIGHTPOST SUPPLEMENT · EST. FOR THE INQUISITIVE</p>
        <h1><span aria-hidden="true">❦</span> The Amusements</h1>
        <p>A little wit. A little wisdom. As many editions as you fancy.</p>
      </header>
      <div className="hub-games">
        {gameList.map((game, index) => <Link prefetch={false} className="hub-game" href={`/fun/${game.id}`} key={game.id}>
          <div className="hub-game-caption"><span>No. {String(index + 1).padStart(2, '0')}</span><span>{game.kind}</span></div>
          <GameIllustration kind={game.mark} />
          <div className="hub-game-copy"><h2>{game.name}</h2><p>{game.deck}</p></div>
          <div className="hub-game-bottom"><span>{['chess','comic','sudoku','hangman'].includes(game.id) ? 'Fresh from the wire' : 'Endless print editions'}</span><Icon name="arrowUpRight" size={20} /></div>
        </Link>)}
      </div>
      <p className="hub-colophon">Open an edition. Play or read. Press Next for another. No account, no daily play cap.</p>
    </section>
  );
}
