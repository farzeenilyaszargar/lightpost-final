"use client";
import Image from "next/image";
import { useState } from "react";
import { optimizableImage } from "@/lib/image-policy";
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
  const [failedSource, setFailedSource] = useState<string | null>(null);
  return src && src !== failedSource ? (
    <Image
      src={src}
      alt={title}
      width={800}
      height={533}
      sizes={
        eager
          ? "(max-width: 767px) 83vw, 42vw"
          : "(max-width: 639px) 83vw, (max-width: 767px) 42vw, 21vw"
      }
      priority={eager}
      fetchPriority={eager ? "high" : "auto"}
      loading={eager ? "eager" : "lazy"}
      unoptimized={!optimizableImage(src)}
      quality={75}
      referrerPolicy="no-referrer"
      onError={() => setFailedSource(src)}
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
