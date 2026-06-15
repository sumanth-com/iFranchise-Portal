"use client";

import { OperationsActivityFeed } from "@/components/admin-command-center/operations-activity-feed";
import { OperationsAdminPanel } from "@/components/admin-command-center/operations-admin-panel";
import { OperationsOverview } from "@/components/admin-command-center/operations-overview";
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
    <div className="w-full space-y-6 pb-8">
      <OperationsOverview />

      <OperationsActivityFeed items={data.activity} />

      <OperationsAdminPanel rows={data.directory} currentUserId={currentUserId} />
    </div>
  );
}
