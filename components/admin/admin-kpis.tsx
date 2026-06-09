"use client";

import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  Clock,
  Globe,
  Users,
  XCircle,
} from "lucide-react";

import { KpiCard } from "@/components/ui/kpi-card";
import { staggerContainer } from "@/lib/motion";
import type { AdminDashboardStats } from "@/types/admin";

type AdminKpisProps = {
  stats: AdminDashboardStats;
};

export function AdminKpis({ stats }: AdminKpisProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
    >
      <KpiCard
        label="Pending reviews"
        value={stats.pendingReviews}
        icon={Clock}
        accent="warning"
        subtext={stats.pendingReviews > 0 ? "Action required" : "Queue clear"}
      />
      <KpiCard
        label="Approved brands"
        value={stats.approvedBrands}
        icon={CheckCircle2}
        accent="success"
        subtext="Awaiting publish"
      />
      <KpiCard
        label="Published brands"
        value={stats.publishedBrands}
        icon={Globe}
        accent="primary"
        subtext="Live on website"
      />
      <KpiCard
        label="Rejected brands"
        value={stats.rejectedBrands}
        icon={XCircle}
        accent="accent"
      />
      <KpiCard
        label="Total brands"
        value={stats.totalBrands}
        icon={Building2}
        accent="primary"
        subtext="All submissions"
      />
      <KpiCard
        label="Brand owners"
        value={stats.totalBrandOwners}
        icon={Users}
        accent="accent"
        subtext="Registered accounts"
      />
    </motion.div>
  );
}
