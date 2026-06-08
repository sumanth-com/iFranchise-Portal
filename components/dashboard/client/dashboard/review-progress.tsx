"use client";

import { Check, Circle } from "lucide-react";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import type { ReviewStage } from "@/lib/dashboard/review-stage";
import { cn } from "@/lib/utils";

type ReviewProgressProps = {
  stages: ReviewStage[];
  statusLabel: string;
};

export function DashboardReviewProgress({
  stages,
  statusLabel,
}: ReviewProgressProps) {
  return (
    <GlassCard padding="lg">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Review Progress
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">{statusLabel}</p>
        </div>
      </div>

      <ol className="mt-6 flex flex-col gap-0 sm:flex-row sm:items-start sm:justify-between">
        {stages.map((stage, i) => {
          const isLast = i === stages.length - 1;
          return (
            <li
              key={stage.id}
              className={cn(
                "relative flex flex-1 items-start gap-3 pb-6 sm:flex-col sm:items-center sm:pb-0 sm:text-center",
                !isLast &&
                  "sm:after:absolute sm:after:left-[calc(50%+1.25rem)] sm:after:top-4 sm:after:h-px sm:after:w-[calc(100%-2.5rem)] sm:after:bg-slate-200",
              )}
            >
              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                  stage.status === "done" &&
                    "border-[#6D28D9] bg-[#6D28D9] text-white",
                  stage.status === "current" &&
                    "border-[#6D28D9] bg-[#F5F3FF] text-[#6D28D9]",
                  stage.status === "upcoming" &&
                    "border-slate-200 bg-white text-slate-400",
                )}
              >
                {stage.status === "done" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Circle
                    className={cn(
                      "h-3 w-3",
                      stage.status === "current"
                        ? "fill-[#6D28D9] text-[#6D28D9]"
                        : "text-slate-300",
                    )}
                  />
                )}
              </span>
              <div className="min-w-0 sm:mt-2">
                <p
                  className={cn(
                    "text-sm font-medium",
                    stage.status === "current"
                      ? "text-[#6D28D9]"
                      : stage.status === "done"
                        ? "text-slate-900"
                        : "text-slate-400",
                  )}
                >
                  {stage.label}
                </p>
              </div>
              {!isLast ? (
                <span className="absolute left-4 top-8 h-[calc(100%-2rem)] w-px bg-slate-200 sm:hidden" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </GlassCard>
  );
}
