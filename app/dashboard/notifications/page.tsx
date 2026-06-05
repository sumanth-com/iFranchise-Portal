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
  title: string;
  body: string;
  time: string | null;
  icon: LucideIcon;
};

function buildNotifications(brand: Brand | null): NotificationItem[] {
  if (!brand) return [];

  const items: NotificationItem[] = [];

  if (brand.status === "draft") {
    items.push({
      id: "draft",
      title: "Complete your brand profile",
      body: "Finish onboarding and submit for review to appear on iFranchise.",
      time: brand.updated_at,
      icon: Clock,
    });
  }

  if (brand.submitted_at) {
    items.push({
      id: "submitted",
      title: "Submission received",
      body: "Your brand is in the review queue.",
      time: brand.submitted_at,
      icon: Clock,
    });
  }

  if (brand.status === "changes_requested") {
    items.push({
      id: "changes",
      title: "Changes requested",
      body: brand.admin_feedback ?? "Please update your profile and resubmit.",
      time: brand.reviewed_at,
      icon: MessageSquare,
    });
  }

  if (brand.status === "approved") {
    items.push({
      id: "approved",
      title: "Brand approved",
      body: brand.publish_ready
        ? "Your brand is publish-ready."
        : "Your brand has been approved.",
      time: brand.reviewed_at,
      icon: CheckCircle2,
    });
  }

  if (brand.status === "rejected") {
    items.push({
      id: "rejected",
      title: "Submission not approved",
      body: brand.admin_feedback ?? "Contact support for details.",
      time: brand.reviewed_at,
      icon: XCircle,
    });
  }

  return items.sort((a, b) => {
    if (!a.time || !b.time) return 0;
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });
}

export default async function NotificationsPage() {
  const { brand } = await getDashboardContext();
  const notifications = buildNotifications(brand);

  return (
    <div className="space-y-6 text-black">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-black">
          Inbox
        </p>
        <h2 className="mt-2 text-2xl font-bold text-black sm:text-3xl">
          Notifications
        </h2>
        <p className="mt-2 text-sm text-black">
          Updates about your brand submission and review status.
        </p>
      </div>

      {brand ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-black">Current status</span>
          <DashboardStatusBadge status={brand.status as BrandStatus} />
        </div>
      ) : null}

      <GlassCard padding="lg" className="text-black">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <AlertCircle className="h-10 w-10 text-black" />
            <p className="mt-4 font-semibold text-black">No notifications yet</p>
            <p className="mt-1 text-sm text-black">
              You&apos;ll see updates here when you submit your brand.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {notifications.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-300 bg-neutral-100 text-black">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-black">{item.title}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-black">
                      {item.body}
                    </p>
                    {item.time ? (
                      <p className="mt-2 text-xs text-black">
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
