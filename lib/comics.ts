export function comicNeighbor(current: number, latest: number, direction: 1 | -1) {
  if (!Number.isInteger(current) || !Number.isInteger(latest) || current < 1 || current > latest || latest < 1) throw new Error('Invalid comic range');
  let number = current + direction;
  if (number > latest) number = 1;
  if (number < 1) number = latest;
  if (number === 404) number += direction;
  return number;
}
