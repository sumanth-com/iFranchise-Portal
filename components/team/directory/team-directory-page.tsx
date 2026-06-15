"use client";

import { ChevronLeft, ChevronRight, MailPlus } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { InviteTeamModal } from "@/components/team/InviteTeamModal";
import { AdminDeleteTransferDialog } from "@/components/admin-command-center/admin-delete-transfer-dialog";
import { AdminPermissionsModal } from "@/components/admin-command-center/admin-permissions-modal";
import { ChangeRoleModal } from "@/components/team/directory/change-role-modal";
import {
  TeamActionMenu,
  type TeamAction,
} from "@/components/team/directory/team-action-menu";
import { TeamDirectoryFilters } from "@/components/team/directory/team-directory-filters";
import { TeamDirectoryStatsBar } from "@/components/team/directory/team-directory-stats";
import { TeamMemberCard } from "@/components/team/directory/team-member-card";
import { TeamProfileDrawer } from "@/components/team/directory/team-profile-drawer";
import { Button } from "@/components/ui/button";
import {
  deleteAdminAccount,
  getAdminPermissionsAction,
  initialAdminManagementState,
  sendAdminPasswordReset,
  setAdminAccountActiveForm,
  updateAdminAccount,
} from "@/lib/admin-management/actions";
import {
  computeTeamStats,
  filterTeamMembers,
  mergeTeamDirectory,
} from "@/lib/team/directory-data";
import { formatRelativeTime } from "@/lib/format-date";
import { useAdminStaffRealtime } from "@/lib/hooks/use-admin-staff-realtime";
import { useSafeRouterRefresh } from "@/lib/navigation/safe-router-refresh";
import type { Profile } from "@/types/auth";
import type { TeamDirectoryMember } from "@/types/team-directory";
import type { TeamMember, TeamInvitation } from "@/types/team";

const PAGE_SIZE = 12;

type TeamDirectoryPageProps = {
  currentProfile: Profile;
  supabaseMembers: TeamMember[];
  pendingInvitations?: TeamInvitation[];
  isSuperAdmin: boolean;
  canInvite: boolean;
};

function memberActivity(member: TeamDirectoryMember) {
  return [
    {
      id: "1",
      label: `Joined as ${member.role}`,
      time: formatRelativeTime(member.joined_at) ?? "—",
    },
    {
      id: "2",
      label:
        member.status === "active"
          ? "Account is active"
          : "Account deactivated",
      time: "—",
    },
    {
      id: "3",
      label: `Last seen on platform`,
      time: member.last_active_at
        ? formatRelativeTime(member.last_active_at) ?? "Recently"
        : "Never",
    },
  ];
}

export function TeamDirectoryPage({
  currentProfile,
  supabaseMembers,
  pendingInvitations = [],
  isSuperAdmin,
  canInvite,
}: TeamDirectoryPageProps) {
  const refresh = useSafeRouterRefresh();
  const [, startTransition] = useTransition();
  useAdminStaffRealtime(isSuperAdmin);

  const [members, setMembers] = useState<TeamDirectoryMember[]>(() =>
    mergeTeamDirectory(supabaseMembers, pendingInvitations),
  );

  useEffect(() => {
    setMembers(mergeTeamDirectory(supabaseMembers, pendingInvitations));
  }, [supabaseMembers, pendingInvitations]);
  const [nameQuery, setNameQuery] = useState("");
  const [emailQuery, setEmailQuery] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);

  const [drawerMember, setDrawerMember] = useState<TeamDirectoryMember | null>(
    null,
  );
  const [menuMember, setMenuMember] = useState<TeamDirectoryMember | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleMember, setRoleMember] = useState<TeamDirectoryMember | null>(null);
  const [removeMember, setRemoveMember] = useState<TeamDirectoryMember | null>(
    null,
  );
  const [permissionsMember, setPermissionsMember] =
    useState<TeamDirectoryMember | null>(null);
  const [permissionRows, setPermissionRows] = useState<
    { permission: string; enabled: boolean }[]
  >([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const transferCandidates = useMemo(
    () =>
      members
        .filter(
          (m) =>
            m.source === "supabase" &&
            !m.is_invitation &&
            m.id !== removeMember?.id,
        )
        .map((m) => ({
          id: m.id,
          label: m.full_name || m.email,
        })),
    [members, removeMember?.id],
  );

  const stats = useMemo(() => computeTeamStats(members), [members]);

  const filtered = useMemo(
    () =>
      filterTeamMembers(members, {
        query: nameQuery,
        emailQuery,
        department,
        status,
        role,
      }),
    [members, nameQuery, emailQuery, department, status, role],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageMembers = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  async function handleProfileSave(member: TeamDirectoryMember) {
    if (member.source === "supabase" && !member.is_invitation && isSuperAdmin) {
      const fd = new FormData();
      fd.set("memberId", member.id);
      fd.set("fullName", member.full_name);
      fd.set("phone", member.phone === "—" ? "" : member.phone);
      fd.set("department", member.department);
      startTransition(async () => {
        const result = await updateAdminAccount(initialAdminManagementState, fd);
        if (result.error) {
          alert(result.error);
          return;
        }
        updateMember(member.id, member);
        refresh();
      });
      return;
    }
    updateMember(member.id, member);
  }

  function updateMember(id: string, patch: Partial<TeamDirectoryMember>) {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
    setDrawerMember((prev) =>
      prev?.id === id ? { ...prev, ...patch } : prev,
    );
  }

  function handleAction(action: TeamAction, member: TeamDirectoryMember) {
    switch (action) {
      case "view":
        setDrawerMember(member);
        break;
      case "edit":
        setDrawerMember(member);
        break;
      case "role":
        setRoleMember(member);
        break;
      case "activate":
        if (member.source === "supabase" && !member.is_invitation) {
          const fd = new FormData();
          fd.set("memberId", member.id);
          fd.set("isActive", "true");
          startTransition(() => {
            void setAdminAccountActiveForm(fd).then(() => refresh());
          });
        }
        break;
      case "deactivate":
        if (member.source === "supabase" && !member.is_invitation) {
          const fd = new FormData();
          fd.set("memberId", member.id);
          fd.set("isActive", "false");
          startTransition(() => {
            void setAdminAccountActiveForm(fd).then(() => refresh());
          });
        }
        break;
      case "reset":
        if (member.source === "supabase" && !member.is_invitation && isSuperAdmin) {
          const fd = new FormData();
          fd.set("memberId", member.id);
          startTransition(async () => {
            const result = await sendAdminPasswordReset(
              initialAdminManagementState,
              fd,
            );
            alert(result.error ?? result.message ?? "Password reset sent.");
          });
        }
        break;
      case "permissions":
        if (member.source === "supabase" && !member.is_invitation && isSuperAdmin) {
          void getAdminPermissionsAction(member.id).then(({ permissions }) => {
            setPermissionRows(permissions);
            setPermissionsMember(member);
          });
        }
        break;
      case "remove":
        if (member.source === "supabase" && !member.is_invitation) {
          setRemoveMember(member);
        }
        break;
    }
  }

  function handleDeleteConfirm(transferToId: string | null) {
    if (!removeMember || removeMember.source !== "supabase") return;
    const fd = new FormData();
    fd.set("memberId", removeMember.id);
    if (transferToId) fd.set("transferToId", transferToId);
    setDeleteLoading(true);
    startTransition(async () => {
      const result = await deleteAdminAccount(initialAdminManagementState, fd);
      setDeleteLoading(false);
      if (!result.error) {
        setRemoveMember(null);
        if (drawerMember?.id === removeMember.id) setDrawerMember(null);
        refresh();
      } else {
        alert(result.error);
      }
    });
  }

  function openMenu(member: TeamDirectoryMember, rect: DOMRect) {
    setMenuMember(member);
    setMenuPos({
      top: rect.bottom + 6,
      left: Math.min(rect.left, window.innerWidth - 220),
    });
  }

  return (
    <div className="w-full space-y-6 pb-10">
      <div className="flex w-full flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
            Organization
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Team Management
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500 sm:text-base">
            Manage your platform team members. View, edit, and control access
            from one full-width directory.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canInvite ? (
            <Button
              type="button"
              onClick={() => setInviteOpen(true)}
            >
              <MailPlus className="h-4 w-4" />
              Invite Admin
            </Button>
          ) : null}
        </div>
      </div>

      <TeamDirectoryStatsBar stats={stats} />

      <TeamDirectoryFilters
        nameQuery={nameQuery}
        emailQuery={emailQuery}
        department={department}
        status={status}
        role={role}
        onNameChange={(v) => {
          setNameQuery(v);
          setPage(1);
        }}
        onEmailChange={(v) => {
          setEmailQuery(v);
          setPage(1);
        }}
        onDepartmentChange={(v) => {
          setDepartment(v);
          setPage(1);
        }}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        onRoleChange={(v) => {
          setRole(v);
          setPage(1);
        }}
      />

      {filtered.length > 0 ? (
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-800">{filtered.length}</span>{" "}
          team member{filtered.length === 1 ? "" : "s"}
        </p>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pageMembers.length === 0 ? (
          <p className="col-span-full py-14 text-center text-sm text-slate-400">
            No team members match your filters.
          </p>
        ) : (
          pageMembers.map((member, index) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              index={index}
              onOpen={setDrawerMember}
              onMenuToggle={openMenu}
              menuOpen={menuMember?.id === member.id}
            />
          ))
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm sm:px-5">
        <p className="text-sm text-slate-500">
          Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
          {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}{" "}
          members
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(0, 5)
            .map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={
                  p === page
                    ? "flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-sm font-semibold text-white"
                    : "flex h-9 w-9 items-center justify-center rounded-lg text-sm text-slate-600 hover:bg-slate-100"
                }
              >
                {p}
              </button>
            ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        </div>
      ) : null}

      <TeamActionMenu
        member={menuMember}
        position={menuPos}
        isSuperAdmin={isSuperAdmin}
        onAction={handleAction}
        onClose={() => {
          setMenuMember(null);
          setMenuPos(null);
        }}
      />

      <TeamProfileDrawer
        member={drawerMember}
        onClose={() => setDrawerMember(null)}
        onSave={handleProfileSave}
        canEdit={Boolean(
          drawerMember?.source === "supabase" &&
            !drawerMember?.is_invitation &&
            isSuperAdmin,
        )}
        activity={drawerMember ? memberActivity(drawerMember) : []}
      />

      {canInvite ? (
        <InviteTeamModal
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          assignableRoles={[]}
        />
      ) : null}

      <ChangeRoleModal
        member={roleMember}
        onClose={() => setRoleMember(null)}
        onSaved={() => refresh()}
      />

      <AdminDeleteTransferDialog
        open={removeMember !== null}
        adminId={removeMember?.id ?? null}
        adminLabel={removeMember?.full_name ?? removeMember?.email ?? ""}
        transferCandidates={transferCandidates}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => setRemoveMember(null)}
      />

      <AdminPermissionsModal
        memberId={permissionsMember?.id ?? null}
        memberLabel={permissionsMember?.full_name ?? permissionsMember?.email ?? ""}
        teamRole={permissionsMember?.team_role ?? null}
        initialPermissions={permissionRows}
        onClose={() => {
          setPermissionsMember(null);
          setPermissionRows([]);
        }}
      />
    </div>
  );
}
