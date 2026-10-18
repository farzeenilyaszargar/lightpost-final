import type { PieceSymbol, Color } from 'chess.js';

// Original ink silhouettes: solid paper masks keep the board's hatching out
// of each piece, like the woodcut diagrams in a printed chess column.
export default function ChessPiece({ type, color }: { type: PieceSymbol; color: Color }) {
  return (
    <svg className={`chess-piece-svg piece-${color}`} viewBox="0 0 48 48" aria-hidden="true" focusable="false" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      {type === 'p' && <>
        <circle cx="24" cy="10" r="5" />
        <path d="M19 16h10l3 5-6 2c0 7 2 11 6 14H16c4-3 6-7 6-14l-6-2 3-5Z" />
        <path d="M16 37h16l4 6H12l4-6Z" /><path d="M17 40h14" fill="none" />
      </>}
      {type === 'r' && <>
        <path d="M10 5h7v6h4V5h6v6h4V5h7v13l-6 4v14H16V22l-6-4V5Z" />
        <path d="M16 36h16l5 7H11l5-7Z" />
        <path d="M11 17h26M17 23h14M16 39h16" fill="none" />
      </>}
      {type === 'n' && <>
        <path d="m15 6 7 4 7-6 2 8c9 6 9 17 5 25H15c-1-6 2-11 8-15l-8 4-7-3 5-10 2-7Z" />
        <path d="m15 37-4 6h29l-4-6H15Z" />
        <path d="m24 11 5 4 3 7-1 10M14 18l4-2M11 22l4 1M17 40h17" fill="none" />
        <circle cx="22" cy="16" r="1" className="piece-detail" />
        <path d="m28 6-2 4m6 3 3 2m-1 3 3 2m-2 3 3 2m-2 3 2 2" fill="none" />
      </>}
      {type === 'b' && <>
        <circle cx="24" cy="5" r="2" />
        <path d="M24 8c-9 5-13 11-9 18l7 5c-1 3-4 5-8 7h20c-4-2-7-4-8-7l7-5c4-7 0-13-9-18Z" />
        <path d="m15 38-4 5h26l-4-5H15Z" />
        <path d="m26 11-5 11M16 27h16M19 32h10M16 40h16" fill="none" />
      </>}
      {type === 'q' && <>
        <path d="m9 13 7 5 1-10 7 11 7-11 1 10 7-5-6 18H15L9 13Z" />
        <ellipse cx="24" cy="31" rx="9" ry="3" />
        <path d="m16 33-3 10h22l-3-10M16 40h16" />
        {[{x:9,y:11},{x:17,y:6},{x:24,y:4},{x:31,y:6},{x:39,y:11}].map(point => <circle key={point.x} cx={point.x} cy={point.y} r="2" />)}
        <path d="M24 7v9M18 24h2m8 0h2M20 29q4-2 8 0" fill="none" />
      </>}
      {type === 'k' && <>
        <path d="M22 3h4v5h5v4h-5v5h-4v-5h-5V8h5V3Z" />
        <path d="M24 20c-5-10-15-6-14 2 1 4 4 7 6 10h16c2-3 5-6 6-10 1-8-9-12-14-2Z" />
        <ellipse cx="24" cy="32" rx="8" ry="3" />
        <path d="m17 34-4 9h22l-4-9M17 40h14" />
        <path d="M16 25h3m10 0h3M20 30q4-3 8 0" fill="none" />
      </>}
    </svg>
  );
}
