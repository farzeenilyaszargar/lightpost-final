import { NextResponse } from 'next/server';
import { fetchDailyWord } from '@/lib/daily-word';

export async function GET() {
  const word = await fetchDailyWord();
  // Do not let a cached edition linger across midnight in India.
  const now = Date.now();
  const untilMidnight = 86400 - Math.floor(((now + 19800000) % 86400000) / 1000);
  const ttl = Math.min(300, untilMidnight);
  return NextResponse.json(word, { headers: {
    'Cache-Control': word.fallback ? 'no-store' : `public, max-age=${Math.min(60, ttl)}, s-maxage=${ttl}`,
  } });
}
