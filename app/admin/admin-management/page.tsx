import { AdminCommandCenter } from "@/components/admin-command-center/admin-command-center";
import { requireSuperAdmin } from "@/lib/auth/session";
import { getOperationsDashboardData } from "@/lib/admin-management/operations-dashboard";
import { normalizeOperationsDashboardData } from "@/lib/admin-management/normalize-dashboard-data";

export default async function AdminManagementPage() {
  await requireSuperAdmin();
  const data = normalizeOperationsDashboardData(await getOperationsDashboardData());

  return <AdminCommandCenter data={data} />;
}
