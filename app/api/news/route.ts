import { NextRequest, NextResponse } from "next/server";
import { getNews } from "@/lib/news";
import { pageNews, parsePageOptions } from "@/lib/news-page";
import { topics, type Topic } from "@/types/news";
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const topic = params.get("topic");
  if (topic && !topics.includes(topic as Topic))
    return NextResponse.json({ error: "Unknown topic" }, { status: 400 });
  let options;
  try {
    options = parsePageOptions(params);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid query" },
      { status: 400 },
    );
  }
  const feed = await getNews(topic as Topic | undefined);
  return NextResponse.json(pageNews(feed, options), {
    status: feed.articles.length ? 200 : 503,
    headers: {
      "Cache-Control":
        "public, max-age=30, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
