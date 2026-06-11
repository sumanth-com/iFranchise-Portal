"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, Crown, MapPin, Star, Users } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/format-date";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";
import type { DashboardPerformance } from "@/types/admin-dashboard";

type DashboardPerformanceSectionProps = {
  performance: DashboardPerformance;
};

function RankBadge({ rank }: { rank: number }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
      {rank}
    </span>
  );
}

export function DashboardPerformanceSection({
  performance,
}: DashboardPerformanceSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
          Performance
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Rankings & high-value signals
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <motion.div
          {...fadeUp}
          className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 backdrop-blur-xl sm:p-6"
        >
          <div className="mb-5 flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900">Top brands</h3>
          </div>
          {performance.topBrands.length === 0 ? (
            <EmptyState icon={Building2} title="No brands ranked yet" description="Published brands with leads will rank here." className="py-8" />
          ) : (
            <motion.ul variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
              {performance.topBrands.map((brand, i) => (
                <motion.li key={brand.id} variants={staggerItem}>
                  <Link
                    href={`/admin/brands/${brand.id}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:bg-violet-50/50"
                  >
                    <RankBadge rank={i + 1} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{brand.name}</p>
                      <p className="text-xs text-slate-500">
                        {brand.industry ?? "Uncategorized"} · {brand.leadCount} leads
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600 ring-1 ring-slate-200">
                      {brand.status}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </motion.div>

        <motion.div
          {...fadeUp}
          className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 backdrop-blur-xl sm:p-6"
        >
          <div className="mb-5 flex items-center gap-2">
            <Users className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-900">Most active team</h3>
          </div>
          {performance.topTeamMembers.length === 0 ? (
            <EmptyState icon={Users} title="No team activity yet" description="Staff actions will appear as your team operates the platform." className="py-8" />
          ) : (
            <motion.ul variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
              {performance.topTeamMembers.map((member, i) => (
                <motion.li
                  key={member.id}
                  variants={staggerItem}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                >
                  <RankBadge rank={i + 1} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.role ?? "staff"}</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-violet-600">
                    {member.actionCount} actions
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </motion.div>

        <motion.div
          {...fadeUp}
          className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 backdrop-blur-xl sm:p-6"
        >
          <div className="mb-5 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Best categories</h3>
          </div>
          {performance.topCategories.length === 0 ? (
            <EmptyState icon={MapPin} title="No category data" description="Industry tags on brands will populate this ranking." className="py-8" />
          ) : (
            <ul className="space-y-2">
              {performance.topCategories.map((cat, i) => (
                <li
                  key={cat.label}
                  className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3 py-2.5"
                >
                  <span className="text-sm text-slate-700">
                    <span className="mr-2 font-bold text-slate-400">{i + 1}.</span>
                    {cat.label}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-slate-900">
                    {cat.value}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        <motion.div
          {...fadeUp}
          className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 backdrop-blur-xl sm:p-6"
        >
          <div className="mb-5 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900">High-value leads</h3>
          </div>
          {performance.highValueLeads.length === 0 ? (
            <EmptyState icon={Star} title="No leads captured" description="Marketplace inquiries will surface here when published brands receive interest." className="py-8" />
          ) : (
            <motion.ul variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
              {performance.highValueLeads.map((lead) => (
                <motion.li
                  key={lead.id}
                  variants={staggerItem}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{lead.name}</p>
                      <p className="text-xs text-slate-500">{lead.brand_name}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      Score {lead.score}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{formatDateTime(lead.created_at)}</p>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </motion.div>
      </div>
    </section>
  );
}
