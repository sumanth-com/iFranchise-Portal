"use client";

import { motion } from "framer-motion";

import { BrandTable } from "@/components/admin/BrandTable";
import { DashboardActivityTimeline } from "@/components/admin/dashboard/dashboard-activity-timeline";
import { DashboardAnalyticsGrid } from "@/components/admin/dashboard/dashboard-analytics-grid";
import { DashboardCharts } from "@/components/admin/dashboard/dashboard-charts";
import { DashboardHero } from "@/components/admin/dashboard/dashboard-hero";
import { DashboardInsights } from "@/components/admin/dashboard/dashboard-insights";
import { DashboardPerformanceSection } from "@/components/admin/dashboard/dashboard-performance";
import { fadeUp } from "@/lib/motion";
import type { AdminDashboardData } from "@/types/admin-dashboard";

type AdminDashboardProps = {
  data: AdminDashboardData;
  adminName: string;
};

export function AdminDashboard({ data, adminName }: AdminDashboardProps) {
  return (
    <div className="w-full space-y-6 pb-8 lg:space-y-8">
      {data.error ? (
        <motion.div
          {...fadeUp}
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {data.error}
        </motion.div>
      ) : null}

      <DashboardHero adminName={adminName} hero={data.hero} />

      <DashboardAnalyticsGrid analytics={data.analytics} />

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
            Intelligence
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Growth & conversion analytics
          </h2>
        </div>
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:gap-5">
          <div className="min-w-0 lg:col-span-8 xl:col-span-9">
            <DashboardCharts charts={data.charts} showHeader={false} />
          </div>
          <div className="min-w-0 lg:col-span-4 xl:col-span-3">
            <DashboardActivityTimeline
              items={data.timeline}
              className="lg:sticky lg:top-4"
            />
          </div>
        </div>
      </section>

      <DashboardInsights insights={data.insights} />

      <DashboardPerformanceSection performance={data.performance} />

      <motion.section {...fadeUp} className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
            Review queue
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Pending applications
          </h2>
        </div>
        <BrandTable
          brands={data.pendingQueue}
          total={data.pendingTotal}
          page={1}
          pageSize={5}
          basePath="/admin"
          title="Awaiting your decision"
          description="Brands submitted and ready for review."
          pendingOnly
          showQuickActions
        />
      </motion.section>
    </div>
  );
}
