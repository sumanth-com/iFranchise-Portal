"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Flame, Sparkles, UserCheck, Users } from "lucide-react";

import { formatFriendlyTimestamp } from "@/lib/format-date";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { LeadIntelligence } from "@/types/admin-operations";
import { LEAD_STATUS_LABELS } from "@/types/lead";

type OperationsLeadIntelligenceProps = {
  data: LeadIntelligence;
};

const metrics = [
  { key: "newLeads" as const, label: "New Leads", icon: Sparkles, accent: "text-violet-600 bg-violet-500/10" },
  { key: "hotLeads" as const, label: "Hot Leads", icon: Flame, accent: "text-rose-600 bg-rose-500/10" },
  { key: "assignedLeads" as const, label: "Assigned Leads", icon: UserCheck, accent: "text-sky-600 bg-sky-500/10" },
];

export function OperationsLeadIntelligence({ data }: OperationsLeadIntelligenceProps) {
  return (
    <motion.section
      id="leads"
      {...fadeUp}
      className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
            Pipeline
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Lead Intelligence
          </h2>
        </div>
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          All leads
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mb-6 grid gap-4 sm:grid-cols-3"
      >
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.key}
              variants={staggerItem}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">{m.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {data[m.key]}
                  </p>
                </div>
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", m.accent)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Recent Leads
        </p>
        {data.recentLeads.length === 0 ? (
          <p className="text-sm text-slate-400">No leads yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
            {data.recentLeads.map((lead) => (
              <li
                key={lead.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                    <Users className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                    <p className="text-xs text-slate-500">
                      {lead.brand_name} · {lead.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                    {LEAD_STATUS_LABELS[lead.status]}
                  </span>
                  <time className="text-[11px] text-slate-400">
                    {formatFriendlyTimestamp(lead.created_at)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.section>
  );
}
