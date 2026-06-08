"use client";

import { BrandHealthWidget } from "@/components/dashboard/client/brand-health-widget";
import { DashboardActivityFeed } from "@/components/dashboard/client/dashboard/activity-feed";
import {
  DashboardKpiGrid,
  EMPTY_DASHBOARD_KPIS,
  type DashboardKpis,
} from "@/components/dashboard/client/dashboard/kpi-grid";
import { DashboardReviewProgress } from "@/components/dashboard/client/dashboard/review-progress";
import { DashboardBrandBannerSlider } from "@/components/dashboard/client/dashboard/brand-banner-slider";
import { SubmissionTimeline } from "@/components/dashboard/client/submission-timeline";
import type { DashboardActivity } from "@/lib/dashboard/activity-feed";
import { useClientSettings } from "@/lib/settings/use-client-settings";
import { cn } from "@/lib/utils";
import type { BrandHealthSummary } from "@/lib/dashboard/brand-health";
import type { ReviewStage } from "@/lib/dashboard/review-stage";
import type { TimelineEvent } from "@/lib/dashboard/timeline";

const EMPTY_HEALTH: BrandHealthSummary = {
  completion: 0,
  items: [],
};

type PortalDashboardHomeProps = {
  userId: string;
  email: string;
  name?: string | null;
  kpis?: DashboardKpis;
  reviewLabel?: string;
  reviewStages?: ReviewStage[];
  activities?: DashboardActivity[];
  health?: BrandHealthSummary;
  brandName?: string | null;
  timeline?: TimelineEvent[];
  loadError?: string | null;
};

export function PortalDashboardHome({
  userId,
  email,
  name,
  kpis: kpisProp,
  reviewLabel = "Get started with your first listing",
  reviewStages = [],
  activities = [],
  health: healthProp,
  brandName,
  timeline = [],
  loadError,
}: PortalDashboardHomeProps) {
  const kpis = kpisProp ?? EMPTY_DASHBOARD_KPIS;
  const health = healthProp ?? EMPTY_HEALTH;
  const { prefs, ready } = useClientSettings(userId);
  const compact = ready && prefs.compactDashboard;
  const showTimeline = !ready || prefs.showTimeline;

  return (
    <div className={cn("portal-page", compact ? "space-y-4" : "space-y-6")}>
      {loadError ? (
        <p
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      <DashboardBrandBannerSlider />

      <DashboardKpiGrid kpis={kpis} compact={compact} />

      <DashboardReviewProgress stages={reviewStages} statusLabel={reviewLabel} />

      <div
        className={cn(
          "grid gap-6",
          showTimeline ? "lg:grid-cols-5" : "grid-cols-1",
        )}
      >
        <div className={showTimeline ? "lg:col-span-3" : undefined}>
          <BrandHealthWidget health={health} brandName={brandName} />
        </div>
        {showTimeline ? (
          <div className="lg:col-span-2">
            <SubmissionTimeline events={timeline} compact />
          </div>
        ) : null}
      </div>

      <DashboardActivityFeed activities={activities} />
    </div>
  );
}
