"use client";

import { OperationsActivityFeed } from "@/components/admin-command-center/operations-activity-feed";
import { OperationsAdminPanel } from "@/components/admin-command-center/operations-admin-panel";
import { OperationsBrandPerformance } from "@/components/admin-command-center/operations-brand-performance";
import { OperationsLeadIntelligence } from "@/components/admin-command-center/operations-lead-intelligence";
import { OperationsOverview } from "@/components/admin-command-center/operations-overview";
import { OperationsPendingReviews } from "@/components/admin-command-center/operations-pending-reviews";
import type { OperationsDashboardData } from "@/types/admin-operations";

type AdminCommandCenterProps = {
  data: OperationsDashboardData;
  currentUserId: string;
};

export function AdminCommandCenter({
  data,
  currentUserId,
}: AdminCommandCenterProps) {
  if (data.error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        {data.error}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <OperationsOverview kpis={data.kpis} />
      <OperationsActivityFeed items={data.activity} />
      <OperationsPendingReviews brands={data.pendingReviews} />
      <OperationsAdminPanel rows={data.directory} currentUserId={currentUserId} />
      <div className="grid gap-6 xl:grid-cols-2">
        <OperationsLeadIntelligence data={data.leads} />
        <OperationsBrandPerformance data={data.brands} />
      </div>
    </div>
  );
}
