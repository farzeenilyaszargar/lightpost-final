"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface InteractionBtnsProps {
  newsId: string;
  likes: number;
  dislikes: number;
  comments: number;
  interactions: number;
}

export default function InteractionBtns({
  newsId,
  likes,
  dislikes,
  comments,
  interactions,
}: InteractionBtnsProps) {
  const [choice, setChoice] = useState<"like" | "dislike" | "">("");
  const [likess, setLikes] = useState(likes);
  const [dislikess, setDislikes] = useState(dislikes);
  const [commentss] = useState(comments);
  const [interactionss] = useState(interactions);
  const [loading, setLoading] = useState(false);

  // Load saved choice from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`news-vote-${newsId}`);
    if (saved === "like" || saved === "dislike") {
      setChoice(saved);
    }
  }, [newsId]);

  const handleVote = async (vote: "like" | "dislike") => {
    if (loading) return;
    setLoading(true);

    let likeChange = 0;
    let dislikeChange = 0;

    if (choice === vote) {
      // Toggle off
      if (vote === "like") likeChange = -1;
      if (vote === "dislike") dislikeChange = -1;
      setChoice("");
      localStorage.removeItem(`news-vote-${newsId}`);
    } else {
      // New vote or switch
      if (vote === "like") {
        likeChange = 1;
        if (choice === "dislike") dislikeChange = -1;
      }
      if (vote === "dislike") {
        dislikeChange = 1;
        if (choice === "like") likeChange = -1;
      }
      setChoice(vote);
      localStorage.setItem(`news-vote-${newsId}`, vote);
    }

    // Optimistic UI update
    setLikes((prev) => prev + likeChange);
    setDislikes((prev) => prev + dislikeChange);

    // Update DB atomically
    if (likeChange !== 0) {
      const { error } = await supabase
        .from("news")
        .update({ likes: likess + likeChange  })
        .eq("id", newsId);
      if (error) console.error("Error updating likes:", error);
    }

    if (dislikeChange !== 0) {
      const { error } = await supabase
        .from("news")
        .update({ dislikes: dislikess + dislikeChange  })
        .eq("id", newsId);
      if (error) console.error("Error updating dislikes:", error);
    }

    setLoading(false);
  };

  return (
    <div className="w-full border border-border rounded-2xl flex flex-row justify-between mt-3">
      <button
        className={`border rounded-2xl pl-2 pr-2 ${
          choice === "like" ? "bg-green-500 text-white" : ""
        }`}
        onClick={() => handleVote("like")}
        disabled={loading}
      >
        👍 {likess}
      </button>

      <button
        className={`border rounded-2xl pl-2 pr-2 ${
          choice === "dislike" ? "bg-red-500 text-white" : ""
        }`}
        onClick={() => handleVote("dislike")}
        disabled={loading}
      >
        👎 {dislikess}
      </button>

      <button className="border rounded-2xl pl-2 pr-2">📣 {commentss}</button>
      <button className="border rounded-2xl pl-2 pr-2">👁️ {interactionss}</button>
    </div>
  );
}
