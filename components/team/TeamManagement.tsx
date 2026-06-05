"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MailPlus, MoreHorizontal, Shield } from "lucide-react";

import { ActivityLogList } from "@/components/team/ActivityLogList";
import { EditRoleModal } from "@/components/team/EditRoleModal";
import { InviteTeamModal } from "@/components/team/InviteTeamModal";
import { RoleBadge } from "@/components/team/RoleBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getAssignableRoles } from "@/lib/team/permissions";
import {
  revokeInvitationForm,
  setTeamMemberActiveForm,
} from "@/lib/team/actions";
import { formatDate } from "@/lib/format-date";
import type { Profile } from "@/types/auth";
import type {
  ActivityLog,
  TeamInvitation,
  TeamMember,
  TeamRole,
} from "@/types/team";

type TeamManagementProps = {
  currentProfile: Profile;
  members: TeamMember[];
  invitations: TeamInvitation[];
  logs: ActivityLog[];
  canInvite: boolean;
  canEdit: boolean;
  canDisable: boolean;
};

export function TeamManagement({
  currentProfile,
  members,
  invitations,
  logs,
  canInvite,
  canEdit,
  canDisable,
}: TeamManagementProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const actorRole = currentProfile.team_role as TeamRole;
  const assignableRoles = getAssignableRoles(actorRole);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
            Organization
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Team management
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Invite colleagues, assign roles, and control access across the
            iFranchise portal.
          </p>
        </div>
        {canInvite ? (
          <Button type="button" onClick={() => setInviteOpen(true)}>
            <MailPlus className="h-4 w-4" />
            Invite member
          </Button>
        ) : null}
      </div>

      <Card padding="lg" className="!shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-foreground">Your role</p>
            <div className="mt-1">
              {actorRole ? <RoleBadge role={actorRole} /> : null}
            </div>
          </div>
        </div>
      </Card>

      {invitations.length > 0 ? (
        <Card padding="lg">
          <h3 className="font-semibold text-foreground">Pending invitations</h3>
          <ul className="mt-4 divide-y divide-border">
            {invitations.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-foreground">{inv.email}</p>
                  <p className="text-xs text-slate-500">
                    Invited by {inv.invited_by_name ?? "—"} · expires{" "}
                    {formatDate(inv.expires_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <RoleBadge role={inv.team_role} />
                  {canInvite ? (
                    <form action={revokeInvitationForm}>
                      <input type="hidden" name="invitationId" value={inv.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Revoke
                      </Button>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold text-foreground">
            Team members ({members.length})
          </h3>
        </div>

        {members.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={MailPlus}
              title="No team members"
              description="Invite your first colleague to get started."
              action={
                canInvite ? (
                  <Button type="button" onClick={() => setInviteOpen(true)}>
                    Invite member
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-muted/80 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Member</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((member) => (
                    <TeamRow
                      key={member.id}
                      member={member}
                      currentId={currentProfile.id}
                      canEdit={canEdit}
                      canDisable={canDisable}
                      onEdit={() => setEditMember(member)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 p-4 md:hidden">
              {members.map((member) => (
                <MobileMemberCard
                  key={member.id}
                  member={member}
                  currentId={currentProfile.id}
                  canEdit={canEdit}
                  canDisable={canDisable}
                  onEdit={() => setEditMember(member)}
                />
              ))}
            </div>
          </>
        )}
      </Card>

      <ActivityLogList logs={logs} />

      <InviteTeamModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        assignableRoles={assignableRoles}
      />

      <EditRoleModal
        member={editMember}
        open={Boolean(editMember)}
        onClose={() => setEditMember(null)}
        assignableRoles={assignableRoles}
      />
    </div>
  );
}

function TeamRow({
  member,
  currentId,
  canEdit,
  canDisable,
  onEdit,
}: {
  member: TeamMember;
  currentId: string;
  canEdit: boolean;
  canDisable: boolean;
  onEdit: () => void;
}) {
  const isSelf = member.id === currentId;

  return (
    <tr className="hover:bg-primary-50/30">
      <td className="px-6 py-4">
        <p className="font-medium text-foreground">
          {member.full_name ?? "—"}
        </p>
        <p className="text-xs text-slate-500">{member.email}</p>
      </td>
      <td className="px-6 py-4">
        <RoleBadge role={member.team_role} />
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            member.is_active
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {member.is_active ? "Active" : "Disabled"}
        </span>
      </td>
      <td className="px-6 py-4 text-slate-500">
        {formatDate(member.created_at)}
      </td>
      <td className="px-6 py-4 text-right">
        {!isSelf && (canEdit || canDisable) ? (
          <div className="flex justify-end gap-2">
            {canEdit ? (
              <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
                Edit role
              </Button>
            ) : null}
            {canDisable ? (
              <form action={setTeamMemberActiveForm}>
                <input type="hidden" name="memberId" value={member.id} />
                <input
                  type="hidden"
                  name="isActive"
                  value={member.is_active ? "false" : "true"}
                />
                <Button
                  type="submit"
                  variant={member.is_active ? "danger" : "secondary"}
                  size="sm"
                >
                  {member.is_active ? "Disable" : "Enable"}
                </Button>
              </form>
            ) : null}
          </div>
        ) : (
          <span className="text-xs text-slate-400">You</span>
        )}
      </td>
    </tr>
  );
}

function MobileMemberCard({
  member,
  currentId,
  canEdit,
  canDisable,
  onEdit,
}: {
  member: TeamMember;
  currentId: string;
  canEdit: boolean;
  canDisable: boolean;
  onEdit: () => void;
}) {
  const isSelf = member.id === currentId;

  return (
    <motion.div
      layout
      className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{member.full_name ?? member.email}</p>
          <p className="text-xs text-slate-500">{member.email}</p>
        </div>
        <MoreHorizontal className="h-5 w-5 text-slate-400" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <RoleBadge role={member.team_role} />
        <span className="text-xs text-slate-500">
          {member.is_active ? "Active" : "Disabled"}
        </span>
      </div>
      {!isSelf && (canEdit || canDisable) ? (
        <div className="mt-4 flex gap-2">
          {canEdit ? (
            <Button type="button" variant="secondary" size="sm" onClick={onEdit}>
              Edit
            </Button>
          ) : null}
          {canDisable ? (
            <form action={setTeamMemberActiveForm} className="flex-1">
              <input type="hidden" name="memberId" value={member.id} />
              <input
                type="hidden"
                name="isActive"
                value={member.is_active ? "false" : "true"}
              />
              <Button
                type="submit"
                variant={member.is_active ? "danger" : "secondary"}
                size="sm"
                className="w-full"
              >
                {member.is_active ? "Disable" : "Enable"}
              </Button>
            </form>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );
}
