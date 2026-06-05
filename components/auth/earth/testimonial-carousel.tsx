"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    id: "sarah",
    quote:
      "iFranchise helped us expand globally and connect with amazing partners across three continents in our first year.",
    name: "Sarah Johnson",
    title: "CEO, GlobalMart",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: "marco",
    quote:
      "We onboarded franchisees in Europe, Asia, and the Americas within months. The platform made every step simple and transparent.",
    name: "Marco Silva",
    title: "Founder, UrbanBite",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: "priya",
    quote:
      "The portal made compliance, partner communication, and franchise onboarding effortless for our entire operations team.",
    name: "Priya Sharma",
    title: "COO, NovaRetail",
    photo:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face",
  },
] as const;

type TestimonialCarouselProps = {
  className?: string;
};

const slideVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 36 : -36,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -36 : 36,
  }),
};

export function TestimonialCarousel({ className }: TestimonialCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const current = TESTIMONIALS[index];

  const go = (next: number) => {
    setDirection(next);
    setIndex((prev) => (prev + next + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const goTo = (i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[14px] border border-white/[0.09] bg-white/[0.07] px-4 py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.18)] backdrop-blur-xl",
        className,
      )}
    >
      <Quote className="mb-2 h-3.5 w-3.5 text-white/30" aria-hidden />

      <div className="relative min-h-[44px] overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.p
            key={`${current.id}-quote`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="text-[12px] leading-relaxed text-white/85"
          >
            &ldquo;{current.quote}&rdquo;
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="relative min-h-[36px] flex-1 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${current.id}-author`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2.5"
            >
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current.photo}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-white">
                  {current.name}
                </p>
                <p className="text-[11px] text-white/55">{current.title}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex shrink-0 gap-1.5 pl-3">
          <button
            type="button"
            onClick={() => go(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.07] text-white/70 ring-1 ring-white/[0.08] transition hover:bg-white/[0.12]"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5831F0] text-white shadow-[0_2px_10px_rgba(88,49,240,0.35)] transition hover:bg-[#4c27d9]"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-2.5 flex justify-center gap-1.5">
        {TESTIMONIALS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => goTo(i)}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === index
                ? "w-4 bg-[#818CF8]"
                : "w-1 bg-white/25 hover:bg-white/40",
            )}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
