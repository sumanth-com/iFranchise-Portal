"use client";

import { ExecutivePlatformHealth } from "@/components/admin-command-center/executive-platform-health";
import { ExecutivePriorityActions } from "@/components/admin-command-center/executive-priority-actions";
import { ExecutiveSummaryCards } from "@/components/admin-command-center/executive-summary-cards";
import { MarketplaceActivityTimeline } from "@/components/admin-command-center/marketplace-activity-timeline";
import { OperationsOverview } from "@/components/admin-command-center/operations-overview";
import { normalizeOperationsDashboardData } from "@/lib/admin-management/normalize-dashboard-data";
import { useAdminStaffRealtime } from "@/lib/hooks/use-admin-staff-realtime";
import type { OperationsDashboardData } from "@/types/admin-operations";

type AdminCommandCenterProps = {
  data: OperationsDashboardData;
};

export function AdminCommandCenter({ data }: AdminCommandCenterProps) {
  useAdminStaffRealtime();

  const dashboard = normalizeOperationsDashboardData(data);

  if (dashboard.error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        We could not load command center data. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-8">
      <OperationsOverview />

      <ExecutiveSummaryCards summary={dashboard.executiveSummary} />

      <ExecutivePriorityActions />

      <MarketplaceActivityTimeline items={dashboard.activity} />

      <ExecutivePlatformHealth health={dashboard.platformHealth} />
    </div>
  );
}
