"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MailPlus, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { InviteTeamModal } from "@/components/team/InviteTeamModal";
import { AddTeamMemberModal } from "@/components/team/directory/add-team-member-modal";
import { ChangeRoleModal } from "@/components/team/directory/change-role-modal";
import { RemoveTeamMemberDialog } from "@/components/team/directory/remove-team-member-dialog";
import {
  TeamActionMenu,
  type TeamAction,
} from "@/components/team/directory/team-action-menu";
import { TeamDirectoryFilters } from "@/components/team/directory/team-directory-filters";
import { TeamDirectoryStatsBar } from "@/components/team/directory/team-directory-stats";
import { TeamMemberCard } from "@/components/team/directory/team-member-card";
import { TeamProfileDrawer } from "@/components/team/directory/team-profile-drawer";
import { Button } from "@/components/ui/button";
import { getAssignableRoles } from "@/lib/team/permissions";
import {
  computeTeamStats,
  filterTeamMembers,
  mergeTeamDirectory,
} from "@/lib/team/directory-data";
import { formatRelativeTime } from "@/lib/format-date";
import { staggerContainer } from "@/lib/motion";
import { setTeamMemberActiveForm } from "@/lib/team/actions";
import type { Profile } from "@/types/auth";
import type { TeamDirectoryMember } from "@/types/team-directory";
import type { TeamMember, TeamRole } from "@/types/team";

const PAGE_SIZE = 12;

type TeamDirectoryPageProps = {
  currentProfile: Profile;
  supabaseMembers: TeamMember[];
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
  isSuperAdmin,
  canInvite,
}: TeamDirectoryPageProps) {
  const [members, setMembers] = useState<TeamDirectoryMember[]>(() =>
    mergeTeamDirectory(supabaseMembers),
  );
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
  const [addOpen, setAddOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleMember, setRoleMember] = useState<TeamDirectoryMember | null>(null);
  const [removeMember, setRemoveMember] = useState<TeamDirectoryMember | null>(
    null,
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

  const assignableRoles = getAssignableRoles(
    currentProfile.team_role as TeamRole,
  );

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
        updateMember(member.id, {
          status: "active",
          last_active_at: new Date().toISOString(),
        });
        if (member.source === "supabase") {
          const fd = new FormData();
          fd.set("memberId", member.id);
          fd.set("isActive", "true");
          void setTeamMemberActiveForm(fd);
        }
        break;
      case "deactivate":
        updateMember(member.id, { status: "inactive" });
        if (member.source === "supabase") {
          const fd = new FormData();
          fd.set("memberId", member.id);
          fd.set("isActive", "false");
          void setTeamMemberActiveForm(fd);
        }
        break;
      case "remove":
        setRemoveMember(member);
        break;
    }
  }

  function handleAdd(
    data: Omit<TeamDirectoryMember, "id" | "source">,
  ) {
    const id = `local-${Date.now()}`;
    setMembers((prev) => [{ ...data, id, source: "dummy" }, ...prev]);
    setPage(1);
  }

  function handleRemove() {
    if (!removeMember) return;
    setMembers((prev) => prev.filter((m) => m.id !== removeMember.id));
    if (drawerMember?.id === removeMember.id) setDrawerMember(null);
    setRemoveMember(null);
  }

  function openMenu(member: TeamDirectoryMember, rect: DOMRect) {
    setMenuMember(member);
    setMenuPos({
      top: rect.bottom + 6,
      left: Math.min(rect.left, window.innerWidth - 220),
    });
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
            Organization
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Team Management
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage your platform team members. View, edit, and control access
            from one directory.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canInvite ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setInviteOpen(true)}
            >
              <MailPlus className="h-4 w-4" />
              Invite Member
            </Button>
          ) : null}
          <Button type="button" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Team Member
          </Button>
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

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {pageMembers.map((member) => (
          <div key={member.id} className="h-full">
            <TeamMemberCard
              member={member}
              onOpen={setDrawerMember}
              onMenuToggle={openMenu}
              menuOpen={menuMember?.id === member.id}
            />
          </div>
        ))}
      </motion.div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          No team members match your filters.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
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
        onSave={(m) => updateMember(m.id, m)}
        activity={drawerMember ? memberActivity(drawerMember) : []}
      />

      <AddTeamMemberModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />

      {canInvite ? (
        <InviteTeamModal
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          assignableRoles={assignableRoles}
        />
      ) : null}

      <ChangeRoleModal
        member={roleMember}
        onClose={() => setRoleMember(null)}
        onSave={(id, newRole) => updateMember(id, { role: newRole })}
      />

      <RemoveTeamMemberDialog
        member={removeMember}
        onConfirm={handleRemove}
        onClose={() => setRemoveMember(null)}
      />
    </div>
  );
}
