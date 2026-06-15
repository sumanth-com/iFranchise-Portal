"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
} from "lucide-react";
import type { DashboardHeroMetrics } from "@/types/admin-dashboard";

type DashboardHeroProps = {
  adminName: string;
  hero: DashboardHeroMetrics;
  greeting: string;
  todayLabel: string;
  todayDateTime: string;
};

function buildExecutiveBrief(hero: DashboardHeroMetrics): string {
  const parts: string[] = [];

  if (hero.pendingReviews > 0) {
    parts.push(
      `${hero.pendingReviews} listing${hero.pendingReviews === 1 ? "" : "s"} awaiting your decision`,
    );
  }
  if (hero.totalLeads > 0) {
    parts.push(
      `${hero.totalLeads} investor lead${hero.totalLeads === 1 ? "" : "s"} in the pipeline`,
    );
  }
  if (hero.activeBrands > 0) {
    parts.push(
      `${hero.activeBrands} brand${hero.activeBrands === 1 ? "" : "s"} live on the marketplace`,
    );
  }

  if (parts.length === 0) {
    return "The platform is clear — time to drive brand acquisition and investor interest.";
  }

  return parts.join(" · ");
}

const lineReveal = {
  initial: { opacity: 0, y: 14, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function DashboardHero({
  adminName,
  hero,
  greeting,
  todayLabel,
  todayDateTime,
}: DashboardHeroProps) {
  const firstName = adminName.split(/\s+/)[0] ?? adminName;
  const reduceMotion = useReducedMotion();
  const brief = buildExecutiveBrief(hero);

  return (
    <section className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-[#1a1033] to-slate-950 px-5 py-6 shadow-xl sm:px-7 sm:py-8"
      >
        {/* Animated ambient orbs */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-violet-600/25 blur-3xl"
          animate={
            reduceMotion
              ? undefined
              : { x: [0, 24, 0], y: [0, 12, 0], scale: [1, 1.08, 1] }
          }
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"
          animate={
            reduceMotion
              ? undefined
              : { x: [0, -18, 0], y: [0, -14, 0], scale: [1, 1.05, 1] }
          }
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Shimmer accent line */}
        <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
          <motion.div
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-violet-400 to-transparent"
            animate={reduceMotion ? undefined : { x: ["-100%", "400%"] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <motion.div
              initial="initial"
              animate="animate"
              transition={{ staggerChildren: 0.1, delayChildren: 0.05 }}
            >
              <motion.div variants={lineReveal} transition={{ duration: 0.5 }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-200">
                  <Sparkles className="h-3 w-3 text-violet-300" />
                  Executive overview
                </span>
              </motion.div>

              <motion.h1
                variants={lineReveal}
                transition={{ duration: 0.55 }}
                className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2rem]"
              >
                {greeting}, {firstName}.
              </motion.h1>

              <motion.p
                variants={lineReveal}
                transition={{ duration: 0.55 }}
                className="mt-2 max-w-2xl text-base font-medium text-violet-100/90 sm:text-lg"
              >
                Lead with clarity. Scale the franchise marketplace with conviction.
              </motion.p>

              <motion.p
                variants={lineReveal}
                transition={{ duration: 0.55 }}
                className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400"
              >
                {brief}
              </motion.p>
            </motion.div>

            <motion.time
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.45 }}
              dateTime={todayDateTime}
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right text-xs text-slate-300 backdrop-blur-sm"
            >
              {todayLabel}
            </motion.time>
          </div>

          {hero.monthlyGrowthPercent !== 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {hero.monthlyGrowthPercent > 0 ? "+" : ""}
              {hero.monthlyGrowthPercent}% brand activity vs last month
            </motion.div>
          ) : null}
        </div>
      </motion.div>
    </section>
  );
}
