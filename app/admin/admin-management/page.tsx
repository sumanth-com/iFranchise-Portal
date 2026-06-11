import { AdminCommandCenter } from "@/components/admin-command-center/admin-command-center";
import { requireSuperAdmin } from "@/lib/auth/session";
import { getOperationsDashboardData } from "@/lib/admin-management/operations-dashboard";

export default async function AdminManagementPage() {
  const profile = await requireSuperAdmin();
  const data = await getOperationsDashboardData();

  return <AdminCommandCenter data={data} currentUserId={profile.id} />;
}
