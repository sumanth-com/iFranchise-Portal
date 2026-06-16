"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Globe,
  TrendingUp,
  Users,
} from "lucide-react";

import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";
import { EMPTY_EXECUTIVE_SUMMARY } from "@/lib/admin-management/normalize-dashboard-data";
import type { ExecutiveSummary } from "@/types/admin-operations";

type ExecutiveSummaryCardsProps = {
  summary: ExecutiveSummary;
};

const CARDS = [
  {
    key: "brandsUnderReview" as const,
    label: "Brands Under Review",
    href: "/admin/reviews",
    icon: Building2,
    tone: "text-amber-700 bg-amber-50 ring-amber-100",
  },
  {
    key: "publishedBrands" as const,
    label: "Published Brands",
    href: "/admin/brands",
    icon: Globe,
    tone: "text-emerald-700 bg-emerald-50 ring-emerald-100",
  },
  {
    key: "newLeadsToday" as const,
    label: "New Leads Today",
    href: "/admin/leads",
    icon: TrendingUp,
    tone: "text-violet-700 bg-violet-50 ring-violet-100",
  },
  {
    key: "activeTeamMembers" as const,
    label: "Active Team Members",
    href: "/admin/team",
    icon: Users,
    tone: "text-slate-700 bg-slate-50 ring-slate-200",
  },
] as const;

export function ExecutiveSummaryCards({ summary }: ExecutiveSummaryCardsProps) {
  const safeSummary = summary ?? EMPTY_EXECUTIVE_SUMMARY;

  return (
    <motion.section {...fadeUp} className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Executive summary
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
          Platform at a glance
        </h2>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {CARDS.map((card) => {
          const Icon = card.icon;
          const value = safeSummary[card.key] ?? 0;

          return (
            <motion.div key={card.key} variants={staggerItem}>
              <Link
                href={card.href}
                className="block rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${card.tone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {card.label}
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
                  {value.toLocaleString()}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
