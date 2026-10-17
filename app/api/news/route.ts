import { NextRequest, NextResponse } from "next/server";
import { getNews } from "@/lib/news";
import { topics, type Topic } from "@/types/news";
export async function GET(request: NextRequest) {
  const topic = request.nextUrl.searchParams.get("topic");
  if (topic && !topics.includes(topic as Topic))
    return NextResponse.json({ error: "Unknown topic" }, { status: 400 });
  const feed = await getNews(topic as Topic | undefined);
  return NextResponse.json(feed, {
    status: feed.articles.length ? 200 : 503,
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
