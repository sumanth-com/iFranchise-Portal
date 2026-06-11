"use client";

import { motion } from "framer-motion";
import { Brain, Minus, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { DashboardInsight } from "@/types/admin-dashboard";

type DashboardInsightsProps = {
  insights: DashboardInsight[];
};

export function DashboardInsights({ insights }: DashboardInsightsProps) {
  return (
    <motion.section {...fadeUp} className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg">
          <Brain className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
            Smart insights
          </p>
          <h2 className="text-lg font-semibold text-slate-900">AI-powered business intelligence</h2>
        </div>
      </div>

      {insights.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Insights will appear soon"
          description="As your platform accumulates brands, leads, and team activity, intelligent summaries will surface here."
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {insights.map((insight) => {
            const TrendIcon =
              insight.trend === "up"
                ? TrendingUp
                : insight.trend === "down"
                  ? TrendingDown
                  : Minus;
            return (
              <motion.div
                key={insight.id}
                variants={staggerItem}
                className="relative overflow-hidden rounded-2xl border border-violet-100/80 bg-gradient-to-br from-violet-50/80 via-white to-white p-5 shadow-sm"
              >
                <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl" />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{insight.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {insight.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                      insight.trend === "up" && "bg-emerald-100 text-emerald-700",
                      insight.trend === "down" && "bg-rose-100 text-rose-700",
                      insight.trend === "neutral" && "bg-slate-100 text-slate-700",
                    )}
                  >
                    <TrendIcon className="h-3.5 w-3.5" />
                    {insight.metric}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.section>
  );
}
