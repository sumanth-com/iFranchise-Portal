"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type BlogCardCoverProps = {
  src: string;
  alt: string;
  className?: string;
};

export function BlogCardCover({ src, alt, className }: BlogCardCoverProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "h-full w-full bg-gradient-to-br from-[#6D28D9] to-[#4338CA]",
          className,
        )}
        aria-label={alt}
      />
    );
  }

  return (
    // Native img — reliable for external Unsplash URLs without optimizer issues
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn("h-full w-full object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
