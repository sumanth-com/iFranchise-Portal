"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { fadeUp } from "@/lib/motion";

export function OperationsOverview() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section {...fadeUp} className="space-y-2">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-[#1a1033] to-slate-950 px-5 py-6 shadow-xl sm:px-7 sm:py-7">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-12 -top-16 h-48 w-48 rounded-full bg-violet-600/25 blur-3xl"
          animate={
            reduceMotion
              ? undefined
              : { x: [0, 20, 0], y: [0, 10, 0] }
          }
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-200">
            <Sparkles className="h-3 w-3" />
            Super admin
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Command Center
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-violet-100/90 sm:text-base">
            Manage your admin team, invite operators, and monitor platform
            activity — without duplicating the main dashboard.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
