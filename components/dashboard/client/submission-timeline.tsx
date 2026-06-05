"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import { formatDateTime } from "@/lib/format-date";
import type { TimelineEvent } from "@/lib/dashboard/timeline";
import { cn } from "@/lib/utils";

type SubmissionTimelineProps = {
  events: TimelineEvent[];
  compact?: boolean;
};

export function SubmissionTimeline({
  events,
  compact = false,
}: SubmissionTimelineProps) {
  return (
    <GlassCard padding="lg" className="text-black">
      <h3 className="text-lg font-semibold text-black">Submission Timeline</h3>
      {!compact ? (
        <p className="mt-1 text-sm text-black">
          Track your brand journey from draft to approval
        </p>
      ) : null}

      <ol className="relative mt-6 space-y-0">
        {events.map((event, i) => {
          const isLast = i === events.length - 1;
          return (
            <motion.li
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative flex gap-4 pb-8 last:pb-0"
            >
              {!isLast ? (
                <span
                  className={cn(
                    "absolute left-[15px] top-8 h-[calc(100%-8px)] w-px",
                    event.status === "done" ? "bg-black" : "bg-neutral-300",
                  )}
                />
              ) : null}

              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                  event.status === "done" && "border-black bg-black text-white",
                  event.status === "current" &&
                    "border-black bg-white text-black",
                  event.status === "upcoming" &&
                    "border-neutral-300 bg-white text-black",
                )}
              >
                {event.status === "done" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-current" />
                )}
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <p className="font-semibold text-black">{event.title}</p>
                <p className="mt-0.5 text-sm text-black">{event.description}</p>
                {event.timestamp ? (
                  <p className="mt-1 text-xs text-black">
                    {formatDateTime(event.timestamp)}
                  </p>
                ) : null}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </GlassCard>
  );
}
