"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "primary" | "warning" | "success" | "accent";
  subtext?: string;
};

const accents = {
  primary: "from-[#6D28D9]/10 to-transparent border-l-[#6D28D9]",
  warning: "from-amber-500/10 to-transparent border-l-amber-500",
  success: "from-emerald-500/10 to-transparent border-l-emerald-500",
  accent: "from-[#A78BFA]/20 to-transparent border-l-[#A78BFA]",
};

const iconBg = {
  primary: "bg-primary-100 text-primary-600",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
  accent: "bg-primary-50 text-primary-600",
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
  subtext,
}: KpiCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4 }}
      className={cn(
        "rounded-[var(--radius-card)] border border-border border-l-4 bg-gradient-to-br bg-surface p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]",
        accents[accent],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          {subtext ? (
            <p className="mt-1 text-xs text-slate-500">{subtext}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            iconBg[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
