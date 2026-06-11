"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

import type { TrendPoint } from "@/types/admin-dashboard";

type DashboardSparklineProps = {
  data: TrendPoint[];
  color?: string;
  id: string;
};

export function DashboardSparkline({
  data,
  color = "#6D28D9",
  id,
}: DashboardSparklineProps) {
  if (!data.length || data.every((d) => d.value === 0)) {
    return (
      <div className="flex h-10 items-end gap-0.5 opacity-30">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full bg-slate-300"
            style={{ height: `${20 + (i % 3) * 8}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-${id})`}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
