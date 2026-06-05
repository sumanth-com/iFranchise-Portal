"use client";

import { motion } from "framer-motion";

import { DashboardStatusBadge } from "@/components/dashboard/client/dashboard-status-badge";
import { formatDateTime } from "@/lib/format-date";
import type { Brand } from "@/types/brand";

type DashboardHeroProps = {
  name?: string | null;
  brand: Brand | null;
  completion: number;
};

export function DashboardHero({ name, brand, completion }: DashboardHeroProps) {
  const firstName = name?.split(" ")[0] ?? "there";

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="dash-card relative overflow-hidden rounded-3xl border border-neutral-300 bg-white p-6 text-black sm:p-8"
    >

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-medium text-black">Brand Owner Portal</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Welcome back, {firstName}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-black sm:text-base">
            Manage your franchise listing, track submission progress, and preview how
            investors will discover your brand on iFranchise.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:min-w-[220px]">
          <Stat label="Brand" value={brand?.business_name ?? "Not started"} />
          <Stat label="Completion" value={`${completion}%`} />
          <Stat
            label="Last updated"
            value={formatDateTime(brand?.updated_at ?? null) ?? "—"}
          />
          <div className="flex items-center justify-between rounded-xl border border-neutral-300 bg-white px-4 py-3 sm:col-span-2 lg:col-span-1">
            <span className="text-xs font-medium uppercase tracking-wider text-black">
              Status
            </span>
            <DashboardStatusBadge
              status={brand?.status ?? "draft"}
              pulse={brand?.status === "submitted"}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-300 bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-black">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-black">{value}</p>
    </div>
  );
}
