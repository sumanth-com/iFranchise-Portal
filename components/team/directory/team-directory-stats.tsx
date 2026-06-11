"use client";

import { motion } from "framer-motion";
import { TrendingUp, UserCheck, UserPlus, Users, UserX } from "lucide-react";

import { staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { TeamDirectoryStats } from "@/types/team-directory";

type TeamDirectoryStatsProps = {
  stats: TeamDirectoryStats;
};

const cards = [
  {
    key: "total" as const,
    label: "Total Team Members",
    icon: Users,
    accent: "from-violet-500/10 to-violet-500/0 border-violet-100",
    iconBg: "bg-violet-500/10 text-violet-600",
  },
  {
    key: "active" as const,
    label: "Active Members",
    icon: UserCheck,
    accent: "from-emerald-500/10 to-emerald-500/0 border-emerald-100",
    iconBg: "bg-emerald-500/10 text-emerald-600",
  },
  {
    key: "inactive" as const,
    label: "Inactive Members",
    icon: UserX,
    accent: "from-slate-500/10 to-slate-500/0 border-slate-200",
    iconBg: "bg-slate-500/10 text-slate-600",
  },
  {
    key: "newThisMonth" as const,
    label: "New Joinees This Month",
    icon: UserPlus,
    accent: "from-amber-500/10 to-amber-500/0 border-amber-100",
    iconBg: "bg-amber-500/10 text-amber-600",
  },
];

export function TeamDirectoryStatsBar({ stats }: TeamDirectoryStatsProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key];
        return (
          <motion.div
            key={card.key}
            variants={staggerItem}
            whileHover={{ y: -2 }}
            className={cn(
              "rounded-2xl border bg-gradient-to-br bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
              card.accent,
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                  {value}
                </p>
                {card.key === "newThisMonth" && value > 0 ? (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                    <TrendingUp className="h-3 w-3" />
                    Growing team
                  </p>
                ) : null}
              </div>
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl",
                  card.iconBg,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
