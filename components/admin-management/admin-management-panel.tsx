"use client";

import { useActionState } from "react";
import { KeyRound, Shield, UserPlus, UserX } from "lucide-react";

import { ActivityLogList } from "@/components/team/ActivityLogList";
import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  initialAdminManagementState,
  inviteAdminAccount,
  revokeAdminInvitationForm,
  sendAdminPasswordReset,
  setAdminAccountActiveForm,
  updateAdminAccount,
} from "@/lib/admin-management/actions";
import type {
  AdminAccount,
  AdminInvitation,
} from "@/lib/admin-management/queries";
import { formatDateTime } from "@/lib/format-date";
import type { ActivityLog } from "@/types/team";

type AdminManagementPanelProps = {
  admins: AdminAccount[];
  invitations: AdminInvitation[];
  logs: ActivityLog[];
  currentUserId: string;
};

export function AdminManagementPanel({
  admins,
  invitations,
  logs,
  currentUserId,
}: AdminManagementPanelProps) {
  const [inviteState, inviteAction, inviting] = useActionState(
    inviteAdminAccount,
    initialAdminManagementState,
  );
  const [updateState, updateAction] = useActionState(
    updateAdminAccount,
    initialAdminManagementState,
  );
  const [resetState, resetAction, resetting] = useActionState(
    sendAdminPasswordReset,
    initialAdminManagementState,
  );

  const alertError =
    inviteState.error ?? updateState.error ?? resetState.error;
  const alertMessage =
    inviteState.message ?? updateState.message ?? resetState.message;

  const regularAdmins = admins.filter((a) => a.role === "admin");

  return (
    <div className="space-y-8">
      <div aria-live="polite">
        <AuthAlert error={alertError} message={alertMessage} />
      </div>

      <Card padding="lg">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <UserPlus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Create admin</h2>
            <p className="mt-1 text-sm text-slate-500">
              Send a Supabase invitation. The admin sets their own password via email.
            </p>
          </div>
        </div>
        <form action={inviteAction} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              required
              disabled={inviting}
              placeholder="admin@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-name">Full name (optional)</Label>
            <Input id="invite-name" name="fullName" disabled={inviting} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={inviting}>
              {inviting ? "Sending invitation..." : "Send admin invitation"}
            </Button>
          </div>
        </form>
      </Card>

      {invitations.length > 0 ? (
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-foreground">Pending invitations</h2>
          <ul className="mt-4 divide-y divide-border">
            {invitations.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{inv.email}</p>
                  <p className="text-xs text-slate-500">
                    Expires {formatDateTime(inv.expires_at)}
                  </p>
                </div>
                <form action={revokeAdminInvitationForm}>
                  <input type="hidden" name="invitationId" value={inv.id} />
                  <Button type="submit" variant="secondary" size="sm">
                    Revoke
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card padding="lg">
        <h2 className="text-lg font-semibold text-foreground">Admin accounts</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">Admin</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {regularAdmins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-3 py-3">
                    <p className="font-medium">{admin.full_name ?? "—"}</p>
                    <p className="text-xs text-slate-500">{admin.email}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        admin.is_active
                          ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                          : "rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700"
                      }
                    >
                      {admin.is_active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-500">
                    {formatDateTime(admin.created_at)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <form action={updateAction} className="flex items-center gap-2">
                        <input type="hidden" name="memberId" value={admin.id} />
                        <Input
                          name="fullName"
                          defaultValue={admin.full_name ?? ""}
                          className="h-8 w-36 text-xs"
                          placeholder="Name"
                        />
                        <Button type="submit" variant="secondary" size="sm">
                          Save
                        </Button>
                      </form>
                      <form action={setAdminAccountActiveForm}>
                        <input type="hidden" name="memberId" value={admin.id} />
                        <input
                          type="hidden"
                          name="isActive"
                          value={admin.is_active ? "false" : "true"}
                        />
                        <Button
                          type="submit"
                          variant="secondary"
                          size="sm"
                          className="gap-1"
                        >
                          {admin.is_active ? (
                            <>
                              <UserX className="h-3.5 w-3.5" />
                              Deactivate
                            </>
                          ) : (
                            "Re-enable"
                          )}
                        </Button>
                      </form>
                      <form action={resetAction}>
                        <input type="hidden" name="memberId" value={admin.id} />
                        <Button
                          type="submit"
                          variant="secondary"
                          size="sm"
                          disabled={resetting}
                          className="gap-1"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          Reset password
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padding="lg">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-foreground">Super admins</h2>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {admins
            .filter((a) => a.role === "super_admin")
            .map((sa) => (
              <li
                key={sa.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    {sa.full_name ?? sa.email}
                    {sa.id === currentUserId ? " (you)" : ""}
                  </p>
                  <p className="text-xs text-slate-500">{sa.email}</p>
                </div>
                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                  Super Admin
                </span>
              </li>
            ))}
        </ul>
      </Card>

      <Card padding="lg">
        <h2 className="text-lg font-semibold text-foreground">Admin activity</h2>
        <div className="mt-4">
          <ActivityLogList logs={logs} />
        </div>
      </Card>
    </div>
  );
}
