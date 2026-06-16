"use client";

import { motion } from "framer-motion";
import { Activity, Clock, HardDrive, Users } from "lucide-react";

import { EMPTY_PLATFORM_HEALTH } from "@/lib/admin-management/normalize-dashboard-data";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { PlatformHealth } from "@/types/admin-operations";

type ExecutivePlatformHealthProps = {
  health: PlatformHealth;
};

export function ExecutivePlatformHealth({ health }: ExecutivePlatformHealthProps) {
  const safeHealth = health ?? EMPTY_PLATFORM_HEALTH;
  const isHealthy = safeHealth.marketplaceStatus === "healthy";

  const cards = [
    {
      label: "Marketplace status",
      value: safeHealth.marketplaceLabel,
      icon: Activity,
      healthy: isHealthy,
    },
    {
      label: "Storage usage",
      value: safeHealth.storageLabel,
      icon: HardDrive,
      healthy: safeHealth.storageUsagePercent < 85,
    },
    {
      label: "Active users",
      value: safeHealth.activeUsers.toLocaleString(),
      icon: Users,
      healthy: true,
    },
    {
      label: "Response time",
      value: safeHealth.responseLabel,
      icon: Clock,
      healthy:
        safeHealth.responseTimeMs !== null && safeHealth.responseTimeMs < 500,
    },
  ] as const;

  return (
    <motion.section {...fadeUp} className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Platform health
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
          Operational performance
        </h2>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              variants={staggerItem}
              className="rounded-2xl border border-slate-200/90 bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-slate-100">
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    card.healthy ? "bg-emerald-500" : "bg-amber-500",
                  )}
                  aria-hidden
                />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {card.label}
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {card.value}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
