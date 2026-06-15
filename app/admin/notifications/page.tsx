import { Suspense } from "react";

import { AdminNotificationsPage } from "@/components/admin/admin-notifications-page";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminBrands, getAdminDashboardStats } from "@/lib/admin/queries";
import { buildAdminNotifications } from "@/lib/notifications/build-admin-notifications";
import { resolveFirstName } from "@/lib/utils";

export default async function AdminNotificationsPageRoute() {
  const profile = await requireAdmin();
  const adminName = resolveFirstName(profile.full_name, profile.email);

  const [{ stats }, { brands }] = await Promise.all([
    getAdminDashboardStats(),
    getAdminBrands({ status: "submitted" }),
  ]);

  const notifications = buildAdminNotifications({
    brands,
    brandOwnerCount: stats.totalBrandOwners,
    adminName,
  });

  return (
    <Suspense fallback={null}>
      <AdminNotificationsPage userId={profile.id} notifications={notifications} />
    </Suspense>
  );
}
