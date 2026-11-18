"use client";

import Image from "next/image";
import { useState } from "react";

type SermonVideoProps = {
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
};

export default function SermonVideo({
  videoId,
  title,
  thumbnailUrl,
}: SermonVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (isLoaded) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsLoaded(true)}
      aria-label={`Load video: ${title}`}
      className="relative flex h-full w-full items-center justify-center bg-slate-800 text-white"
    >
      {thumbnailUrl && (
        <Image
          src={thumbnailUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          unoptimized
          className="object-cover"
        />
      )}
      <span className="z-10 rounded-full bg-black/70 px-5 py-3 font-semibold">
        Play video
      </span>
    </button>
  );
}
