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
  brand_published: { icon: BadgeCheck, color: "text-purple-600", bg: "bg-purple-100" },
  lead_received: { icon: UserPlus, color: "text-indigo-600", bg: "bg-indigo-100" },
  admin_invited: { icon: Shield, color: "text-violet-600", bg: "bg-violet-100" },
  admin_created: { icon: Shield, color: "text-emerald-600", bg: "bg-emerald-100" },
};

type OperationsActivityFeedProps = {
  items: OperationsActivityItem[];
  className?: string;
};

export function OperationsActivityFeed({
  items,
  className,
}: OperationsActivityFeedProps) {
  return (
    <motion.section
      {...fadeUp}
      className={cn(
        "flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-violet-100/80 bg-white shadow-sm ring-1 ring-violet-50",
        className,
      )}
    >
      <div className="border-b border-violet-100/80 bg-gradient-to-r from-violet-50/60 via-white to-white px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
          Activity
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Recent updates
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Activity will appear as brands, leads, and admins are updated.
          </p>
        ) : (
          <motion.ol
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-0"
          >
            {items.slice(0, 10).map((item, index) => {
              const meta = config[item.type];
              const Icon = meta.icon;
              const row = (
                <motion.li
                  variants={staggerItem}
                  className="relative flex gap-3 pb-5 last:pb-0"
                >
                  {index < Math.min(items.length, 10) - 1 ? (
                    <span className="absolute left-[1.125rem] top-9 h-[calc(100%-0.25rem)] w-px bg-violet-100" />
                  ) : null}
                  <div
                    className={cn(
                      "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
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
                  className="block rounded-lg transition-colors hover:bg-violet-50/50"
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
