import { NextResponse } from 'next/server';
import { isMarketSymbol, parseMarketChart } from '@/lib/markets';

export async function GET(request: Request) {
  const symbol = new URL(request.url).searchParams.get('symbol') || '^GSPC';
  if (!isMarketSymbol(symbol)) return NextResponse.json({ error: 'Unknown market symbol' }, { status: 400 });
  try {
    const response = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=3mo&interval=1d`,
      { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' }, next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) },
    );
    if (!response.ok) throw new Error('Market source unavailable');
    return NextResponse.json(parseMarketChart(symbol, await response.json()), {
      headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ error: 'Market prices are temporarily unavailable. Please try again shortly.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
