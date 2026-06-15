import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminBrands, getAdminDashboardStats } from "@/lib/admin/queries";
import { getAdminManagementActivity } from "@/lib/admin-management/queries";
import { buildAdminNotifications } from "@/lib/notifications/build-admin-notifications";
import { isSuperAdminProfile } from "@/lib/auth/staff";
import { canManageTeam } from "@/lib/team/permissions";
import { adminNavGroups } from "@/lib/nav-config";
import type { TeamRole } from "@/types/team";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireAdmin();
  const teamRole = profile.team_role as TeamRole | null;

  const [{ stats }, { brands }, { logs: teamActivity }] = await Promise.all([
    getAdminDashboardStats(),
    getAdminBrands({ status: "submitted" }),
    getAdminManagementActivity(),
  ]);

  const notifications = buildAdminNotifications({
    brands,
    brandOwnerCount: stats.totalBrandOwners,
    teamActivity: teamActivity.filter((log) =>
      log.action.startsWith("admin."),
    ),
  });

  const notificationPreviews = notifications.map(
    ({ id, title, description, time, category }) => ({
      id,
      title,
      description,
      time,
      category,
    }),
  );

  const navGroups = adminNavGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.href === "/admin/admin-management") {
        return isSuperAdminProfile(profile);
      }
      if (item.href === "/admin/team") {
        return canManageTeam(teamRole, profile.role);
      }
      return true;
    }),
  }));

  return (
    <AdminShell
      userId={profile.id}
      email={profile.email}
      name={profile.full_name}
      navGroups={navGroups}
      notifications={notificationPreviews}
    >
      {children}
    </AdminShell>
  );
}
