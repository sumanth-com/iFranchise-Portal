"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  Shield,
  UserPlus,
  XCircle,
} from "lucide-react";

import { formatFriendlyTimestamp } from "@/lib/format-date";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { OperationsActivityItem } from "@/types/admin-operations";

const config: Record<
  OperationsActivityItem["type"],
  { icon: typeof Building2; color: string; bg: string }
> = {
  brand_submitted: { icon: Building2, color: "text-violet-600", bg: "bg-violet-100" },
  brand_approved: { icon: BadgeCheck, color: "text-emerald-600", bg: "bg-emerald-100" },
  brand_rejected: { icon: XCircle, color: "text-rose-600", bg: "bg-rose-100" },
  brand_published: { icon: BadgeCheck, color: "text-sky-600", bg: "bg-sky-100" },
  lead_received: { icon: UserPlus, color: "text-amber-600", bg: "bg-amber-100" },
  admin_invited: { icon: Shield, color: "text-indigo-600", bg: "bg-indigo-100" },
  admin_created: { icon: Shield, color: "text-emerald-600", bg: "bg-emerald-100" },
};

type OperationsActivityFeedProps = {
  items: OperationsActivityItem[];
};

export function OperationsActivityFeed({ items }: OperationsActivityFeedProps) {
  return (
    <motion.section
      {...fadeUp}
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
          Live Feed
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Recent Activity
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          Activity will appear as brands, leads, and admins are updated.
        </p>
      ) : (
        <motion.ol
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-h-[420px] space-y-0 overflow-y-auto pr-1"
        >
          {items.map((item, index) => {
            const meta = config[item.type];
            const Icon = meta.icon;
            const row = (
              <motion.li
                variants={staggerItem}
                className="relative flex gap-4 pb-5 last:pb-0"
              >
                {index < items.length - 1 ? (
                  <span className="absolute left-5 top-10 h-[calc(100%-0.5rem)] w-px bg-slate-200" />
                ) : null}
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    meta.bg,
                  )}
                >
                  <Icon className={cn("h-4 w-4", meta.color)} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {item.description}
                      </p>
                    </div>
                    <time className="shrink-0 text-[11px] text-slate-400">
                      {formatFriendlyTimestamp(item.timestamp)}
                    </time>
                  </div>
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
    </motion.section>
  );
}
