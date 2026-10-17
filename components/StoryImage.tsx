/* eslint-disable @next/next/no-img-element -- Publisher images load directly with a client-side failure fallback. */
"use client";
import { useState } from "react";
export default function StoryImage({
  src,
  title,
  topic,
  eager = false,
}: {
  src: string | null;
  title: string;
  topic: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  // Publisher images load directly to preserve attribution and support an image fallback.
  return src && !failed ? (
    <img
      src={src}
      alt={title}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="story-image"
    />
  ) : (
    <div
      className={`image-placeholder placeholder-${topic}`}
      aria-label="No article image"
    >
      <span>lp.</span>
      <small>{topic}</small>
    </div>
  );
}
