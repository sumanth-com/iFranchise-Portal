"use client";

import { motion } from "framer-motion";

import { DashboardActivityTimeline } from "@/components/admin/dashboard/dashboard-activity-timeline";
import { DashboardHero } from "@/components/admin/dashboard/dashboard-hero";
import { DashboardKpiStrip } from "@/components/admin/dashboard/dashboard-kpi-strip";
import { DashboardPlatformPulse } from "@/components/admin/dashboard/dashboard-platform-pulse";
import { fadeUp } from "@/lib/motion";
import type { AdminDashboardData } from "@/types/admin-dashboard";

type AdminDashboardProps = {
  data: AdminDashboardData;
  adminName: string;
  greeting: string;
  todayLabel: string;
  todayDateTime: string;
};

export function AdminDashboard({
  data,
  adminName,
  greeting,
  todayLabel,
  todayDateTime,
}: AdminDashboardProps) {
  return (
    <div className="w-full space-y-8 pb-8">
      {data.error ? (
        <motion.div
          {...fadeUp}
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {data.error}
        </motion.div>
      ) : null}

      <DashboardHero
        adminName={adminName}
        hero={data.hero}
        greeting={greeting}
        todayLabel={todayLabel}
        todayDateTime={todayDateTime}
      />

      <DashboardKpiStrip
        totalBrands={data.analytics.totalBrands}
        pendingReviews={data.analytics.pendingBrands}
        totalLeads={data.analytics.totalLeads}
        teamMembers={{
          value: data.hero.teamMembers,
          changePercent: data.analytics.teamPerformance.changePercent,
        }}
      />

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DashboardPlatformPulse
            analytics={data.analytics}
            hero={data.hero}
            categories={data.charts.topCategories}
          />
        </div>

        <DashboardActivityTimeline
          items={data.timeline.slice(0, 8)}
          className="xl:sticky xl:top-4"
        />
      </div>
    </div>
  );
}
