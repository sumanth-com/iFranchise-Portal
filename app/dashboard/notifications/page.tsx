import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { DashboardStatusBadge } from "@/components/dashboard/client/dashboard-status-badge";
import { GlassCard } from "@/components/dashboard/client/glass-card";
import { getDashboardContext } from "@/lib/dashboard/context";
import { formatDateTime } from "@/lib/format-date";
import type { Brand, BrandStatus } from "@/types/brand";

type NotificationItem = {
  id: string;
  brandName: string;
  title: string;
  body: string;
  time: string | null;
  icon: LucideIcon;
  status: BrandStatus;
};

function buildNotificationsForBrand(brand: Brand): NotificationItem[] {
  const items: NotificationItem[] = [];
  const base = { brandName: brand.business_name, status: brand.status };

  if (brand.status === "draft") {
    items.push({
      ...base,
      id: `${brand.id}-draft`,
      title: "Complete your brand profile",
      body: "Finish your listing and submit for review to appear on iFranchise.",
      time: brand.updated_at,
      icon: Clock,
    });
  }

  if (brand.status === "submitted") {
    items.push({
      ...base,
      id: `${brand.id}-submitted`,
      title: "Under review",
      body: `${brand.business_name} is in the admin review queue.`,
      time: brand.submitted_at,
      icon: Clock,
    });
  }

  if (brand.status === "changes_requested") {
    items.push({
      ...base,
      id: `${brand.id}-changes`,
      title: "Admin requested changes",
      body: brand.admin_feedback ?? "Please update your profile and resubmit.",
      time: brand.reviewed_at,
      icon: MessageSquare,
    });
  }

  if (brand.status === "approved") {
    items.push({
      ...base,
      id: `${brand.id}-approved`,
      title: "Listing approved",
      body: brand.publish_ready
        ? `${brand.business_name} is publish-ready on the marketplace.`
        : `${brand.business_name} has been approved by iFranchise.`,
      time: brand.reviewed_at,
      icon: CheckCircle2,
    });
  }

  if (brand.status === "rejected") {
    items.push({
      ...base,
      id: `${brand.id}-rejected`,
      title: "Listing rejected",
      body: brand.admin_feedback ?? "Contact support for details.",
      time: brand.reviewed_at,
      icon: XCircle,
    });
  }

  return items;
}

export default async function NotificationsPage() {
  const { brands } = await getDashboardContext();
  const notifications = brands
    .flatMap(buildNotificationsForBrand)
    .sort((a, b) => {
      if (!a.time || !b.time) return 0;
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6D28D9]">
          Inbox
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Notifications
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Updates across all your franchise listings.
        </p>
      </div>

      <GlassCard padding="lg">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <AlertCircle className="h-10 w-10 text-slate-300" />
            <p className="mt-4 font-semibold text-slate-900">No notifications yet</p>
            <p className="mt-1 text-sm text-slate-500">
              You&apos;ll see updates here when you submit brands for review.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5F3FF] text-[#6D28D9]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <DashboardStatusBadge status={item.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{item.brandName}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                      {item.body}
                    </p>
                    {item.time ? (
                      <p className="mt-2 text-xs text-slate-400">
                        {formatDateTime(item.time)}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
