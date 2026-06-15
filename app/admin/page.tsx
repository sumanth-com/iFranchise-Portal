import { AdminDashboard } from "@/components/admin/dashboard/admin-dashboard";
import { getAdminDashboardAnalytics } from "@/lib/admin/dashboard-analytics";
import { requireAdmin } from "@/lib/auth/session";
import { formatGreeting, formatTodayBanner } from "@/lib/format-date";
import { resolveFirstName } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const profile = await requireAdmin();
  const data = await getAdminDashboardAnalytics();
  const adminName = resolveFirstName(profile.full_name, profile.email);
  const now = new Date();
  const { label: todayLabel, dateTime: todayDateTime } = formatTodayBanner(now);
  const greeting = formatGreeting(now);

  return (
    <AdminDashboard
      data={data}
      adminName={adminName}
      greeting={greeting}
      todayLabel={todayLabel}
      todayDateTime={todayDateTime}
    />
  );
}
