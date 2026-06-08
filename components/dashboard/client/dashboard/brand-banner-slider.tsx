"use client";

import { motion } from "framer-motion";
import {
  Globe2,
  LineChart,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type BrandBanner = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  glow: string;
};

const BANNERS: BrandBanner[] = [
  {
    id: "global-reach",
    eyebrow: "iFranchise Marketplace",
    title: "Grow Your Brand Worldwide",
    description:
      "Put your franchise in front of serious investors and expansion partners across high-intent markets.",
    icon: Globe2,
    gradient: "from-[#6D28D9] via-[#5B21B6] to-[#4F46E5]",
    glow: "rgba(109,40,217,0.35)",
  },
  {
    id: "premium-listing",
    eyebrow: "Brand Presence",
    title: "Stand Out With Premium Listings",
    description:
      "Showcase your story, financials, and growth potential with a polished profile built for franchise buyers.",
    icon: Sparkles,
    gradient: "from-[#7C3AED] via-[#6D28D9] to-[#4338CA]",
    glow: "rgba(124,58,237,0.35)",
  },
  {
    id: "trusted-review",
    eyebrow: "iFranchise Review",
    title: "Get Vetted. Get Discovered.",
    description:
      "Our review process builds trust with prospects so your brand launches with credibility from day one.",
    icon: ShieldCheck,
    gradient: "from-[#5B21B6] via-[#4F46E5] to-[#3730A3]",
    glow: "rgba(79,70,229,0.35)",
  },
  {
    id: "portfolio-momentum",
    eyebrow: "Owner Dashboard",
    title: "Track Momentum In One Place",
    description:
      "Monitor listing health, review progress, and portfolio updates — everything you need to scale smarter.",
    icon: LineChart,
    gradient: "from-[#6D28D9] via-[#4F46E5] to-[#312E81]",
    glow: "rgba(67,56,202,0.35)",
  },
];

const AUTO_PLAY_MS = 5000;
const SLIDE_COUNT = BANNERS.length;
const SLIDE_STEP = 100 / SLIDE_COUNT;

export function DashboardBrandBannerSlider() {
  const [index, setIndex] = useState(0);
  const [instant, setInstant] = useState(false);

  const goNext = useCallback(() => {
    setIndex((prev) => {
      if (prev === SLIDE_COUNT - 1) {
        setInstant(true);
        return 0;
      }
      setInstant(false);
      return prev + 1;
    });
  }, []);

  const goTo = useCallback((next: number) => {
    setInstant(false);
    setIndex(next);
  }, []);

  useEffect(() => {
    if (!instant) return;
    const id = window.requestAnimationFrame(() => setInstant(false));
    return () => window.cancelAnimationFrame(id);
  }, [instant]);

  useEffect(() => {
    const timer = window.setInterval(goNext, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [goNext]);

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-[#5B21B6] shadow-sm"
      aria-roledescription="carousel"
      aria-label="iFranchise brand owner highlights"
    >
      <div
        className="relative h-[168px] overflow-hidden sm:h-[180px]"
        style={{ perspective: "1200px" }}
      >
        <motion.div
          className="flex h-full"
          style={{ width: `${SLIDE_COUNT * 100}%` }}
          animate={{ x: `-${index * SLIDE_STEP}%` }}
          transition={
            instant
              ? { duration: 0 }
              : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
          }
        >
          {BANNERS.map((banner) => (
            <BannerSlide key={banner.id} banner={banner} />
          ))}
        </motion.div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 bg-[#4C1D95]/90 px-4 py-2.5 sm:px-5">
        <div className="flex gap-1.5">
          {BANNERS.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/35 hover:bg-white/55",
              )}
              aria-label={`Show banner ${i + 1}: ${banner.title}`}
              aria-current={i === index ? "true" : undefined}
            />
          ))}
        </div>
        <p className="text-[11px] font-medium text-white/70">
          Powered by iFranchise
        </p>
      </div>
    </section>
  );
}

function BannerSlide({ banner }: { banner: BrandBanner }) {
  const Icon = banner.icon;

  return (
    <article
      className={cn(
        "relative h-full shrink-0 overflow-hidden bg-gradient-to-br text-white",
        banner.gradient,
      )}
      style={{
        width: `${SLIDE_STEP}%`,
        transformStyle: "preserve-3d",
      }}
      aria-hidden={false}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: banner.glow }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 left-1/4 h-32 w-32 rounded-full blur-3xl bg-white/10"
      />

      <div className="relative flex h-full items-center gap-4 px-5 py-5 sm:px-7 sm:py-6">
        <div
          className="hidden shrink-0 sm:flex sm:h-[72px] sm:w-[72px] sm:items-center sm:justify-center sm:rounded-2xl sm:bg-white/15 sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(0,0,0,0.18)] sm:backdrop-blur-sm"
          style={{ transform: "translateZ(24px)" }}
        >
          <Icon className="h-8 w-8 text-white" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1" style={{ transform: "translateZ(12px)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75 sm:text-[11px]">
            {banner.eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-bold leading-tight tracking-tight sm:text-2xl">
            {banner.title}
          </h2>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/85 sm:text-sm">
            {banner.description}
          </p>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute right-5 top-1/2 hidden sm:block"
          style={{
            transform: "translateY(-50%) translateZ(32px) rotateY(-12deg)",
          }}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <Icon className="h-9 w-9 text-white/90" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </article>
  );
}
