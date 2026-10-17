"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

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
  const isFallback = newsId.startsWith("fallback-");
  const [choice, setChoice] = useState<"like" | "dislike" | "">("");
  const [likess, setLikes] = useState(likes);
  const [likeAnim, setLAnim] = useState(false);
  const [dislikess, setDislikes] = useState(dislikes);
  const [dislikeAnim, setDAnim] = useState(false);
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

  const updateLikesInDB = async (newVal: number) => {
    if (isFallback) return;
    const { error } = await supabase
      .from("news")
      .update({ likes: newVal })
      .eq("id", newsId);
    if (error) console.error("Error updating likes:", error);
  };

  const updateDislikesInDB = async (newVal: number) => {
    if (isFallback) return;
    const { error } = await supabase
      .from("news")
      .update({ dislikes: newVal })
      .eq("id", newsId);
    if (error) console.error("Error updating dislikes:", error);
  };

  const handleVote = async (vote: "like" | "dislike") => {
    if (loading || isFallback) return;
    setLoading(true);

    // play animation if new vote
    if (vote === "like" && choice !== "like") {
      setLAnim(true);
      setTimeout(() => setLAnim(false), 500);
    }
    if (vote === "dislike" && choice !== "dislike") {
      setDAnim(true);
      setTimeout(() => setDAnim(false), 500);
    }

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

    // Optimistic UI update + safe DB write
    if (likeChange !== 0) {
      setLikes((prev) => {
        const newVal = Math.max(0, prev + likeChange);
        updateLikesInDB(newVal);
        return newVal;
      });
    }

    if (dislikeChange !== 0) {
      setDislikes((prev) => {
        const newVal = Math.max(0, prev + dislikeChange);
        updateDislikesInDB(newVal);
        return newVal;
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-w-1/2 border-border rounded-2xl flex flex-row justify-between mt-3 text-black font-numbers text-sm">
      {/* Like */}
      <button
        className={`border-border rounded-2xl px-2 flex items-center gap-1 hover:scale-110 invert-[var(--my-invert)] ${choice === "like" ? "font-black" : ""}`}
        onClick={() => handleVote("like")}
        disabled={loading || isFallback}
      >
        <Image
          src={
            likeAnim
             ? "/icons/animDislike.gif"
              : choice === "like"
              ? "/icons/disliked.png"
              : "/icons/dislike.png"
          }
          alt="like"
          width={20}
          height={20}
          className="h-5 w-auto -scale-y-100"
        />
        <p className="text-black">{likess}</p>
      </button>

      {/* Dislike */}
      <button
        className={`border-border rounded-2xl px-2 flex gap-1 items-center hover:scale-110 invert-[var(--my-invert)] ${choice === "dislike" ? "font-black" : ""}`}
        onClick={() => handleVote("dislike")}
        disabled={loading || isFallback}
      >
        <Image
          src={
            dislikeAnim
              ? "/icons/animDislike.gif"
              : choice === "dislike"
              ? "/icons/disliked.png"
              : "/icons/dislike.png"
          }
          alt="dislike"
          width={20}
          height={20}
          className="h-5 w-auto"
        />
        <p>{dislikess}</p>
      </button>

      {/* Comments */}
      <button className="border-border rounded-2xl pl-2 pr-2 gap-1 flex items-center hover:scale-110 invert-[var(--my-invert)]">
        <Image
          src={"/icons/comments.png"}
          alt="comments"
          width={15}
          height={15}
          className="h-5 w-auto"
        />
        <p>{commentss}</p>
      </button>

      {/* Views */}
      <button className="border-border rounded-2xl pl-2 pr-2 gap-1 flex items-center py-0.5 hover:scale-110 invert-[var(--my-invert)] relative group justify-center">
        <Image src={"/icons/view.png"} alt="views" width={15} height={15} className="h-5 w-auto" />
        <p>{interactionss}</p>
        <div className="absolute hidden text-black group-hover:block top-7 border border-border  px-2 bg-white text-xs rounded-2xl opacity-80">
          Views
        </div>
      </button>

      {/* Share */}
      <button className="border-border rounded-2xl pl-2 pr-2 gap-1 flex items-center py-0.5 hover:scale-110 invert-[var(--my-invert)] relative group justify-center">
        <Image src={"/icons/sharee.png"} alt="share" width={15} height={15} className="h-5 w-auto" /> 
        <div className="absolute hidden text-black group-hover:block top-7 border border-border bg-white px-2 text-xs rounded-2xl opacity-80">
          Share
        </div>
      </button>
    </div>
  );
}
