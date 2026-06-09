import { AdminManagementPanel } from "@/components/admin-management/admin-management-panel";
import { requireSuperAdmin } from "@/lib/auth/session";
import {
  getAdminAccounts,
  getAdminInvitations,
  getAdminManagementActivity,
} from "@/lib/admin-management/queries";

export default async function AdminManagementPage() {
  const profile = await requireSuperAdmin();

  const [{ admins }, { invitations }, { logs }] = await Promise.all([
    getAdminAccounts(),
    getAdminInvitations(),
    getAdminManagementActivity(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
          Super Admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          Admin management
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Create admin accounts via secure Supabase invitations. Admins set their
          own passwords — no credentials are stored in application code.
        </p>
      </div>

      <AdminManagementPanel
        admins={admins}
        invitations={invitations}
        logs={logs}
        currentUserId={profile.id}
      />
    </div>
  );
}
