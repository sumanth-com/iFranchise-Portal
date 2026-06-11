"use client";

import { motion } from "framer-motion";
import { Minus, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

import { DashboardSparkline } from "@/components/admin/dashboard/dashboard-sparkline";
import { staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { MetricTrend } from "@/types/admin-dashboard";

type MetricCardProps = {
  label: string;
  metric: MetricTrend;
  icon: LucideIcon;
  format?: "number" | "percent" | "currency";
  accent?: "violet" | "emerald" | "amber" | "rose" | "sky" | "slate";
  sparkColor?: string;
};

const accentStyles = {
  violet: {
    ring: "ring-violet-500/10",
    icon: "bg-violet-500/10 text-violet-600",
    spark: "#7C3AED",
  },
  emerald: {
    ring: "ring-emerald-500/10",
    icon: "bg-emerald-500/10 text-emerald-600",
    spark: "#059669",
  },
  amber: {
    ring: "ring-amber-500/10",
    icon: "bg-amber-500/10 text-amber-600",
    spark: "#D97706",
  },
  rose: {
    ring: "ring-rose-500/10",
    icon: "bg-rose-500/10 text-rose-600",
    spark: "#E11D48",
  },
  sky: {
    ring: "ring-sky-500/10",
    icon: "bg-sky-500/10 text-sky-600",
    spark: "#0284C7",
  },
  slate: {
    ring: "ring-slate-500/10",
    icon: "bg-slate-500/10 text-slate-600",
    spark: "#475569",
  },
};

function formatValue(
  value: number,
  format: MetricCardProps["format"],
): string {
  if (format === "percent") return `${value}%`;
  if (format === "currency") {
    if (value >= 1_000_000) return `₹${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `₹${(value / 1_000).toFixed(0)}K`;
    return `₹${value.toLocaleString("en-IN")}`;
  }
  return value.toLocaleString("en-IN");
}

export function MetricCard({
  label,
  metric,
  icon: Icon,
  format = "number",
  accent = "violet",
  sparkColor,
}: MetricCardProps) {
  const styles = accentStyles[accent];
  const trendUp = metric.changePercent > 0;
  const trendDown = metric.changePercent < 0;
  const TrendIcon = trendUp ? TrendingUp : trendDown ? TrendingDown : Minus;

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] ring-1 backdrop-blur-xl",
        styles.ring,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-violet-500/[0.03] opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {formatValue(metric.value, format)}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                trendUp && "bg-emerald-50 text-emerald-700",
                trendDown && "bg-rose-50 text-rose-700",
                !trendUp && !trendDown && "bg-slate-100 text-slate-600",
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {metric.changePercent > 0 ? "+" : ""}
              {metric.changePercent}%
            </span>
            <span className="text-[11px] text-slate-400">vs last month</span>
          </div>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            styles.icon,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="relative mt-4">
        <DashboardSparkline
          data={metric.sparkline}
          color={sparkColor ?? styles.spark}
          id={label.replace(/\s+/g, "-").toLowerCase()}
        />
      </div>
    </motion.div>
  );
}
