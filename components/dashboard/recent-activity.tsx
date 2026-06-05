"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  ImageIcon,
  Send,
  FilePen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/format-date";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string | null;
  icon: LucideIcon;
};

function buildActivity(brand: Brand | null, assets: BrandAssetsBundle): ActivityItem[] {
  const items: ActivityItem[] = [];

  if (!brand) return items;

  items.push({
    id: "updated",
    title: "Profile updated",
    description: `Status: ${brand.status.replace("_", " ")}`,
    time: brand.updated_at,
    icon: FilePen,
  });

  if (assets.logo) {
    items.push({
      id: "logo",
      title: "Logo uploaded",
      description: assets.logo.file_name,
      time: assets.logo.created_at,
      icon: ImageIcon,
    });
  }

  if (brand.submitted_at) {
    items.push({
      id: "submitted",
      title: "Submitted for review",
      description: "Your brand is in the review queue",
      time: brand.submitted_at,
      icon: Send,
    });
  }

  if (brand.status === "approved") {
    items.push({
      id: "approved",
      title: "Brand approved",
      description: "Published to iFranchise website",
      time: brand.reviewed_at,
      icon: CheckCircle2,
    });
  }

  return items.sort((a, b) => {
    if (!a.time || !b.time) return 0;
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });
}

type RecentActivityProps = {
  brand: Brand | null;
  assets: BrandAssetsBundle;
};

export function RecentActivity({ brand, assets }: RecentActivityProps) {
  const activities = buildActivity(brand, assets);

  return (
    <Card>
      <h3 className="text-base font-semibold text-foreground">Recent activity</h3>
      {activities.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={FilePen}
            title="No activity yet"
            description="Your timeline will update as you build and submit your brand."
          />
        </div>
      ) : (
        <motion.ul
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-6 space-y-4"
        >
          {activities.map((item) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={item.id}
                variants={staggerItem}
                className="flex gap-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 border-b border-border pb-4 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.description}</p>
                  {item.time ? (
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateTime(item.time)}
                    </p>
                  ) : null}
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </Card>
  );
}
