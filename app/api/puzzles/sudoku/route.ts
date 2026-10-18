import { NextResponse } from 'next/server';
import { parseDosuku } from '@/lib/online-puzzles';
import { makeSudoku } from '@/lib/games/sudoku';
export async function GET(request: Request) {
  const difficulty = new URL(request.url).searchParams.get('difficulty') || 'standard';
  if (!['gentle','standard','challenging'].includes(difficulty)) return NextResponse.json({ error: 'Unknown difficulty' }, { status: 400 });
  try {
    const response = await fetch('https://sudoku-api.vercel.app/api/dosuku', { cache: 'no-store', signal: AbortSignal.timeout(7000) });
    if (!response.ok) throw new Error('Sudoku source unavailable');
    const state = parseDosuku(await response.json());
    return NextResponse.json({ state, source: { name: 'Dosuku · verified unique solution', url: 'https://sudoku-api.vercel.app/' } }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ state: makeSudoku(Math.random, difficulty), source: { name: 'Offline print edition · generated locally', url: '', fallback: true } }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
