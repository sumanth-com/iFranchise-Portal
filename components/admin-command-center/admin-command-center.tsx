"use client";

import { OperationsActivityFeed } from "@/components/admin-command-center/operations-activity-feed";
import { OperationsAdminPanel } from "@/components/admin-command-center/operations-admin-panel";
import { OperationsAdminStats } from "@/components/admin-command-center/operations-admin-stats";
import { OperationsOverview } from "@/components/admin-command-center/operations-overview";
import { useAdminStaffRealtime } from "@/lib/hooks/use-admin-staff-realtime";
import type { OperationsDashboardData } from "@/types/admin-operations";

type AdminCommandCenterProps = {
  data: OperationsDashboardData;
  currentUserId: string;
};

export function AdminCommandCenter({
  data,
  currentUserId,
}: AdminCommandCenterProps) {
  useAdminStaffRealtime();

  if (data.error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        {data.error}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-8">
      <OperationsOverview />

      <OperationsAdminStats stats={data.adminStats} />

      <OperationsActivityFeed items={data.activity} />

      <OperationsAdminPanel rows={data.directory} currentUserId={currentUserId} />
    </div>
  );
}
