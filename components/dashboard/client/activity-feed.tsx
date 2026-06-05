"use client";

import { motion } from "framer-motion";
import {
  FileText,
  ImageIcon,
  MessageSquare,
  RefreshCw,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import { formatDateTime } from "@/lib/format-date";
import type { ActivityFeedItem } from "@/lib/dashboard/activity";

const ICONS: Record<ActivityFeedItem["type"], LucideIcon> = {
  asset: ImageIcon,
  update: RefreshCw,
  document: FileText,
  review: MessageSquare,
  system: Upload,
};

type ActivityFeedProps = {
  items: ActivityFeedItem[];
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <GlassCard padding="lg" className="text-black">
      <h3 className="text-lg font-semibold text-black">Recent Activity</h3>
      <p className="mt-1 text-sm text-black">Latest updates on your brand</p>

      {items.length === 0 ? (
        <p className="mt-6 rounded-xl border border-neutral-300 bg-white px-4 py-8 text-center text-sm text-black">
          No activity yet. Start building your brand profile.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.slice(0, 6).map((item, i) => {
            const Icon = ICONS[item.type];
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex gap-3 rounded-xl border border-neutral-300 bg-white p-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-300 bg-white text-black">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-black">{item.title}</p>
                  <p className="text-sm text-black">{item.description}</p>
                  <p className="mt-1 text-xs text-black">
                    {formatDateTime(item.timestamp)}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}
