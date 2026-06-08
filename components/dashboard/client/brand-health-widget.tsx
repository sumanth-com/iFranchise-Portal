"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import Link from "next/link";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import type { BrandHealthSummary } from "@/lib/dashboard/brand-health";
import { cn } from "@/lib/utils";

type BrandHealthWidgetProps = {
  health: BrandHealthSummary;
  brandName?: string | null;
};

export function BrandHealthWidget({ health, brandName }: BrandHealthWidgetProps) {
  const incomplete = health.items.filter((item) => !item.complete);

  return (
    <GlassCard padding="lg" className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6D28D9]">
            Brand Health
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">
            {brandName ? `${brandName} checklist` : "Listing readiness"}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-[#6D28D9]">{health.completion}%</p>
          <p className="text-xs text-slate-500">Overall</p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${health.completion}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-[#6D28D9] to-[#4F46E5]"
        />
      </div>

      <ul className="mt-5 space-y-2">
        {health.items.map((item, index) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
          >
            <Link
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200",
                item.complete
                  ? "border-emerald-200/80 bg-emerald-50/50 hover:border-emerald-300 hover:bg-emerald-50"
                  : "border-red-200/80 bg-red-50/40 hover:border-red-300 hover:bg-red-50",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-sm",
                  item.complete ? "bg-emerald-500 text-white" : "bg-red-500 text-white",
                )}
              >
                {item.complete ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  <X className="h-3.5 w-3.5" strokeWidth={3} />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "truncate text-sm font-semibold",
                      item.complete ? "text-emerald-900" : "text-red-800",
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-xs font-bold tabular-nums",
                      item.complete ? "text-emerald-700" : "text-red-600",
                    )}
                  >
                    {item.percent}%
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/80">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      item.complete
                        ? "bg-emerald-500"
                        : "bg-gradient-to-r from-red-400 to-red-500",
                    )}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>

              <ArrowRight
                className={cn(
                  "h-4 w-4 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100",
                  item.complete ? "text-emerald-600" : "text-red-500",
                )}
              />
            </Link>
          </motion.li>
        ))}
      </ul>

      {incomplete.length > 0 ? (
        <p className="mt-4 text-xs text-slate-500">
          {incomplete.length} item{incomplete.length === 1 ? "" : "s"} remaining
          — tap any row to edit and complete it.
        </p>
      ) : (
        <p className="mt-4 text-xs font-medium text-emerald-600">
          All sections are 100% complete. Submit for review when ready.
        </p>
      )}
    </GlassCard>
  );
}
