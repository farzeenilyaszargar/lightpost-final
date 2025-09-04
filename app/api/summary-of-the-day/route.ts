import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function GET(req: Request) {
  try {
    // Fetch today's news from Supabase
    const { data: newsItems, error } = await supabase
      .from("news")
      .select("title, description")
      .order("rating", { ascending: false })
      .limit(20); 

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json({ summary: "Failed to fetch news." });
    }

    if (!newsItems || newsItems.length === 0) {
      return NextResponse.json({ summary: "No news available for today." });
    }

    // Combine news into one text block for AI
    const combinedText = newsItems
      .map((item: any) => `${item.title}: ${item.summary || item.description}`)
      .join("\n\n");

    const prompt = `
      Give me a concise "Summary of the Day" based on the following news:
      ${combinedText}

      Return JSON with one key:
      {
        "summary": "A concise 50 word summary highlighting the most important events."
      }
    `;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = completion.choices[0].message?.content || "{}";

    let data = { summary: "Unable to generate summary." };
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error("Failed to parse AI response:", rawText);
      data = { summary: rawText }; // fallback if JSON fails
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Summary API error:", err);
    return NextResponse.json({ summary: `Failed to fetch ${err}` });
  }
}
