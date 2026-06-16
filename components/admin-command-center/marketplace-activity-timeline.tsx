"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  Building2,
  UserPlus,
  Users,
} from "lucide-react";

import { formatFriendlyTimestamp } from "@/lib/format-date";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { OperationsActivityItem } from "@/types/admin-operations";

const config: Record<
  OperationsActivityItem["type"],
  { icon: typeof Building2; color: string; bg: string }
> = {
  brand_submitted: {
    icon: Building2,
    color: "text-violet-600",
    bg: "bg-violet-100",
  },
  brand_approved: {
    icon: BadgeCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  brand_rejected: {
    icon: Building2,
    color: "text-slate-500",
    bg: "bg-slate-100",
  },
  brand_published: {
    icon: BadgeCheck,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  lead_received: {
    icon: UserPlus,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  team_member_added: {
    icon: Users,
    color: "text-slate-700",
    bg: "bg-slate-100",
  },
  notification_sent: {
    icon: Bell,
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
};

type MarketplaceActivityTimelineProps = {
  items: OperationsActivityItem[];
  className?: string;
};

export function MarketplaceActivityTimeline({
  items,
  className,
}: MarketplaceActivityTimelineProps) {
  return (
    <motion.section
      {...fadeUp}
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm",
        className,
      )}
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Marketplace activity
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
          Recent momentum
        </h2>
      </div>

      <div className="max-h-[420px] overflow-y-auto p-5">
        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            Activity will appear as brands, leads, and team updates come in.
          </p>
        ) : (
          <motion.ol
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-0"
          >
            {items.slice(0, 12).map((item, index) => {
              const meta = config[item.type];
              const Icon = meta.icon;
              const row = (
                <motion.li
                  variants={staggerItem}
                  className="relative flex gap-3 pb-5 last:pb-0"
                >
                  {index < Math.min(items.length, 12) - 1 ? (
                    <span className="absolute left-[1.125rem] top-9 h-[calc(100%-0.25rem)] w-px bg-slate-100" />
                  ) : null}
                  <div
                    className={cn(
                      "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-white",
                      meta.bg,
                    )}
                  >
                    <Icon className={cn("h-4 w-4", meta.color)} />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {item.description}
                    </p>
                    <time className="mt-1 block text-[10px] text-slate-400">
                      {formatFriendlyTimestamp(item.timestamp)}
                    </time>
                  </div>
                </motion.li>
              );

              return item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block rounded-lg transition-colors hover:bg-slate-50"
                >
                  {row}
                </Link>
              ) : (
                <div key={item.id}>{row}</div>
              );
            })}
          </motion.ol>
        )}
      </div>
    </motion.section>
  );
}
