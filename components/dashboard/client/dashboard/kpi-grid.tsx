"use client";

import {
  Bell,
  Building2,
  Clock,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type DashboardKpis = {
  totalBrands: number;
  activeListings: number;
  notifications: number;
  underReview: number;
  futureLeads: number | null;
};

export const EMPTY_DASHBOARD_KPIS: DashboardKpis = {
  totalBrands: 0,
  activeListings: 0,
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
  compact?: boolean;
};

export function DashboardKpiGrid({
  kpis = EMPTY_DASHBOARD_KPIS,
  compact = false,
}: KpiGridProps) {
  const safeKpis = kpis ?? EMPTY_DASHBOARD_KPIS;

  return (
    <div
      className={cn(
        "grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5",
        compact ? "gap-3" : "gap-4",
      )}
    >
      {KPI_CONFIG.map(({ key, label, icon: Icon, accent }) => {
        const raw = safeKpis[key];
        const value = raw === null ? "—" : raw;
        const showTrend = typeof raw === "number" && raw > 0 && key !== "futureLeads";

        return (
          <div
            key={key}
            className={cn(
              "rounded-2xl border border-slate-200/90 bg-white shadow-sm",
              compact ? "p-3" : "p-4",
            )}
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
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
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
