// Starting from the solved state and making legal moves guarantees solvability.
export function shuffleTiles(size = 3, random = Math.random): number[] {
  const tiles = Array.from(
    { length: size * size },
    (_, i) => (i + 1) % (size * size),
  );
  let blank = tiles.length - 1,
    previous = -1;
  for (let step = 0; step < 120; step++) {
    const neighbors = [
      blank - size,
      blank + size,
      ...(blank % size > 0 ? [blank - 1] : []),
      ...(blank % size < size - 1 ? [blank + 1] : []),
    ].filter((i) => i >= 0 && i < tiles.length && i !== previous);
    const next = neighbors[Math.floor(random() * neighbors.length)];
    [tiles[blank], tiles[next]] = [tiles[next], tiles[blank]];
    previous = blank;
    blank = next;
  }
  return tiles;
}
