"use client";

import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  ClipboardCheck,
  ImageIcon,
  Rocket,
  Send,
  Sparkles,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import { formatDateTime } from "@/lib/format-date";
import type { TimelineEvent } from "@/lib/dashboard/timeline";
import { cn } from "@/lib/utils";

const EVENT_ICONS: Record<string, LucideIcon> = {
  create: Building2,
  assets: ImageIcon,
  submit: Send,
  review: ClipboardCheck,
  changes: Sparkles,
  approved: CheckCircle2,
  rejected: XCircle,
  published: Rocket,
};

function getEventIcon(id: string): LucideIcon {
  return EVENT_ICONS[id] ?? CheckCircle2;
}

type SubmissionTimelineProps = {
  events: TimelineEvent[];
  compact?: boolean;
};

export function SubmissionTimeline({
  events,
  compact = false,
}: SubmissionTimelineProps) {
  return (
    <GlassCard padding="lg" className="h-full">
      <h3 className="text-lg font-semibold text-slate-900">Submission Timeline</h3>
      {!compact ? (
        <p className="mt-1 text-sm text-slate-500">
          Track your brand journey from draft to approval
        </p>
      ) : null}

      <ol className="relative mt-6 space-y-0">
        {events.map((event, i) => {
          const isLast = i === events.length - 1;
          const Icon = getEventIcon(event.id.split("-").pop() ?? event.id);
          const lineDone =
            event.status === "done" ||
            (events[i + 1]?.status === "done" || events[i + 1]?.status === "current");

          return (
            <motion.li
              key={event.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex gap-4 pb-8 last:pb-0"
            >
              {!isLast ? (
                <span
                  className={cn(
                    "absolute left-[19px] top-10 h-[calc(100%-2rem)] w-0.5 rounded-full",
                    lineDone
                      ? "bg-gradient-to-b from-[#6D28D9] to-[#6D28D9]/30"
                      : "bg-slate-200",
                  )}
                />
              ) : null}

              <motion.span
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 shadow-sm transition-colors duration-200",
                  event.status === "done" &&
                    "border-[#6D28D9] bg-gradient-to-br from-[#6D28D9] to-[#5B21B6] text-white shadow-[0_4px_12px_rgba(109,40,217,0.35)]",
                  event.status === "current" &&
                    "border-[#6D28D9] bg-[#F5F3FF] text-[#6D28D9] ring-4 ring-[#6D28D9]/15",
                  event.status === "upcoming" &&
                    "border-slate-200 bg-white text-slate-400",
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </motion.span>

              <div className="min-w-0 flex-1 pt-1">
                <p
                  className={cn(
                    "font-semibold",
                    event.status === "upcoming"
                      ? "text-slate-400"
                      : "text-slate-900",
                  )}
                >
                  {event.title}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">{event.description}</p>
                {event.timestamp ? (
                  <p className="mt-1.5 text-xs font-medium text-slate-400">
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
