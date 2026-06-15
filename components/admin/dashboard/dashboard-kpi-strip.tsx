"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  ChevronRight,
  ClipboardList,
  Minus,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { MetricTrend } from "@/types/admin-dashboard";

type DashboardKpiStripProps = {
  totalBrands: MetricTrend;
  pendingReviews: MetricTrend;
  totalLeads: MetricTrend;
  teamMembers: { value: number; changePercent: number };
  teamHref?: string;
  teamLabel?: string;
};

const cards = (
  teamHref: string,
  teamLabel: string,
) =>
  [
    {
      key: "totalBrands" as const,
      label: "Total brands",
      icon: Building2,
      accent: "text-violet-600 bg-violet-500/10",
      href: "/admin/brands",
    },
    {
      key: "pendingReviews" as const,
      label: "Pending reviews",
      icon: ClipboardList,
      accent: "text-purple-600 bg-purple-500/10",
      href: "/admin/reviews",
      highlight: (v: number) => v > 0,
    },
    {
      key: "totalLeads" as const,
      label: "Investor leads",
      icon: Users,
      accent: "text-indigo-600 bg-indigo-500/10",
      href: "/admin/leads",
    },
    {
      key: "teamMembers" as const,
      label: teamLabel,
      icon: Shield,
      accent: "text-fuchsia-600 bg-fuchsia-500/10",
      href: teamHref,
    },
  ] as const;

export function DashboardKpiStrip({
  totalBrands,
  pendingReviews,
  totalLeads,
  teamMembers,
  teamHref = "/admin/team",
  teamLabel = "Team",
}: DashboardKpiStripProps) {
  const metrics = {
    totalBrands,
    pendingReviews,
    totalLeads,
    teamMembers: {
      value: teamMembers.value,
      changePercent: teamMembers.changePercent,
    },
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
    >
      {cards(teamHref, teamLabel).map((card) => {
        const metric = metrics[card.key];
        const Icon = card.icon;
        const up = metric.changePercent > 0;
        const down = metric.changePercent < 0;
        const TrendIcon = up ? TrendingUp : down ? TrendingDown : Minus;
        const needsAttention =
          "highlight" in card && card.highlight?.(metric.value);

        return (
          <motion.div key={card.key} variants={staggerItem}>
            <Link
              href={card.href}
              className={cn(
                "group flex h-full flex-col rounded-2xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5",
                needsAttention
                  ? "border-purple-200 ring-1 ring-purple-100"
                  : "border-slate-200/80 hover:border-violet-200",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    card.accent,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-500" />
              </div>
              <p className="mt-4 text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">
                {metric.value.toLocaleString("en-IN")}
              </p>
              <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
                {card.label}
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-[11px]",
                    up && "bg-emerald-50 text-emerald-700",
                    down && "bg-rose-50 text-rose-700",
                    !up && !down && "bg-slate-100 text-slate-600",
                  )}
                >
                  <TrendIcon className="h-3 w-3" />
                  {metric.changePercent > 0 ? "+" : ""}
                  {metric.changePercent}%
                </span>
                <span className="text-[10px] text-slate-400 sm:text-[11px]">
                  vs last month
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
