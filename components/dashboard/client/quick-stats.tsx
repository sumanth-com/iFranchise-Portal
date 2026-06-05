"use client";

import { motion } from "framer-motion";
import { Calendar, FileText, ImageIcon, Percent } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { GlassCard } from "@/components/dashboard/client/glass-card";

type QuickStatsProps = {
  completion: number;
  assetCount: number;
  documentCount: number;
  daysSinceUpdate: number | null;
};

export function QuickStats({
  completion,
  assetCount,
  documentCount,
  daysSinceUpdate,
}: QuickStatsProps) {
  const stats: { label: string; value: string; icon: LucideIcon }[] = [
    { label: "Profile Completion", value: `${completion}%`, icon: Percent },
    { label: "Uploaded Assets", value: String(assetCount), icon: ImageIcon },
    { label: "Documents Uploaded", value: String(documentCount), icon: FileText },
    {
      label: "Days Since Last Update",
      value: daysSinceUpdate != null ? String(daysSinceUpdate) : "—",
      icon: Calendar,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <GlassCard hover className="h-full text-black">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-300 bg-white text-black">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-black">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-black">{stat.value}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
