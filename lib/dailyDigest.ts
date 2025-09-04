import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // use service role for insert
);

export async function runDailyDigest() {
  try {
    // ------------------------
    // 1. Generate Word of the Day
    // ------------------------
    const wordPrompt = `
      Give me a single uncommon but useful English word.
      Return JSON with:
      {
        "word": "the word",
        "definition": "simple 1-2 sentence definition",
        "example": "short example sentence",
        "pronounciation": give the pronounciation in this format /pro-no-aunce-cia-tion/ ,
        "part_of_speech": what part of speech it is, give in (part_of_speech) format, eg: (noun)
      }
    `;

    const wordRes = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [{ role: "user", content: wordPrompt }],
    });

    let wordData;
    try {
      wordData = JSON.parse(wordRes.choices[0].message?.content || "{}");
    } catch {
      wordData = {
        word: "Serendipity",
        definition: "A fortunate coincidence",
        example: "Finding an old friend by chance was pure serendipity.",
        pronounciation: "/ser-randi-peti/",
        part_of_speech: "(adjective)"
      };
    }

    await supabase.from("word_of_day").insert([wordData]);

    // ------------------------
    // 2. Generate Summary of the Day
    // ------------------------
    // Fetch your latest news from your database
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString;
    const { data: newsItems, error } = await supabase.from("news").select("title, description, published_at").gte("published_at", todayISO);

    if (error) {
      console.error("Error fetching news:", error);
      return;
    }

    const combinedText = newsItems
      .map((item) => `${item.title}: ${ item.description}`)
      .join("\n\n");

    const summaryPrompt = `
      Based on the following news from the last 24 hours, write a concise 50-60 words "Summary of the Day".
      News:
      ${combinedText}

      Return JSON:
      {
        "summary": "your summary text"
      }
    `;

    const summaryRes = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [{ role: "user", content: summaryPrompt }],
    });

    let summaryData;
    try {
      summaryData = JSON.parse(summaryRes.choices[0].message?.content || "{}");
    } catch {
      summaryData = {
        summary: "Unable to generate summary today.",
      };
    }

    await supabase.from("daily_summary").insert([summaryData]);

    console.log("✅ Daily digest stored successfully.");
  } catch (err) {
    console.error("❌ Error running daily digest:", err);
  }
}
