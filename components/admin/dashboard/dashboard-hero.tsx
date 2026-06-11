"use client";

import { motion } from "framer-motion";
import {
  Building2,
  ClipboardList,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { DashboardHeroMetrics } from "@/types/admin-dashboard";

type DashboardHeroProps = {
  adminName: string;
  hero: DashboardHeroMetrics;
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

const heroCards = [
  { key: "activeBrands" as const, label: "Active brands", icon: Building2 },
  { key: "pendingReviews" as const, label: "Pending reviews", icon: ClipboardList },
  { key: "totalLeads" as const, label: "Total leads", icon: UserPlus },
  { key: "teamMembers" as const, label: "Team members", icon: Users },
] as const;

export function DashboardHero({ adminName, hero }: DashboardHeroProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.25)] sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-violet-100 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Executive command center
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
            Welcome back, {adminName}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            Your franchise platform at a glance — review pipeline, lead momentum,
            and team operations in one premium workspace.
          </p>
          {now ? (
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              {formatDateTime(now)}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md lg:items-end">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Monthly growth
          </p>
          <div className="flex items-center gap-2">
            <TrendingUp
              className={cn(
                "h-5 w-5",
                hero.monthlyGrowthPercent >= 0 ? "text-emerald-400" : "text-rose-400",
              )}
            />
            <span className="text-3xl font-bold tabular-nums">
              {hero.monthlyGrowthPercent > 0 ? "+" : ""}
              {hero.monthlyGrowthPercent}%
            </span>
          </div>
          <p className="text-xs text-slate-400">Brand submission velocity</p>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="relative mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {heroCards.map(({ key, label, icon: Icon }) => (
          <motion.div
            key={key}
            variants={staggerItem}
            className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-md transition-colors hover:bg-white/[0.11]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {hero[key].toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Icon className="h-4 w-4 text-violet-200" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
