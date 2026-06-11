"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  CircleDollarSign,
  Clock,
  Gauge,
  Handshake,
  Target,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

import { MetricCard } from "@/components/admin/dashboard/metric-card";
import { staggerContainer } from "@/lib/motion";
import type { DashboardAnalyticsMetrics } from "@/types/admin-dashboard";

type DashboardAnalyticsGridProps = {
  analytics: DashboardAnalyticsMetrics;
};

export function DashboardAnalyticsGrid({ analytics }: DashboardAnalyticsGridProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
          Analytics
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Platform performance metrics
        </h2>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5"
      >
        <MetricCard label="Total brands" metric={analytics.totalBrands} icon={Building2} accent="violet" />
        <MetricCard label="Approved brands" metric={analytics.approvedBrands} icon={BadgeCheck} accent="emerald" />
        <MetricCard label="Pending brands" metric={analytics.pendingBrands} icon={Clock} accent="amber" />
        <MetricCard label="Rejected brands" metric={analytics.rejectedBrands} icon={XCircle} accent="rose" />
        <MetricCard label="Total leads" metric={analytics.totalLeads} icon={Handshake} accent="sky" />
        <MetricCard label="Active leads" metric={analytics.activeLeads} icon={UserCheck} accent="emerald" />
        <MetricCard label="Closed leads" metric={analytics.closedLeads} icon={Target} accent="slate" />
        <MetricCard label="Conversion rate" metric={analytics.conversionRate} icon={Gauge} accent="violet" format="percent" />
        <MetricCard label="Revenue potential" metric={analytics.revenuePotential} icon={CircleDollarSign} accent="amber" format="currency" />
        <MetricCard label="Team performance" metric={analytics.teamPerformance} icon={Users} accent="sky" />
      </motion.div>
    </section>
  );
}
