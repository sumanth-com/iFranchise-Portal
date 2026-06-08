"use client";

import {
  Bell,
  Building2,
  Clock,
  MessageSquare,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type DashboardKpis = {
  totalBrands: number;
  activeListings: number;
  messages: number;
  notifications: number;
  underReview: number;
  futureLeads: number | null;
};

export const EMPTY_DASHBOARD_KPIS: DashboardKpis = {
  totalBrands: 0,
  activeListings: 0,
  messages: 0,
  notifications: 0,
  underReview: 0,
  futureLeads: null,
};

const KPI_CONFIG: {
  key: keyof DashboardKpis;
  label: string;
  icon: LucideIcon;
  accent: string;
}[] = [
  {
    key: "totalBrands",
    label: "Total Brands",
    icon: Building2,
    accent: "from-[#6D28D9] to-[#4F46E5]",
  },
  {
    key: "activeListings",
    label: "Active Listings",
    icon: Store,
    accent: "from-emerald-500 to-teal-600",
  },
  {
    key: "messages",
    label: "Messages",
    icon: MessageSquare,
    accent: "from-blue-500 to-indigo-600",
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: Bell,
    accent: "from-amber-500 to-orange-500",
  },
  {
    key: "underReview",
    label: "Review Status",
    icon: Clock,
    accent: "from-violet-500 to-purple-600",
  },
  {
    key: "futureLeads",
    label: "Future Leads",
    icon: Users,
    accent: "from-slate-500 to-slate-600",
  },
];

type KpiGridProps = {
  kpis?: DashboardKpis;
};

export function DashboardKpiGrid({ kpis = EMPTY_DASHBOARD_KPIS }: KpiGridProps) {
  const safeKpis = kpis ?? EMPTY_DASHBOARD_KPIS;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {KPI_CONFIG.map(({ key, label, icon: Icon, accent }) => {
        const raw = safeKpis[key];
        const value = raw === null ? "—" : raw;
        const showTrend = typeof raw === "number" && raw > 0 && key !== "futureLeads";

        return (
          <div
            key={key}
            className="group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                  {value}
                </p>
                {showTrend ? (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                    <TrendingUp className="h-3 w-3" />
                    Active
                  </p>
                ) : key === "futureLeads" ? (
                  <p className="mt-1 text-[11px] text-slate-400">Coming soon</p>
                ) : null}
              </div>
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform duration-200 group-hover:scale-105",
                  accent,
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
