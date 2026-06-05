"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import type { SectionProgress } from "@/lib/dashboard/section-completion";
import { getOverallProgress } from "@/lib/dashboard/section-completion";

type CompletionTrackerProps = {
  sections: SectionProgress[];
};

const TRACKED_KEYS = new Set([
  "my_brand",
  "assets",
  "investment",
  "franchise_model",
  "locations",
  "expansion",
  "documents",
]);

export function CompletionTracker({ sections }: CompletionTrackerProps) {
  const tracked = sections.filter((s) => TRACKED_KEYS.has(s.key));
  const overall = getOverallProgress(sections);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (overall / 100) * circumference;

  return (
    <GlassCard padding="lg" className="text-black">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-black">Profile Completion</h3>
          <p className="mt-1 text-sm text-black">
            Complete each section to submit for review
          </p>
        </div>

        <div className="relative mx-auto h-32 w-32 shrink-0 sm:mx-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#e5e5e5"
              strokeWidth="8"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#000000"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-black">{overall}%</span>
            <span className="text-[10px] uppercase tracking-wider text-black">
              Overall
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {tracked.map((section, i) => (
          <Link
            key={section.key}
            href={section.href}
            className="group block rounded-xl p-1 transition-colors hover:bg-white"
          >
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-black">{section.label}</span>
              <span className="text-black">{section.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
              <motion.div
                className="h-full rounded-full bg-black"
                initial={{ width: 0 }}
                animate={{ width: `${section.percent}%` }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              />
            </div>
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}
