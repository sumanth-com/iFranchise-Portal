import { AuthDiagnosticsPanel } from "@/components/admin/auth-diagnostics-panel";
import { getAuthDiagnostics } from "@/lib/auth/diagnostics";
import { requireSuperAdmin } from "@/lib/auth/session";

export default async function AuthDiagnosticsPage() {
  await requireSuperAdmin();
  const diagnostics = await getAuthDiagnostics();

  return <AuthDiagnosticsPanel diagnostics={diagnostics} />;
}
