"use client";

import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

import { KpiCard } from "@/components/ui/kpi-card";
import { staggerContainer } from "@/lib/motion";
import type { AdminBrandListItem } from "@/types/admin";

type AdminKpisProps = {
  brands: AdminBrandListItem[];
};

export function AdminKpis({ brands }: AdminKpisProps) {
  const total = brands.length;
  const pending = brands.filter((b) => b.status === "submitted").length;
  const approved = brands.filter((b) => b.status === "approved").length;
  const rejected = brands.filter((b) => b.status === "rejected").length;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <KpiCard
        label="Total brands"
        value={total}
        icon={Building2}
        accent="primary"
        subtext="All submissions"
      />
      <KpiCard
        label="Pending reviews"
        value={pending}
        icon={Clock}
        accent="warning"
        subtext={pending > 0 ? "Action required" : "Queue clear"}
      />
      <KpiCard
        label="Approved brands"
        value={approved}
        icon={CheckCircle2}
        accent="success"
        subtext="Live on website"
      />
      <KpiCard
        label="Rejected brands"
        value={rejected}
        icon={XCircle}
        accent="accent"
      />
    </motion.div>
  );
}
