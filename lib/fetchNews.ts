import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const parser = new Parser();

// Supabase client using server-side keys
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// OpenAI client using server-side key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// RSS feeds to fetch
const RSS_FEEDS = [
  "https://www.aljazeera.com/xml/rss/all.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
  "https://www.economist.com/international/rss.xml",
  "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms",
  "https://feeds.feedburner.com/ndtvnews-india-news",
  "https://www.scmp.com/rss/91/feed",
  "https://www.japantimes.co.jp/feed/",
  "https://www.africanews.com/feed/rss",
  "https://www.middleeasteye.net/rss/news",
  "https://globalvoices.org/feed/",
  "https://www.worldpoliticsreview.com/feed/",
  "https://www.opendemocracy.net/en/feed/",
  "https://foreignpolicy.com/feed/",

  // Business / Markets
  "https://www.marketwatch.com/rss/topstories",
  "https://www.cnbc.com/id/100003114/device/rss/rss.html",
  "https://www.economist.com/latest/rss.xml",
  "https://feeds.a.dj.com/rss/RSSMarketsMain.xml",
  "https://qz.com/rss",


  // Technology
  "https://www.theverge.com/rss/index.xml",
  "https://techcrunch.com/feed/",
  "https://www.wired.com/feed/rss",
  "https://lifehacker.com/feed/rss",

  // Science / Health
  "https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science",
  "https://www.sciencedaily.com/rss/top.xml",
  "https://www.quantamagazine.org/feed/",

  // Sports
  "https://zeenews.india.com/rss/sports-news.xml",
  "https://feeds.bbci.co.uk/sport/rss.xml?edition=global",
  "https://www.espn.com/espn/rss/news",
  "https://www.skysports.com/rss/12040",

  // Culture & Gaming & etc
  "https://www.ign.com/rss/articles/feed",
  "https://variety.com/feed/",
  "https://www.billboard.com/feed/"





];

// --- Unsplash / Pexels fallback ---

async function fetchStockImage(query: string): Promise<string | null> {
  try {
    // 🔹 Example with Unsplash
    const unsplashRes = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`
    );

    if (unsplashRes.ok) {
      const data: any = await unsplashRes.json();
      if (data.results?.length > 0) return data.results[0].urls.small;
    }

    // 🔹 If Unsplash fails, try Pexels
    const pexelsRes = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`
    );

    if (pexelsRes.ok) {
      const data: any = await pexelsRes.json();
      if (data.photos?.length > 0) return data.photos[0].src.medium;
    }

    return null;
  } catch (err) {
    console.error("Failed to fetch stock image:", err);
    return null;
  }
}



export async function fetchAndStoreNews() {
  const allowedTopics = new Set([
    "world",
    "sports",
    "politics",
    "science",
    "business",
    "entertainment",
  ]);

  for (const feedUrl of RSS_FEEDS) {
    const feed = await parser.parseURL(feedUrl);


    for (const item of feed.items.slice(0, 50)) { // limit to 50 latest articles per feed
      
      if (!item.title) continue;
      if (!item.guid && !item.link) continue;

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

      let imageUrl = extractImageFromItem(item);

      // If no RSS image, try scraping the article's og:image
      if (!imageUrl && item.link) {
        imageUrl = await fetchOgImage(item.link);
        imageUrl = isValidImageUrl(imageUrl) ? imageUrl : null;
      }
      if (imageUrl && !isValidImageUrl(imageUrl)) {
        imageUrl = null;
      }



      const summaryPrompt = `
        You are an AI news summarizer. Return a **single JSON object** with the following fields:
        - "title": catchy with emojis. For serious news (death, disaster, war), use a serious tone, no emojis.
        - "description": 20-30 words, simple language, include some emojis in between.
        - "summary": 100 words, fact-based, **bold 3-4 key words**, sprinkle emojis. do not go below 50 words. if no extra information is available give historical facts or other information in the article. please write in a quirky tone.
        - "bias_score": 0-10 (0 = neutral, 10 = very biased). if non political and/or factual give 0 bias.
        - "bias_reason": short explanation. 
        - "topic": one of ["world", "sports", "politics", "science", "business", "entertainment"]. If technology or health, classify as "science". if geopolitics or other just put in politics. classify no matter what into some category.
        - "rating": score based on importance and global or national impact.
        - "tags": list 1-3 broader topics this article relates to. return short words all in small letters.
        - "keyword":  The keyword should capture the main topic or idea in **one word**, lowercase, no special characters.

        **Rules:**
        1. If the article is personal experiences, opinion-based, tips, fiction or meta-news (like “BBC reports” or “see how The Economist covered”), **return null**.
        2. Do not reference any news outlet; remove all traces of origin.
        3. Be objective but frank. Use casual language if appropriate, except for serious news which must stay solemn.
        4. Ensure output is strictly valid JSON.
        5. Please completely reframe the article and change words to make it look as different as possible from the original
        6. If there are any difficult words or technical words sometimes, please add a definition or meaning at the end of summary.

        **Input Article:**
        Title: "${item.title}"
        Content: "${item.contentSnippet || item.content || item.description}"
        `;


      const gptResponse = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [{ role: "user", content: summaryPrompt }]
      });

      const overall = gptResponse.choices[0].message?.content || "";

      let data: any = {};
      try {
        data = JSON.parse(overall.trim());
      } catch (err) {
        console.error("Failed to parse GPT response as JSON:", overall);
      }

      if (!data || data === null) {
        continue;
      }

      const title =
        typeof data.title === "string" && data.title.trim()
          ? data.title.trim()
          : item.title?.toString().trim();
      const description =
        typeof data.description === "string" && data.description.trim()
          ? data.description.trim()
          : (item.contentSnippet || item.description || "").toString().trim();
      const summary =
        typeof data.summary === "string" && data.summary.trim()
          ? data.summary.trim()
          : description;
      if (!title || !description || !summary) {
        continue;
      }

      const biasScoreRaw =
        typeof data.bias_score === "number" ? data.bias_score : 0;
      const biasScore = Math.max(0, Math.min(10, Math.round(biasScoreRaw)));
      const bias_reason =
        typeof data.bias_reason === "string" ? data.bias_reason : "";

      const topicRaw =
        typeof data.topic === "string" ? data.topic.toLowerCase().trim() : "";
      const topic = allowedTopics.has(topicRaw) ? topicRaw : "world";

      const rating =
        typeof data.rating === "number" ? Math.round(data.rating) : 0;

      const tags = Array.isArray(data.tags)
        ? data.tags
            .filter((t: any) => typeof t === "string" && t.trim())
            .map((t: string) => t.trim().toLowerCase())
        : [];

      // First try RSS tags
      
      const articleId = `${feedUrl}|${item.guid || item.link}`;


      function slugify(title: string): string {
        return title
          .toLowerCase()               // lowercase
          .trim()                      // remove extra spaces
          .replace(/[^a-z0-9\s-]/g, "") // remove special chars
          .replace(/\s+/g, "-")        // spaces → dashes
          .replace(/-+/g, "-");        // collapse multiple dashes
      }

      const slugTitle = slugify(title);
      if (!slugTitle) continue;
      function isValidImageUrl(url: string | null): boolean {
        if (!url) return false;
        if (!/^https?:\/\//i.test(url)) return false;
        return true;
      }


      // async function generateEmbedding(text: string) {
      //   const res = await openai.embeddings.create({
      //     model: "text-embedding-3-small",
      //     input: text,
      //   });
      //   return res.data[0].embedding;
      // }

      // async function findSimilarArticle(embedding: number[]) {
      //   try {
      //     const { data, error } = await supabase.rpc("match_news", {
      //       query_embedding: embedding,
      //       similarity_threshold: 0.9, // 90% similarity
      //       match_count: 1,
      //     });

      //     if (error) {
      //       // Throw an error so you can catch it upstream or display it
      //       throw new Error(`Supabase RPC 'match_news' error: ${JSON.stringify(error)}`);
      //     }

      //     // Return the first similar article if found, or null
      //     return data?.[0] || null;

      //   } catch (err: any) {
      //     // Log detailed info for debugging
      //     console.error("Error in findSimilarArticle:", err);
      //     // Optionally, propagate the error so API/frontend can see it
      //     throw new Error(`Failed to find similar article: ${err.message || err}`);
      //   }
      // }


      // const textForEmbedding = `${title} ${summary}`;
      // const embedding = await generateEmbedding(textForEmbedding);

      // check if similar article already exists
      // const similar = await findSimilarArticle(embedding);

      // if (similar) {
      //   console.log(`Skipping duplicate: ${title} ~ same as ${similar.title}`);
      //   continue; // don’t insert duplicate
      // }



      // Insert into Supabase
      const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
      const publishedSafe = isNaN(publishedAt.getTime())
        ? new Date()
        : publishedAt;

      try {
        await supabase.from("news").upsert({
          id: articleId,
          title,
          description,
          summary,
          published_at: publishedSafe,
          image_url: imageUrl,
          bias_score: biasScore || 0,
          bias_reason: bias_reason || "",
          topic: topic || "world",
          rating: rating || 0,
          tags: tags || [],
          slug: slugTitle,
        }, { onConflict: 'id' });
      } catch (err) {
        console.error("Supabase upsert failed:", err);
      }

    }
  }
}
