"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";

import { fadeUp } from "@/lib/motion";

export function OperationsOverview() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section {...fadeUp} className="space-y-2">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-violet-50/40 px-5 py-6 shadow-sm sm:px-7 sm:py-7">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl"
          animate={
            reduceMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }
          }
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-700 shadow-sm">
            <LayoutDashboard className="h-3 w-3" />
            Operations
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Command Center
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            A clear view of marketplace momentum, team capacity, and the actions
            that move the business forward.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
