"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  ClipboardList,
  Minus,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { OperationsDashboardData } from "@/types/admin-operations";

type OperationsOverviewProps = {
  kpis: OperationsDashboardData["kpis"];
};

const cards = [
  {
    key: "totalBrands" as const,
    label: "Total Brands",
    icon: Building2,
    iconBg: "bg-violet-500/10 text-violet-600",
  },
  {
    key: "pendingReviews" as const,
    label: "Pending Reviews",
    icon: ClipboardList,
    iconBg: "bg-amber-500/10 text-amber-600",
  },
  {
    key: "totalLeads" as const,
    label: "Total Leads",
    icon: Users,
    iconBg: "bg-sky-500/10 text-sky-600",
  },
  {
    key: "totalAdmins" as const,
    label: "Total Admins",
    icon: Shield,
    iconBg: "bg-emerald-500/10 text-emerald-600",
  },
];

export function OperationsOverview({ kpis }: OperationsOverviewProps) {
  return (
    <motion.section {...fadeUp}>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
          Executive Overview
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Admin Command Center
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Platform operations at a glance — brands, reviews, leads, and admins.
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {cards.map((card) => {
          const metric = kpis[card.key];
          const Icon = card.icon;
          const up = metric.changePercent > 0;
          const down = metric.changePercent < 0;
          const TrendIcon = up ? TrendingUp : down ? TrendingDown : Minus;

          return (
            <motion.div key={card.key} variants={staggerItem}>
              <Link
                href={metric.href}
                className="group flex h-full min-h-[120px] flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {card.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                      {metric.value.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      card.iconBg,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-auto flex items-center gap-1.5 pt-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      up && "bg-emerald-50 text-emerald-700",
                      down && "bg-rose-50 text-rose-700",
                      !up && !down && "bg-slate-100 text-slate-600",
                    )}
                  >
                    <TrendIcon className="h-3 w-3" />
                    {metric.changePercent > 0 ? "+" : ""}
                    {metric.changePercent}%
                  </span>
                  <span className="text-[11px] text-slate-400">vs last month</span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
