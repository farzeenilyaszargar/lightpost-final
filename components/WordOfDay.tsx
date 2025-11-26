"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function WordOfTheDay() {
  const [word, setWord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWord() {
      const { data, error } = await supabase
        .from("word_of_day")
        .select("word, definition, example, pronounciation, part_of_speech")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setWord(data[0]);
      }
      setLoading(false);
    }
    fetchWord();
  }, []);

  if (loading) return <div className="p-4 text-gray-400">Loading word...</div>;
  if (!word) return <div className="p-4 text-gray-400">No word of the day available.</div>;

  const pron = word.pronounciation.toLowerCase();
  return (
    <div className="p-5 border border-border rounded-2xl bg-background overflow-hidden ">
      <p className="text-2xl font-black font-main">{word.word}<span className="text-xs ml-2 text-string-secondary font-extralight">{word.part_of_speech}</span></p>
      <p className="text-sm text-string-secondary font-extralight">{pron}</p>
      <p className="text-string-secondary mt-2 text-sm">{word.definition}</p>
    </div>
  );
}
