import assert from 'node:assert/strict';
import test from 'node:test';
import { chessSquareAt } from '../lib/chess-board';

test('drag destinations follow both player orientations on a scaled board', () => {
  assert.equal(chessSquareAt(1, 1, 320, 320), 'a8');
  assert.equal(chessSquareAt(319, 319, 320, 320), 'h1');
  assert.equal(chessSquareAt(1, 1, 240, 240, true), 'h1');
  assert.equal(chessSquareAt(239, 239, 240, 240, true), 'a8');
  assert.equal(chessSquareAt(180, 260, 320, 320), 'e2');
});
test('drops outside the board cancel instead of moving to an edge square', () => {
  for (const [x, y] of [[-1, 100], [100, -1], [320, 100], [100, 320]]) assert.equal(chessSquareAt(x, y, 320, 320), null);
  assert.equal(chessSquareAt(0, 0, 0, 0), null);
});
