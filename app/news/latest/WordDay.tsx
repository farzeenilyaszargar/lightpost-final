"use client";
import { useEffect, useState } from "react";

export default function WordOfTheDay() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(
      `https://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=YOUR_WORDNIK_API_KEY`
    )
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data)
    return (
      <div className="w-full bg-background text-string-primary rounded-lg ">
        Loading...
      </div>
    );

  return (
    <div className="w-full bg-background text-string-primary rounded-lg ">
      <h1 className="font-black text-3xl">
        {data.word}{"Serendipity"}
        <span className="font-extralight text-sm">
          ({data.notes?.type || "noun"})
        </span>
      </h1>
      <p className="font-extralight text-sm text-string-secondary">
        /{data.pronunciation?.all || "se-randi-peti"}/
      </p>
      {data.definitions?.map((def: any, i: number) => (
        <p key={i} className="text-string-secondary">
            {def.text}
        </p>
      ))
      || "The occurrence of events by chance in a happy or beneficial way."}
    </div>
  );
}
