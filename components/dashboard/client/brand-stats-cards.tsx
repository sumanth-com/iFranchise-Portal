"use client";

import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  Clock,
  FileEdit,
  XCircle,
} from "lucide-react";

import type { BrandPortfolioStats } from "@/lib/dashboard/brand-stats";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    key: "total" as const,
    label: "Total Brands",
    icon: Building2,
    gradient: "from-[#6D28D9] to-[#4F46E5]",
    shadow: "rgba(109,40,217,0.25)",
  },
  {
    key: "draft" as const,
    label: "Draft",
    icon: FileEdit,
    gradient: "from-slate-600 to-slate-700",
    shadow: "rgba(71,85,105,0.2)",
  },
  {
    key: "underReview" as const,
    label: "Under Review",
    icon: Clock,
    gradient: "from-amber-500 to-orange-500",
    shadow: "rgba(245,158,11,0.25)",
  },
  {
    key: "approved" as const,
    label: "Approved",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-teal-600",
    shadow: "rgba(16,185,129,0.25)",
  },
  {
    key: "rejected" as const,
    label: "Rejected",
    icon: XCircle,
    gradient: "from-rose-500 to-red-600",
    shadow: "rgba(244,63,94,0.25)",
  },
];

type BrandStatsCardsProps = {
  stats: BrandPortfolioStats;
};

export function BrandStatsCards({ stats }: BrandStatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {CARDS.map((card, index) => {
        const Icon = card.icon;
        const value = stats[card.key];

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {value}
                </p>
              </div>
              <span
                className={cn(
                  "dash-on-color flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
                  card.gradient,
                )}
                style={{ boxShadow: `0 8px 20px ${card.shadow}` }}
              >
                <Icon className="h-5 w-5 shrink-0 !text-white" strokeWidth={2} />
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
