"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  Building2,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/format-date";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { DashboardTimelineItem } from "@/types/admin-dashboard";

type DashboardActivityTimelineProps = {
  items: DashboardTimelineItem[];
  className?: string;
};

const typeConfig: Record<
  DashboardTimelineItem["type"],
  { icon: typeof Building2; color: string; bg: string }
> = {
  brand_submitted: { icon: Building2, color: "text-violet-600", bg: "bg-violet-100" },
  brand_approved: { icon: BadgeCheck, color: "text-emerald-600", bg: "bg-emerald-100" },
  brand_rejected: { icon: Building2, color: "text-rose-600", bg: "bg-rose-100" },
  brand_published: { icon: Bell, color: "text-sky-600", bg: "bg-sky-100" },
  lead_received: { icon: UserPlus, color: "text-amber-600", bg: "bg-amber-100" },
  team_invited: { icon: Users, color: "text-indigo-600", bg: "bg-indigo-100" },
  admin_invited: { icon: Shield, color: "text-slate-700", bg: "bg-slate-100" },
  team_role_updated: { icon: Users, color: "text-violet-600", bg: "bg-violet-100" },
  admin_updated: { icon: Shield, color: "text-slate-600", bg: "bg-slate-100" },
  generic: { icon: Bell, color: "text-slate-600", bg: "bg-slate-100" },
  brand_updated: { icon: Building2, color: "text-slate-600", bg: "bg-slate-100" },
  brand_resubmitted: { icon: Building2, color: "text-violet-600", bg: "bg-violet-100" },
  changes_requested: { icon: Building2, color: "text-amber-600", bg: "bg-amber-100" },
};

function initials(name: string | null, email: string | null): string {
  const source = name ?? email ?? "?";
  const parts = source.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function DashboardActivityTimeline({
  items,
  className,
}: DashboardActivityTimelineProps) {
  return (
    <motion.section
      {...fadeUp}
      className={cn(
        "flex h-full min-h-[280px] flex-col rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 backdrop-blur-xl sm:p-6",
        className,
      )}
    >
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
          Activity
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Recent updates</h2>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No activity yet"
          description="Brand submissions, leads, and team actions will appear here."
        />
      ) : (
        <motion.ol variants={staggerContainer} initial="initial" animate="animate" className="space-y-0">
          {items.map((item, index) => {
            const config = typeConfig[item.type] ?? typeConfig.generic;
            const Icon = config.icon;
            const row = (
              <motion.li
                variants={staggerItem}
                className="relative flex gap-4 pb-6 last:pb-0"
              >
                {index < items.length - 1 ? (
                  <span className="absolute left-5 top-11 h-[calc(100%-1rem)] w-px bg-slate-200" />
                ) : null}
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                    config.bg,
                  )}
                >
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
                    </div>
                    <time className="shrink-0 text-[11px] text-slate-400">
                      {formatDateTime(item.timestamp)}
                    </time>
                  </div>
                  {(item.actorName || item.actorEmail) && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                        {initials(item.actorName, item.actorEmail)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {item.actorName ?? item.actorEmail}
                      </span>
                    </div>
                  )}
                </div>
              </motion.li>
            );

            return item.href ? (
              <Link
                key={item.id}
                href={item.href}
                className="block rounded-xl transition-colors hover:bg-slate-50/80"
              >
                {row}
              </Link>
            ) : (
              <div key={item.id}>{row}</div>
            );
          })}
        </motion.ol>
      )}
    </motion.section>
  );
}
