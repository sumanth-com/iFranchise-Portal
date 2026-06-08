"use client";

import { motion } from "framer-motion";

import { BrandHealthWidget } from "@/components/dashboard/client/brand-health-widget";
import { DashboardActivityFeed } from "@/components/dashboard/client/dashboard/activity-feed";
import {
  DashboardKpiGrid,
  EMPTY_DASHBOARD_KPIS,
  type DashboardKpis,
} from "@/components/dashboard/client/dashboard/kpi-grid";
import { DashboardNotificationsPreview } from "@/components/dashboard/client/dashboard/notifications-preview";
import { DashboardQuickActions } from "@/components/dashboard/client/dashboard/quick-actions";
import { DashboardReviewProgress } from "@/components/dashboard/client/dashboard/review-progress";
import { DashboardWelcomeCard } from "@/components/dashboard/client/dashboard/welcome-card";
import { SubmissionTimeline } from "@/components/dashboard/client/submission-timeline";
import type { DashboardActivity } from "@/lib/dashboard/activity-feed";
import type { BrandHealthSummary } from "@/lib/dashboard/brand-health";
import type { ReviewStage } from "@/lib/dashboard/review-stage";
import type { TimelineEvent } from "@/lib/dashboard/timeline";
import type { PortalNotification } from "@/lib/notifications/types";

const EMPTY_HEALTH: BrandHealthSummary = {
  completion: 0,
  items: [],
};

type PortalDashboardHomeProps = {
  name?: string | null;
  kpis?: DashboardKpis;
  reviewLabel?: string;
  reviewStages?: ReviewStage[];
  activities?: DashboardActivity[];
  notifications?: PortalNotification[];
  health?: BrandHealthSummary;
  brandName?: string | null;
  timeline?: TimelineEvent[];
  loadError?: string | null;
};

const sectionMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
};

export function PortalDashboardHome({
  name,
  kpis: kpisProp,
  reviewLabel = "Get started with your first listing",
  reviewStages = [],
  activities = [],
  notifications = [],
  health: healthProp,
  brandName,
  timeline = [],
  loadError,
}: PortalDashboardHomeProps) {
  const kpis = kpisProp ?? EMPTY_DASHBOARD_KPIS;
  const health = healthProp ?? EMPTY_HEALTH;

  return (
    <div className="portal-page space-y-6">
      {loadError ? (
        <p
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      <motion.div {...sectionMotion}>
        <DashboardWelcomeCard
          name={name}
          brandCount={kpis.totalBrands}
          reviewLabel={reviewLabel}
        />
      </motion.div>

      <motion.div
        {...sectionMotion}
        transition={{ ...sectionMotion.transition, delay: 0.05 }}
      >
        <DashboardKpiGrid kpis={kpis} />
      </motion.div>

      <motion.div
        {...sectionMotion}
        transition={{ ...sectionMotion.transition, delay: 0.1 }}
      >
        <DashboardReviewProgress stages={reviewStages} statusLabel={reviewLabel} />
      </motion.div>

      <motion.div
        className="grid gap-6 lg:grid-cols-5"
        {...sectionMotion}
        transition={{ ...sectionMotion.transition, delay: 0.14 }}
      >
        <div className="lg:col-span-3">
          <BrandHealthWidget health={health} brandName={brandName} />
        </div>
        <div className="lg:col-span-2">
          <SubmissionTimeline events={timeline} compact />
        </div>
      </motion.div>

      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        {...sectionMotion}
        transition={{ ...sectionMotion.transition, delay: 0.18 }}
      >
        <DashboardActivityFeed activities={activities} />
        <DashboardNotificationsPreview
          notifications={notifications}
          totalCount={notifications.length}
        />
      </motion.div>

      <motion.div
        {...sectionMotion}
        transition={{ ...sectionMotion.transition, delay: 0.22 }}
      >
        <DashboardQuickActions />
      </motion.div>
    </div>
  );
}
