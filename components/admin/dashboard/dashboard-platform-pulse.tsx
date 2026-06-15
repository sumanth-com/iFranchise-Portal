"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  Layers,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type {
  ChartSeriesPoint,
  DashboardAnalyticsMetrics,
  DashboardHeroMetrics,
} from "@/types/admin-dashboard";

type DashboardPlatformPulseProps = {
  analytics: DashboardAnalyticsMetrics;
  hero: DashboardHeroMetrics;
  categories: ChartSeriesPoint[];
};

const PIPELINE_COLORS = {
  pending: "#F59E0B",
  approved: "#7C3AED",
  rejected: "#F43F5E",
  draft: "#94A3B8",
};

type Priority = {
  id: string;
  title: string;
  description: string;
  href?: string;
  cta?: string;
  accent: string;
  icon: typeof Target;
};

function buildPriorities(
  analytics: DashboardAnalyticsMetrics,
  hero: DashboardHeroMetrics,
  categories: ChartSeriesPoint[],
): Priority[] {
  const items: Priority[] = [];

  if (hero.pendingReviews > 0) {
    items.push({
      id: "reviews",
      title: `${hero.pendingReviews} brand${hero.pendingReviews === 1 ? "" : "s"} need your decision`,
      description: "Franchise owners are waiting — clearing the queue keeps momentum high.",
      href: "/admin/reviews",
      cta: "Open review queue",
      accent: "border-amber-200 bg-amber-50/80",
      icon: ClipboardList,
    });
  }

  if (analytics.totalLeads.value === 0) {
    items.push({
      id: "leads",
      title: "No investor leads yet",
      description: "Publish approved brands to the marketplace to start capturing inquiries.",
      href: "/admin/brands",
      cta: "View brands",
      accent: "border-sky-200 bg-sky-50/80",
      icon: Users,
    });
  } else if (analytics.activeLeads.value > 0) {
    items.push({
      id: "active-leads",
      title: `${analytics.activeLeads.value} active lead${analytics.activeLeads.value === 1 ? "" : "s"} in pipeline`,
      description: "Follow up on new and qualified inquiries before they go cold.",
      href: "/admin/leads",
      cta: "View leads",
      accent: "border-emerald-200 bg-emerald-50/80",
      icon: Target,
    });
  }

  if (categories.length === 1) {
    items.push({
      id: "category",
      title: `Portfolio is ${categories[0].label}-focused`,
      description:
        "Your first brand sets the tone — invite diverse industries as you scale the marketplace.",
      accent: "border-violet-200 bg-violet-50/80",
      icon: Layers,
    });
  } else if (categories.length > 1) {
    const top = categories[0];
    items.push({
      id: "category-mix",
      title: `${top.label} leads your portfolio`,
      description: `${top.value} brand${top.value === 1 ? "" : "s"} — balance categories for broader investor appeal.`,
      accent: "border-violet-200 bg-violet-50/80",
      icon: Layers,
    });
  }

  if (hero.monthlyGrowthPercent > 0 && items.length < 3) {
    items.push({
      id: "growth",
      title: "Submission activity is rising",
      description: `Brand activity grew ${hero.monthlyGrowthPercent}% vs last month — keep review turnaround tight.`,
      accent: "border-emerald-200 bg-emerald-50/80",
      icon: TrendingUp,
    });
  }

  if (items.length === 0) {
    items.push({
      id: "healthy",
      title: "Platform is running smoothly",
      description: "No urgent actions — monitor activity and team performance below.",
      accent: "border-slate-200 bg-slate-50/80",
      icon: Sparkles,
    });
  }

  return items.slice(0, 3);
}

function PipelineTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { fill: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold capitalize text-slate-900">{item.name}</p>
      <p className="text-slate-600">{item.value} brand{item.value === 1 ? "" : "s"}</p>
    </div>
  );
}

export function DashboardPlatformPulse({
  analytics,
  hero,
  categories,
}: DashboardPlatformPulseProps) {
  const total = analytics.totalBrands.value || 1;
  const draftCount = Math.max(
    0,
    total -
      analytics.pendingBrands.value -
      analytics.approvedBrands.value -
      analytics.rejectedBrands.value,
  );

  const pipeline = [
    {
      name: "pending",
      label: "In review",
      value: analytics.pendingBrands.value,
      fill: PIPELINE_COLORS.pending,
    },
    {
      name: "approved",
      label: "Approved",
      value: analytics.approvedBrands.value,
      fill: PIPELINE_COLORS.approved,
    },
    {
      name: "rejected",
      label: "Rejected",
      value: analytics.rejectedBrands.value,
      fill: PIPELINE_COLORS.rejected,
    },
    {
      name: "draft",
      label: "Draft",
      value: draftCount,
      fill: PIPELINE_COLORS.draft,
    },
  ].filter((s) => s.value > 0);

  const priorities = buildPriorities(analytics, hero, categories);
  const categoryTotal = categories.reduce((sum, c) => sum + c.value, 0) || 1;

  return (
    <motion.section {...fadeUp} className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
          Strategic overview
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Marketplace intelligence
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Pipeline health, priorities, and portfolio mix — without duplicating your review queue.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Pipeline donut */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-900">Brand pipeline</h3>
          </div>

          {pipeline.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              Brands will appear here as owners submit listings.
            </p>
          ) : (
            <>
              <div className="relative mx-auto h-44 w-full max-w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pipeline}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={52}
                      outerRadius={72}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {pipeline.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<PipelineTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-slate-900">{total}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Total
                  </p>
                </div>
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-2">
                {pipeline.map((stage) => (
                  <li
                    key={stage.name}
                    className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: stage.fill }}
                    />
                    <span className="capitalize text-slate-600">{stage.label}</span>
                    <span className="ml-auto font-semibold tabular-nums text-slate-900">
                      {stage.value}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Priority actions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-slate-900">What needs attention</h3>
          </div>

          <motion.ul
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            {priorities.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.li
                  key={item.id}
                  variants={staggerItem}
                  className={cn(
                    "flex gap-4 rounded-xl border p-4 transition-shadow hover:shadow-sm",
                    item.accent,
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      <span className="mr-2 text-xs font-bold text-violet-500">
                        {index + 1}
                      </span>
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                    {item.href && item.cta ? (
                      <Link
                        href={item.href}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
                      >
                        {item.cta}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    ) : null}
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </div>

      {/* Industry mix — compact bars instead of sparse chart */}
      {categories.length > 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-violet-50/40 via-white to-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                Portfolio mix
              </p>
              <h3 className="text-sm font-semibold text-slate-900">
                Industry breakdown
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {categories.length} categor{categories.length === 1 ? "y" : "ies"} ·{" "}
              {categoryTotal} brand{categoryTotal === 1 ? "" : "s"}
            </p>
          </div>
          <ul className="space-y-3">
            {categories.slice(0, 6).map((cat, i) => {
              const pct = Math.round((cat.value / categoryTotal) * 100);
              const colors = ["#7C3AED", "#6366F1", "#2563EB", "#059669", "#D97706", "#64748B"];
              return (
                <li key={cat.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium capitalize text-slate-800">
                      {cat.label}
                    </span>
                    <span className="tabular-nums text-slate-500">
                      {cat.value} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: colors[i % colors.length] }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </motion.section>
  );
}
