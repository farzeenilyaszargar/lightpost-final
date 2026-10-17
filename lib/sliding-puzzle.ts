export function isSlidingSolved(tiles: number[]) {
  return tiles.length === 9 && tiles.every((n, i) => n === (i + 1) % 9);
}
export function canSlide(tiles: number[], index: number) {
  const blank = tiles.indexOf(0);
  return (
    index >= 0 &&
    index < tiles.length &&
    Math.abs(Math.floor(index / 3) - Math.floor(blank / 3)) +
      Math.abs((index % 3) - (blank % 3)) ===
      1
  );
}
export function slideTile(tiles: number[], index: number) {
  if (!canSlide(tiles, index)) return tiles;
  const next = [...tiles],
    blank = next.indexOf(0);
  [next[index], next[blank]] = [next[blank], next[index]];
  return next;
}
// Legal moves from the solved state guarantee a solvable board.
export function shuffleTiles(size = 3, random = Math.random): number[] {
  if (size !== 3) throw new Error("The sliding square uses a 3 × 3 board");
  let tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  let previous = -1;
  for (let i = 0; i < 121; i++) {
    const blank = tiles.indexOf(0);
    const neighbors = tiles
      .map((_, index) => index)
      .filter((index) => index !== previous && canSlide(tiles, index));
    tiles = slideTile(
      tiles,
      neighbors[Math.floor(random() * neighbors.length)],
    );
    previous = blank;
  }
  return tiles;
}
