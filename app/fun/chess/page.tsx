'use client';
import { useEffect, useState } from 'react';
import { Chess, type Square, type PieceSymbol } from 'chess.js';
import GameFrame, { PuzzleControls, PuzzleLoading } from '@/components/games/GameFrame';
import { useOnlineGame } from '@/components/games/useOnlineGame';
import { makePrintChess, validOnlineChess, playOnlineMove } from '@/lib/online-puzzles';
const glyphs = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};
const names = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };
export default function ChessProblem() {
  const game = useOnlineGame('/api/puzzles/chess', makePrintChess, validOnlineChess);
  const s = game.state;
  const [selected, setSelected] = useState<Square | null>(null);
  const [message, setMessage] = useState('');
  const [promotion, setPromotion] = useState<PieceSymbol>('q');
  useEffect(() => { setSelected(null); setMessage(''); setPromotion('q'); }, [game.key]);
  const board = s ? new Chess(s.fen) : null;
  const legal = board && selected ? board.moves({ square: selected, verbose: true }).map(move => move.to) : [];
  const color = s?.player === 'b' ? 'Black' : 'White';
  function select(square: Square) {
    if (!s || !board || s.status !== 'playing') return;
    const piece = board.get(square);
    if (piece?.color === s.player) { setSelected(square); setMessage(`Selected ${names[piece.type]} on ${square}. Choose a destination.`); return; }
    if (!selected) { setMessage(`Select a ${color.toLowerCase()} piece first.`); return; }
    try {
      const result = playOnlineMove(s, selected, square, promotion);
      game.update(result.state);
      setMessage(result.message);
      setSelected(null);
    } catch { setMessage('That move is not legal. Choose a marked square.'); }
  }
  function reveal() {
    if (!s || !board || s.status !== 'playing') return;
    const moves = s.solution.slice(s.step).map(move => board.move(move).san);
    game.update(old => ({ ...old, fen: board.fen(), step: old.solution.length, status: 'revealed' }));
    setSelected(null); setMessage(`Solution: ${moves.join(' · ')}. Start over to try it yourself.`);
  }
  const files = s?.player === 'b' ? 'hgfedcba' : 'abcdefgh';
  const ranks = s?.player === 'b' ? [1,2,3,4,5,6,7,8] : [8,7,6,5,4,3,2,1];
  return (
    <GameFrame id="chess" title="The Chess Problem" description={`${color} to move. Find the best continuation from a real game.`}
      rules={[
        'Play the strongest continuation. Your pieces are at the bottom, whether White or Black.',
        'Select a piece, then a destination. The opponent replies automatically after a correct move.',
        'A legal but incorrect move returns to the same position. Finish the full line to solve the puzzle.',
        'Use a hint, reveal the line, start over, or press Next puzzle whenever you wish. Promotion defaults to a queen.',
      ]}
      controls={<PuzzleControls game={game} />}>
      {!s || !board ? <PuzzleLoading /> : <>
        <div className="puzzle-stats"><span>{s.rating ? `Rating ${s.rating}` : 'Print edition'} · {color} to move</span><span>{s.attempts} attempts · {Math.min(Math.ceil(s.step / 2), Math.ceil(s.solution.length / 2))}/{Math.ceil(s.solution.length / 2)} moves</span></div>
        <div className="chess-board" role="group" aria-label={`Chess board. ${color} to move.`}>
          {ranks.flatMap((rank, r) => [...files].map((file, c) => {
            const square = `${file}${rank}` as Square;
            const piece = board.get(square);
            return <button key={square} className={`${(r + c) % 2 ? 'chess-dark' : 'chess-light'} ${selected === square ? 'selected' : ''}`}
              onClick={() => select(square)} disabled={s.status !== 'playing'}
              aria-label={`${square}, ${piece ? `${piece.color === 'w' ? 'white' : 'black'} ${names[piece.type]}` : 'empty'}${legal.includes(square) ? ', legal destination' : ''}`} aria-pressed={selected === square}>
              {piece && <span className={`chess-piece piece-${piece.color}`}>{glyphs[piece.color][piece.type]}</span>}
              {!piece && legal.includes(square) && <span className="legal-dot" />}
              {c === 0 && <small className="chess-rank">{rank}</small>}{r === 7 && <small className="chess-file">{file}</small>}
            </button>;
          }))}
        </div>
        <div className="puzzle-buttons">
          <button disabled={s.status !== 'playing'} onClick={() => { game.update(old => ({ ...old, hinted: true })); setMessage(`Look at the piece on ${s.solution[s.step].slice(0,2)}.`); }}>A hint</button>
          <button disabled={s.status !== 'playing'} onClick={reveal}>Reveal line</button>
          <button onClick={() => { game.reset(); setSelected(null); setMessage(''); }}>Start over</button>
          <label className="chess-promotion">Promote to <select aria-label="Promotion piece" value={promotion} onChange={event => setPromotion(event.target.value as PieceSymbol)}><option value="q">Queen</option><option value="r">Rook</option><option value="b">Bishop</option><option value="n">Knight</option></select></label>
        </div>
        <p className={`puzzle-message ${s.status === 'solved' ? 'success' : ''}`} role="status">{message || (s.status === 'solved' ? 'Puzzle solved.' : `Select a ${color.toLowerCase()} piece to begin.`)}</p>
      </>}
    </GameFrame>
  );
}
