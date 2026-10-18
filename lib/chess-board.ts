import type { Square } from 'chess.js';

// Pointer coordinates are relative to the board, so this also works when flipped.
export function chessSquareAt(x: number, y: number, width: number, height: number, black = false): Square | null {
  if (width <= 0 || height <= 0 || x < 0 || y < 0 || x >= width || y >= height) return null;
  const file = Math.floor(x / width * 8);
  const rank = Math.floor(y / height * 8);
  return `${(black ? 'hgfedcba' : 'abcdefgh')[file]}${black ? rank + 1 : 8 - rank}` as Square;
}
