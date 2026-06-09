import { AdminNotifications } from "@/components/admin/admin-notifications";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminBrands, getAdminDashboardStats } from "@/lib/admin/queries";
import { buildAdminNotifications } from "@/lib/notifications/build-admin-notifications";

export default async function AdminNotificationsPage() {
  await requireAdmin();

  const [{ stats }, { brands }] = await Promise.all([
    getAdminDashboardStats(),
    getAdminBrands({ status: "submitted" }),
  ]);

  const notifications = buildAdminNotifications({
    brands,
    brandOwnerCount: stats.totalBrandOwners,
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
          Alerts
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          Notifications
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          New submissions, resubmissions, and brand owner activity.
        </p>
      </div>

      <AdminNotifications notifications={notifications} />
    </div>
  );
}
