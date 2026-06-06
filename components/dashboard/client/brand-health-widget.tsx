"use client";

import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
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
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-[#6D28D9] to-[#4F46E5]"
        />
      </div>

      <ul className="mt-5 space-y-2">
        {health.items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                item.complete
                  ? "text-slate-500"
                  : "bg-amber-50/80 text-amber-900 hover:bg-amber-50",
              )}
            >
              {item.complete ? (
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-amber-500" />
              )}
              <span className={item.complete ? "line-through" : "font-medium"}>
                {item.complete ? "" : "Missing "}
                {item.label}
              </span>
            </Link>
          </li>
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
