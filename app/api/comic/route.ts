import { NextResponse } from "next/server";
export async function GET() {
  try {
    const latest = await fetch("https://xkcd.com/info.0.json", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(6000),
    });
    if (!latest.ok) throw new Error("Comic source unavailable");
    const current = await latest.json();
    const latestNumber = Number(current.num);
    if (!Number.isSafeInteger(latestNumber) || latestNumber < 1)
      throw new Error("Invalid comic response");
    let number = Math.floor(Math.random() * latestNumber) + 1;
    if (number === 404) number = 403;
    const response = await fetch(`https://xkcd.com/${number}/info.0.json`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) throw new Error("Comic source unavailable");
    const comic = await response.json();
    return NextResponse.json(
      { num: comic.num, title: comic.title, img: comic.img, alt: comic.alt },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Comics are temporarily unavailable. Try again shortly." },
      { status: 503 },
    );
  }
}
