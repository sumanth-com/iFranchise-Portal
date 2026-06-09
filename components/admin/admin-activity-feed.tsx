"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Globe,
  Pencil,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNotificationTimestamp } from "@/lib/format-date";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { AdminActivityItem } from "@/types/admin";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS: Record<AdminActivityItem["type"], LucideIcon> = {
  brand_submitted: Send,
  brand_updated: Pencil,
  brand_resubmitted: RefreshCw,
  brand_published: Globe,
  brand_approved: CheckCircle2,
  brand_rejected: XCircle,
  changes_requested: Pencil,
};

const ACTIVITY_COLORS: Record<AdminActivityItem["type"], string> = {
  brand_submitted: "bg-amber-100 text-amber-700",
  brand_updated: "bg-slate-100 text-slate-600",
  brand_resubmitted: "bg-blue-100 text-blue-700",
  brand_published: "bg-violet-100 text-violet-700",
  brand_approved: "bg-emerald-100 text-emerald-700",
  brand_rejected: "bg-red-100 text-red-700",
  changes_requested: "bg-orange-100 text-orange-700",
};

type AdminActivityFeedProps = {
  activity: AdminActivityItem[];
  compact?: boolean;
};

export function AdminActivityFeed({ activity, compact = false }: AdminActivityFeedProps) {
  if (activity.length === 0) {
    return (
      <Card padding="lg">
        <h3 className="text-base font-semibold text-foreground">Recent activity</h3>
        <EmptyState
          icon={Activity}
          className="mt-4"
          title="No recent activity"
          description="Brand submissions and review actions will appear here."
        />
      </Card>
    );
  }

  const items = compact ? activity.slice(0, 6) : activity;

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Recent activity</h3>
          <p className="mt-1 text-sm text-slate-500">
            Submissions, updates, and publishing events
          </p>
        </div>
        {compact ? (
          <Link
            href="/admin/reviews"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View queue →
          </Link>
        ) : null}
      </div>

      <motion.ul
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mt-6 divide-y divide-border"
      >
        {items.map((item) => {
          const Icon = ACTIVITY_ICONS[item.type];
          return (
            <motion.li key={item.id} variants={staggerItem}>
              <Link
                href={`/admin/brands/${item.brandId}`}
                className="flex gap-4 py-4 transition-colors hover:bg-slate-50/80 -mx-2 px-2 rounded-lg"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    ACTIVITY_COLORS[item.type],
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-slate-400">
                  {formatNotificationTimestamp(item.timestamp)}
                </time>
              </Link>
            </motion.li>
          );
        })}
      </motion.ul>
    </Card>
  );
}
