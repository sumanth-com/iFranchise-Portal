"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  ImageIcon,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type AssetSlide = {
  id: string;
  url: string;
  label: string;
  fileName: string;
};

type AssetImageViewerProps = {
  slides: AssetSlide[];
  emptyMessage?: string;
};

export function AssetImageViewer({
  slides,
  emptyMessage = "No images uploaded yet.",
}: AssetImageViewerProps) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const total = slides.length;
  const current = slides[index];

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return;
      setIndex((next + total) % total);
    },
    [total],
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, goPrev, goNext]);

  useEffect(() => {
    if (index >= total && total > 0) setIndex(0);
  }, [index, total]);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 px-6 py-16 text-center">
        <ImageIcon className="h-10 w-10 text-violet-300" />
        <p className="mt-3 text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main viewer */}
        <div className="relative overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-slate-50 to-violet-50/30 shadow-sm ring-1 ring-violet-100/80">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group relative block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            aria-label="Open image in full view"
          >
            <div className="relative aspect-[16/10] w-full sm:aspect-[5/3]">
              {current?.url ? (
                <Image
                  key={current.id}
                  src={current.url}
                  alt={current.label}
                  fill
                  unoptimized
                  className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 720px"
                  priority={index === 0}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Preview unavailable
                </div>
              )}
            </div>

            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
              <Expand className="h-3.5 w-3.5" />
              Expand
            </span>
          </button>

          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-violet-700 shadow-lg ring-1 ring-violet-100 transition-all hover:bg-violet-600 hover:text-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-violet-700 shadow-lg ring-1 ring-violet-100 transition-all hover:bg-violet-600 hover:text-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-10">
            <p className="truncate text-sm font-semibold text-white">
              {current?.label}
            </p>
            <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
              {index + 1} / {total}
            </span>
          </div>
        </div>

        {/* Thumbnails */}
        {total > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all sm:h-[4.5rem] sm:w-24",
                  i === index
                    ? "border-violet-500 ring-2 ring-violet-200"
                    : "border-slate-200 opacity-70 hover:border-violet-300 hover:opacity-100",
                )}
                aria-label={`View ${slide.label}`}
                aria-current={i === index}
              >
                <Image
                  src={slide.url}
                  alt=""
                  fill
                  unoptimized
                  className="object-contain p-1"
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Fullscreen lightbox */}
      {lightboxOpen && current?.url ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[70vh] w-full">
              <Image
                key={`lb-${current.id}`}
                src={current.url}
                alt={current.label}
                fill
                unoptimized
                className="object-contain"
                sizes="100vw"
              />
            </div>

            <div className="mt-4 flex w-full items-center justify-between gap-4 px-2">
              <p className="text-sm font-semibold text-white">{current.label}</p>
              <span className="text-sm font-medium text-white/80">
                {index + 1} / {total}
              </span>
            </div>

            {total > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 sm:-left-14"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 sm:-right-14"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
