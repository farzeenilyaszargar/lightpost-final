'use client';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Chess, type Square, type PieceSymbol, type Color } from 'chess.js';
import { chessSquareAt } from '@/lib/chess-board';
import ChessPiece from '@/components/games/ChessPiece';
import GameFrame, { PuzzleControls, PuzzleLoading } from '@/components/games/GameFrame';
import { useOnlineGame } from '@/components/games/useOnlineGame';
import { makePrintChess, validOnlineChess, playOnlineMove } from '@/lib/online-puzzles';
type Motion = { id: number; from: Square; to: Square; type: PieceSymbol; color: Color };
type Feedback = { kind: 'wrong' | 'correct' | 'illegal'; from: Square; to: Square };
const names = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };
export default function ChessProblem() {
  const game = useOnlineGame('/api/puzzles/chess', makePrintChess, validOnlineChess);
  const s = game.state;
  const [selected, setSelected] = useState<Square | null>(null);
  const [message, setMessage] = useState('');
  const [promotion, setPromotion] = useState<PieceSymbol>('q');
  const [previewFen, setPreviewFen] = useState<string | null>(null);
  const [motion, setMotion] = useState<Motion | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [drag, setDrag] = useState<{ from: Square; type: PieceSymbol; color: Color; x: number; y: number } | null>(null);
  const dragStart = useRef<{ from: Square; pointerId: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const timers = useRef<number[]>([]);
  const motionId = useRef(0);
  const clearFeedback = useCallback(() => {
    timers.current.forEach(timer => window.clearTimeout(timer));
    timers.current = [];
    setMotion(null); setFeedback(null); setPreviewFen(null);
    setDrag(null); dragStart.current = null;
  }, []);
  useEffect(() => {
    clearFeedback(); setSelected(null); setMessage(''); setPromotion('q');
    return () => { timers.current.forEach(timer => window.clearTimeout(timer)); timers.current = []; };
  }, [game.key, game.pending, clearFeedback]);
  const board = s ? new Chess(previewFen || s.fen) : null;
  const busy = feedback !== null;
  const legal = board && selected && !busy ? board.moves({ square: selected, verbose: true }).map(move => move.to) : [];
  const color = s?.player === 'b' ? 'Black' : 'White';
  const later = (callback: () => void, delay: number) => { timers.current.push(window.setTimeout(callback, delay)); };
  function animate(from: Square, to: Square, type: PieceSymbol, color: Color) {
    setMotion({ id: ++motionId.current, from, to, type, color });
  }
  function select(square: Square) {
    if (!s || !board || busy || s.status !== 'playing') return;
    const piece = board.get(square);
    if (piece?.color === s.player) { setSelected(square); setMessage(`Selected ${names[piece.type]} on ${square}. Choose a destination.`); return; }
    if (!selected) { setMessage(`Select a ${color.toLowerCase()} piece first.`); return; }
    attemptMove(selected, square);
  }
  function attemptMove(from: Square, square: Square) {
    if (!s || busy || s.status !== 'playing') return;
    try {
      const result = playOnlineMove(s, from, square, promotion);
      game.update(result.state);
      setSelected(null);
      setPreviewFen(result.attemptedFen);
      animate(result.move.from, result.move.to, result.move.promotion || result.move.piece, result.move.color);
      setFeedback({ kind: result.correct ? 'correct' : 'wrong', from, to: square });
      if (!result.correct) {
        setMessage(`Not quite. ${result.move.san} is legal, but another move is stronger. The piece will return.`);
        later(() => setMotion(null), 240);
        later(() => {
          setPreviewFen(s.fen);
          animate(result.move.to, result.move.from, result.move.piece, result.move.color);
        }, 1000);
        later(() => { clearFeedback(); setMessage(result.message); }, 1240);
      } else {
        setMessage('Good move.');
        later(() => {
          if (result.reply) {
            setPreviewFen(result.state.fen);
            animate(result.reply.from, result.reply.to, result.reply.promotion || result.reply.piece, result.reply.color);
            later(() => { clearFeedback(); setMessage(result.message); }, 240);
          } else { clearFeedback(); setMessage(result.message); }
        }, 240);
      }
    } catch {
      setFeedback({ kind: 'illegal', from, to: square });
      setMessage('That move is not legal. Try one of the marked squares.');
      later(clearFeedback, 600);
    }
  }
  function beginDrag(event: PointerEvent<HTMLButtonElement>, square: Square) {
    suppressClick.current = false;
    if (!s || !board || busy || s.status !== 'playing' || !event.isPrimary || event.button !== 0) return;
    const piece = board.get(square);
    if (!piece || piece.color !== s.player) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { from: square, pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
  }
  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const start = dragStart.current;
    if (!start || start.pointerId !== event.pointerId || !board) return;
    if (!start.moved && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 4) return;
    start.moved = true;
    const piece = board.get(start.from);
    if (!piece) return;
    const rect = event.currentTarget.parentElement!.getBoundingClientRect();
    setSelected(start.from);
    setDrag({ from: start.from, ...piece, x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 });
  }
  function endDrag(event: PointerEvent<HTMLButtonElement>, cancelled = false) {
    const start = dragStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    dragStart.current = null; setDrag(null);
    if (!start.moved) return;
    suppressClick.current = true;
    const rect = event.currentTarget.parentElement!.getBoundingClientRect();
    const to = cancelled ? null : chessSquareAt(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height, s?.player === 'b');
    if (to && to !== start.from) attemptMove(start.from, to);
    else { setSelected(start.from); setMessage('Move cancelled. Choose a destination or drag again.'); }
  }
  function reveal() {
    if (!s || !board || busy || s.status !== 'playing') return;
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
        'Drag a piece to its destination, or select a piece then a square. The opponent replies automatically after a correct move.',
        'Wrong legal moves travel to the chosen square, turn red, then return. The position stays available for another try.',
        'Use a hint, reveal the line, start over, or press Next puzzle whenever you wish. Promotion defaults to a queen.',
      ]}
      controls={<PuzzleControls game={game} />}>
      {!s || !board ? <PuzzleLoading /> : <>
        <div className="puzzle-stats"><span>{s.rating ? `Rating ${s.rating}` : 'Print edition'} · {color} to move</span><span>{s.attempts} attempts · {Math.min(Math.ceil(s.step / 2), Math.ceil(s.solution.length / 2))}/{Math.ceil(s.solution.length / 2)} moves</span></div>
        <div className="chess-board printed-chess" data-feedback={feedback?.kind} aria-busy={busy} role="group" aria-label={`Chess board. ${color} to move.`}>
          {ranks.flatMap((rank, r) => [...files].map((file, c) => {
            const square = `${file}${rank}` as Square;
            const piece = board.get(square);
            return <button key={square} className={`${(r + c) % 2 ? 'chess-dark' : 'chess-light'} ${selected === square ? 'selected' : ''} ${feedback && (feedback.to === square || feedback.from === square) ? feedback.kind === 'correct' ? 'move-correct' : 'move-wrong' : ''}`}
              onPointerDown={event => beginDrag(event, square)} onPointerMove={moveDrag} onPointerUp={event => endDrag(event)} onPointerCancel={event => endDrag(event, true)} onLostPointerCapture={event => endDrag(event, true)}
              onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } select(square); }} disabled={busy || s.status !== 'playing'}
              aria-label={`${square}, ${piece ? `${piece.color === 'w' ? 'white' : 'black'} ${names[piece.type]}` : 'empty'}${legal.includes(square) ? ', legal destination' : ''}`} aria-pressed={selected === square}>
              {piece && drag?.from !== square && (!motion || (motion.to !== square && motion.from !== square)) && <ChessPiece type={piece.type} color={piece.color} />}
              {!piece && legal.includes(square) && <span className="legal-dot" />}
              {c === 0 && <small className="chess-rank">{rank}</small>}{r === 7 && <small className="chess-file">{file}</small>}
            </button>;
          }))}
          {drag && <span className="chess-drag" style={{ left: `${drag.x}%`, top: `${drag.y}%` }}><ChessPiece type={drag.type} color={drag.color} /></span>}
          {motion && <span key={motion.id} className="chess-motion" style={{
            left: `${files.indexOf(motion.from[0]) * 12.5}%`,
            top: `${ranks.indexOf(Number(motion.from[1])) * 12.5}%`,
            '--move-x': `${(files.indexOf(motion.to[0]) - files.indexOf(motion.from[0])) * 100}%`,
            '--move-y': `${(ranks.indexOf(Number(motion.to[1])) - ranks.indexOf(Number(motion.from[1]))) * 100}%`,
          } as CSSProperties}><ChessPiece type={motion.type} color={motion.color} /></span>}
        </div>
        <div className="puzzle-buttons">
          <button disabled={busy || s.status !== 'playing'} onClick={() => { game.update(old => ({ ...old, hinted: true })); setMessage(`Look at the piece on ${s.solution[s.step].slice(0,2)}.`); }}>A hint</button>
          <button disabled={busy || s.status !== 'playing'} onClick={reveal}>Reveal line</button>
          <button onClick={() => { clearFeedback(); game.reset(); setSelected(null); setMessage(''); }}>Start over</button>
          <label className="chess-promotion">Promote to <select aria-label="Promotion piece" disabled={busy || s.status !== 'playing'} value={promotion} onChange={event => setPromotion(event.target.value as PieceSymbol)}><option value="q">Queen</option><option value="r">Rook</option><option value="b">Bishop</option><option value="n">Knight</option></select></label>
        </div>
        <p className={`puzzle-message ${s.status === 'solved' ? 'success' : ''} ${feedback && feedback.kind !== 'correct' ? 'chess-error' : ''}`} role="status">{message || (s.status === 'solved' ? 'Puzzle solved.' : `Select a ${color.toLowerCase()} piece to begin, or drag it to a destination.`)}</p>
      </>}
    </GameFrame>
  );
}
