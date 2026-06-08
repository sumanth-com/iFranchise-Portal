"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import type { BrandHealthSummary } from "@/lib/dashboard/brand-health";
import { cn } from "@/lib/utils";

type BrandHealthWidgetProps = {
  health: BrandHealthSummary;
  brandName?: string | null;
};

export function BrandHealthWidget({ health, brandName }: BrandHealthWidgetProps) {
  const incomplete = health.items.filter((i) => !i.complete);

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
          <p className="text-xs text-slate-500">Complete</p>
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

      <ul className="mt-5 flex flex-wrap gap-2">
        {health.items.map((item, index) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
          >
            <Link
              href={item.href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-[1.03]",
                item.complete
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm hover:bg-emerald-100"
                  : "border border-red-200 bg-red-50 text-red-700 shadow-sm hover:bg-red-100",
              )}
            >
              {item.complete ? (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              ) : (
                <span className="flex h-4 w-4 items-center justify-center text-sm font-bold leading-none text-red-600">
                  *
                </span>
              )}
              <span>{item.complete ? item.label : `Missing ${item.label}`}</span>
            </Link>
          </motion.li>
        ))}
      </ul>

      {incomplete.length > 0 ? (
        <p className="mt-4 text-xs text-slate-500">
          {incomplete.length} item{incomplete.length === 1 ? "" : "s"} remaining
          before your listing is marketplace-ready.
        </p>
      ) : (
        <p className="mt-4 text-xs font-medium text-emerald-600">
          Your listing profile is complete. Submit for review when ready.
        </p>
      )}
    </GlassCard>
  );
}
