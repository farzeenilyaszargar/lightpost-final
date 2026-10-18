import { NextResponse } from 'next/server';
import { makePrintChess, parseLichess } from '@/lib/online-puzzles';
export async function GET() {
  try {
    const response = await fetch('https://lichess.org/api/puzzle/next', { cache: 'no-store', signal: AbortSignal.timeout(7000) });
    if (!response.ok) throw new Error('Chess source unavailable');
    const state = parseLichess(await response.json());
    return NextResponse.json({ state, source: { name: 'Lichess · CC0 puzzles', url: `https://lichess.org/training/${state.id}` } }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ state: makePrintChess(Math.random), source: { name: 'Offline print edition · mate in one', url: '', fallback: true } }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
