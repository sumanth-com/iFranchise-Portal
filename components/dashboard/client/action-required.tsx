"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import type { MissingAction } from "@/lib/dashboard/missing-actions";
import { cn } from "@/lib/utils";

type ActionRequiredProps = {
  actions: MissingAction[];
};

const PRIORITY_STYLES = {
  high: "bg-neutral-200 text-black ring-neutral-500",
  medium: "bg-neutral-100 text-black ring-neutral-400",
  low: "bg-white text-black ring-neutral-300",
};

export function ActionRequired({ actions }: ActionRequiredProps) {
  if (actions.length === 0) {
    return (
      <GlassCard padding="lg" className="text-black">
        <h3 className="text-lg font-semibold text-black">Action Required</h3>
        <p className="mt-3 text-sm text-black">
          You&apos;re all caught up — no pending tasks right now.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="lg" className="text-black">
      <h3 className="text-lg font-semibold text-black">Action Required</h3>
      <p className="mt-1 text-sm text-black">
        Complete these items to strengthen your listing
      </p>

      <ul className="mt-5 space-y-3">
        {actions.map((action, i) => (
          <motion.li
            key={action.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-neutral-300 bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-black">{action.title}</h4>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ring-inset",
                      PRIORITY_STYLES[action.priority],
                    )}
                  >
                    {action.priority}
                  </span>
                </div>
                <p className="mt-1 text-sm text-black">{action.description}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-black">
                  <Clock className="h-3 w-3" />~{action.estimatedMinutes} min
                </p>
              </div>
              <Link
                href={action.href}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-black bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
              >
                Complete Now
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.li>
        ))}
      </ul>
    </GlassCard>
  );
}
