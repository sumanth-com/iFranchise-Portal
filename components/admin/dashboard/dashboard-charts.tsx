"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { DashboardCharts } from "@/types/admin-dashboard";

type DashboardChartsProps = {
  charts: DashboardCharts;
  showHeader?: boolean;
};

const CHART_COLORS = ["#7C3AED", "#2563EB", "#059669", "#D97706", "#E11D48", "#64748B"];
const FUNNEL_COLORS = ["#7C3AED", "#6366F1", "#3B82F6", "#10B981"];

function ChartCard({
  title,
  subtitle,
  children,
  empty,
  className,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  empty?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      {...fadeUp}
      className={cn(
        "h-full rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 backdrop-blur-xl sm:p-6",
        className,
      )}
    >
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
      {empty ? (
        <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-sm text-slate-500">
          No data yet — metrics will appear as activity grows.
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="text-slate-600">{payload[0].value.toLocaleString("en-IN")}</p>
    </div>
  );
}

export function DashboardCharts({ charts, showHeader = true }: DashboardChartsProps) {
  const hasLeadGrowth = charts.leadGrowth.some((d) => d.value > 0);
  const hasSubmissions = charts.brandSubmissions.some((d) => d.value > 0);
  const hasApprovals = charts.monthlyApprovals.some((d) => d.value > 0);
  const hasFunnel = charts.leadFunnel.some((d) => d.value > 0);
  const hasCategories = charts.topCategories.length > 0;

  return (
    <section className="space-y-4">
      {showHeader ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
            Intelligence
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Growth & conversion analytics
          </h2>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChartCard
          title="Lead growth"
          subtitle="Monthly investor inquiries captured"
          empty={!hasLeadGrowth}
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.leadGrowth}>
                <defs>
                  <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#7C3AED" fill="url(#leadGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Brand submission trend"
          subtitle="New franchise applications over time"
          empty={!hasSubmissions}
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.brandSubmissions}>
                <defs>
                  <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#2563EB" fill="url(#subGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Monthly approvals"
          subtitle="Brands approved by review team"
          empty={!hasApprovals}
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyApprovals}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Lead conversion funnel"
          subtitle="Pipeline from inquiry to close"
          empty={!hasFunnel}
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip content={<ChartTooltip />} />
                <Funnel dataKey="value" data={charts.leadFunnel} isAnimationActive>
                  <LabelList position="right" fill="#334155" stroke="none" fontSize={11} />
                  {charts.leadFunnel.map((_, i) => (
                    <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Top performing categories"
          subtitle="Brand distribution by industry"
          empty={!hasCategories}
          className="sm:col-span-2"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.topCategories} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94A3B8" allowDecimals={false} />
                <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 10 }} stroke="#94A3B8" />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {charts.topCategories.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </section>
  );
}
