import { Suspense } from "react";

import { AdminNotificationsPage } from "@/components/admin/admin-notifications-page";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminBrands, getAdminDashboardStats } from "@/lib/admin/queries";
import { getAdminManagementActivity } from "@/lib/admin-management/queries";
import { buildAdminNotifications } from "@/lib/notifications/build-admin-notifications";
import { resolveFirstName } from "@/lib/utils";

export default async function AdminNotificationsPageRoute() {
  const profile = await requireAdmin();
  const adminName = resolveFirstName(profile.full_name, profile.email);

  const [{ stats }, { brands }, { logs: teamActivity }] = await Promise.all([
    getAdminDashboardStats(),
    getAdminBrands({ status: "submitted" }),
    getAdminManagementActivity(),
  ]);

  const notifications = buildAdminNotifications({
    brands,
    brandOwnerCount: stats.totalBrandOwners,
    adminName,
    teamActivity: teamActivity.filter((log) => log.action.startsWith("admin.")),
  });

  return (
    <Suspense fallback={null}>
      <AdminNotificationsPage userId={profile.id} notifications={notifications} />
    </Suspense>
  );
}
