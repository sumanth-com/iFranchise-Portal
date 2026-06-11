"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { fadeUp } from "@/lib/motion";
import type { BrandPerformance } from "@/types/admin-operations";

type OperationsBrandPerformanceProps = {
  data: BrandPerformance;
};

export function OperationsBrandPerformance({
  data,
}: OperationsBrandPerformanceProps) {
  const counters = [
    { label: "Draft", value: data.draft, color: "text-slate-600" },
    { label: "Approved", value: data.approved, color: "text-violet-600" },
    { label: "Published", value: data.published, color: "text-emerald-600" },
    { label: "Rejected", value: data.rejected, color: "text-rose-600" },
  ];

  return (
    <motion.section
      id="brands"
      {...fadeUp}
      className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
            Brands
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Brand Performance
          </h2>
        </div>
        <Link
          href="/admin/brands"
          className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          All brands
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="grid grid-cols-2 gap-3">
          {counters.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
            >
              <p className="text-xs font-medium text-slate-500">{c.label}</p>
              <p className={`mt-1 text-2xl font-bold tabular-nums ${c.color}`}>
                {c.value}
              </p>
            </div>
          ))}
        </div>

        <div className="h-[200px] rounded-xl border border-slate-100 bg-slate-50/30 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(124,58,237,0.06)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {data.chart.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.section>
  );
}
