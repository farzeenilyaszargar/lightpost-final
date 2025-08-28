import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const parser = new Parser();

// Supabase client using server-side keys
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!,
);

// OpenAI client using server-side key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});

// RSS feeds to fetch
const RSS_FEEDS = [
    "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://www.aljazeera.com/xml/rss/all.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
  "https://rss.cnn.com/rss/edition_world.rss",
  "https://feeds.npr.org/1004/rss.xml",                 // NPR World
  "https://www.theguardian.com/world/rss",
  "https://www.economist.com/international/rss.xml",

  // Business / Markets
  "https://www.marketwatch.com/rss/topstories",         // MarketWatch Top
  "https://www.ft.com/world/rss",                       // FT World (some articles paywalled)

  // Technology
  "https://www.theverge.com/rss/index.xml",
  "https://techcrunch.com/feed/",
  "https://arstechnica.com/feed/",
  "https://www.wired.com/feed/rss",

  // Science / Health
  "https://www.nature.com/subjects/science/rss",
  "https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science", // AAAS
  "https://www.who.int/feeds/entity/csr/don/en/rss.xml",                   // WHO disease outbreaks




];

export async function fetchAndStoreNews() {
  for (const feedUrl of RSS_FEEDS) {
    const feed = await parser.parseURL(feedUrl);


    for (const item of feed.items.splice(0, 2)) { // limit to 2 latest articles per feed
      const summaryPrompt = `
        Return a JSON object with:
        - title: catchy with emojis; for serious news (death, disaster, war) use only emergency icons
        - description: 20-30 words, simple language, some emojis
        - summary: 150-200 words, fact-based, bold 3-4 key words, include emojis lightly
        - bias_score: 0-10
        - bias_reason: short and direct
        - imgUrl: link to a relevant copyright-free image
        - topic: one or two of [world, sports, politics, science, technology, business]
        - rating: score based on relevancy, bias_score, and drama/controversy

        Article: ${item.contentSnippet || item.content || item.description}  
        Title: ${item.title}
        `;


      const gptResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: summaryPrompt }]
      });

      const overall = gptResponse.choices[0].message?.content || "";

      let data: any = {};
      try {
        data = JSON.parse(overall);
      } catch (err) {
        console.error("Failed to parse GPT response as JSON:", overall);
      }

      // Extract images from RSS item XML or fields
      function extractImageFromItem(item: any): string | null {
        // Direct RSS tags
        if (item.enclosure?.url) return item.enclosure.url;
        if (item['media:content']?.url) return item['media:content'].url;
        if (item['media:thumbnail']?.url) return item['media:thumbnail'].url;

        // Inline <img> in description/content
        const imgFromContent = item.content?.match(/<img.*?src="(.*?)"/)?.[1];
        if (imgFromContent) return imgFromContent;

        const imgFromEncoded = item['content:encoded']?.match(/<img.*?src="(.*?)"/)?.[1];
        if (imgFromEncoded) return imgFromEncoded;

        return null;
      }

      // Fetch <meta property="og:image"> if RSS has no image
      async function fetchOgImage(url: string): Promise<string | null> {
        try {
          const res = await fetch(url, { headers: { "user-agent": "news-anon/1.0" } });
          const html = await res.text();
          return (
            html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] ??
            null
          );
        } catch (err) {
          console.error("Failed to fetch OG image:", err);
          return null;
        }
      }






      // const likes = await supabase.from("news").select("likes").eq("id", item.guid).single() ?? 0;
      // const dislikes  = await supabase.from("news").select("dislikes").eq("id", item.guid).single() ?? 0;
      const title = data.title;
      const description = data.description;
      const summary = data.summary;
      const biasScore = data.bias_score;
      const bias_reason = data.bias_reason;
      const topic = data.topic;
      // const rating = (data.rating*0.5)+(likes*0.3)+(dislikes*0.2);
      const rating = data.rating;

      // First try RSS tags
      let imageUrl = extractImageFromItem(item);

      // If no RSS image, try scraping the article's og:image
      if (!imageUrl && item.link) {
        imageUrl = await fetchOgImage(item.link);
      }

      // If still nothing, fallback to AI suggestion
      if (!imageUrl) {
        imageUrl = data.imgUrl;
      }





      // Insert into Supabase
      await supabase.from("news").upsert({
        title: title,
        description: description,
        summary,
        published_at: item.pubDate,
        image_url: imageUrl,
        bias_score: biasScore,
        bias_reason: bias_reason,
        topic: topic,
        rating: rating,

      });
    }
  }
}
