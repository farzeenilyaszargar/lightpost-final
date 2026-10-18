import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get('num');
  if (requested !== null && (!/^[1-9]\d{0,5}$/.test(requested) || Number(requested) === 404)) return NextResponse.json({ error: 'Invalid comic number' }, { status: 400 });
  try {
    const latest = await fetch('https://xkcd.com/info.0.json', { next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000) });
    if (!latest.ok) throw new Error('Comic source unavailable');
    const current = await latest.json();
    const latestNumber = Number(current.num);
    if (!Number.isSafeInteger(latestNumber) || latestNumber < 1) throw new Error('Invalid comic response');
    const number = requested ? Number(requested) : latestNumber;
    if (number > latestNumber) return NextResponse.json({ error: 'Comic number out of range' }, { status: 400 });
    const response = number === latestNumber ? null : await fetch(`https://xkcd.com/${number}/info.0.json`, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(6000) });
    if (response && !response.ok) throw new Error('Comic source unavailable');
    const comic = response ? await response.json() : current;
    if (comic.num !== number || typeof comic.title !== 'string' || typeof comic.img !== 'string' || !comic.img.startsWith('https://imgs.xkcd.com/')) throw new Error('Invalid comic');
    return NextResponse.json({ num: comic.num, title: comic.title, img: comic.img, alt: typeof comic.alt === 'string' ? comic.alt : '', latest: latestNumber }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Comics are temporarily unavailable. Try again shortly.' }, { status: 503 });
  }
}
