"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal, Search, UserPlus } from "lucide-react";
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";

import { ConfirmDialog } from "@/components/admin-command-center/confirm-dialog";
import { AdminDeleteTransferDialog } from "@/components/admin-command-center/admin-delete-transfer-dialog";
import { AdminPermissionsModal } from "@/components/admin-command-center/admin-permissions-modal";
import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  dispatchAdminDirectoryAction,
  getAdminPermissionsAction,
  initialAdminManagementState,
  inviteAdminAccount,
} from "@/lib/admin-management/actions";
import {
  ADMIN_INVITE_ROLES,
} from "@/lib/admin-management/permissions-display";
import { formatDate } from "@/lib/format-date";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { AdminDirectoryRow } from "@/types/admin-command-center";

type OperationsAdminPanelProps = {
  rows: AdminDirectoryRow[];
  currentUserId: string;
};

type ConfirmAction =
  | { type: "suspend"; row: AdminDirectoryRow }
  | { type: "activate"; row: AdminDirectoryRow }
  | { type: "resend"; row: AdminDirectoryRow }
  | null;

type MenuItem = {
  id: string;
  label: string;
  danger?: boolean;
  disabled?: boolean;
};

function RowMenu({
  row,
  currentUserId,
  onAction,
}: {
  row: AdminDirectoryRow;
  currentUserId: string;
  onAction: (action: string, row: AdminDirectoryRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isSelf = row.id === currentUserId;

  const items: MenuItem[] = row.isInvitation
    ? [
        { id: "resend", label: "Resend invite" },
        { id: "remove", label: "Revoke invite", danger: true },
      ]
    : [
        { id: "edit", label: "Edit admin" },
        { id: "permissions", label: "Permissions" },
        { id: "reset", label: "Reset password" },
        ...(row.is_active
          ? [{ id: "suspend", label: "Suspend", danger: true }]
          : [{ id: "activate", label: "Activate" }]),
        { id: "remove", label: "Delete account", danger: true, disabled: isSelf },
      ];

  function closeMenu() {
    setOpen(false);
    setPosition(null);
  }

  function openMenu() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const menuWidth = 192;
    const menuHeight = items.length * 40 + 8;
    const gap = 6;
    const padding = 8;

    let top = rect.bottom + gap;
    if (top + menuHeight > window.innerHeight - padding) {
      top = Math.max(padding, rect.top - menuHeight - gap);
    }

    const left = Math.min(
      Math.max(padding, rect.right - menuWidth),
      window.innerWidth - menuWidth - padding,
    );

    setPosition({ top, left });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      closeMenu();
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }

    function handleScroll() {
      closeMenu();
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  const menu =
    open && position
      ? createPortal(
          <AnimatePresence>
            <motion.div
              ref={menuRef}
              role="menu"
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{ top: position.top, left: position.left }}
              className="fixed z-[100] w-48 overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1 shadow-xl ring-1 ring-slate-900/5"
            >
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    closeMenu();
                    onAction(item.id, row);
                  }}
                  className={cn(
                    "flex w-full px-3.5 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                    item.danger
                      ? "text-rose-600 hover:bg-rose-50"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? closeMenu() : openMenu())}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-lg border text-slate-600 transition-colors hover:bg-slate-50",
          open
            ? "border-violet-200 bg-violet-50 text-violet-700"
            : "border-slate-200",
        )}
        aria-label="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {menu}
    </>
  );
}

export function OperationsAdminPanel({
  rows,
  currentUserId,
}: OperationsAdminPanelProps) {
  const [search, setSearch] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "super_admin">("admin");
  const inviteRoleHelp =
    ADMIN_INVITE_ROLES.find((role) => role.value === inviteRole)?.description ??
    "";
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [deleteRow, setDeleteRow] = useState<AdminDirectoryRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editRow, setEditRow] = useState<AdminDirectoryRow | null>(null);
  const [permissionsRow, setPermissionsRow] = useState<AdminDirectoryRow | null>(
    null,
  );
  const [permissionRows, setPermissionRows] = useState<
    { permission: string; enabled: boolean }[]
  >([]);
  const [isPending, startTransition] = useTransition();

  const [inviteState, inviteAction, inviting] = useActionState(
    inviteAdminAccount,
    initialAdminManagementState,
  );
  const [actionState, runAction, actionLoading] = useActionState(
    dispatchAdminDirectoryAction,
    initialAdminManagementState,
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.email.toLowerCase().includes(q) ||
        (r.full_name?.toLowerCase().includes(q) ?? false),
    );
  }, [rows, search]);

  useEffect(() => {
    if (actionState.message && !actionState.error) {
      setConfirm(null);
      setEditRow(null);
      setDeleteRow(null);
      setDeleteLoading(false);
    }
    if (actionState.error) {
      setDeleteLoading(false);
    }
  }, [actionState.message, actionState.error]);

  const transferCandidates = useMemo(
    () =>
      rows
        .filter((r) => !r.isInvitation && r.id !== deleteRow?.id)
        .map((r) => ({
          id: r.id,
          label: r.full_name ?? r.email,
        })),
    [rows, deleteRow?.id],
  );

  function handleAction(action: string, row: AdminDirectoryRow) {
    if (action === "edit") {
      setEditRow(row);
      return;
    }
    if (action === "permissions" && !row.isInvitation) {
      void getAdminPermissionsAction(row.id).then(({ permissions }) => {
        setPermissionRows(permissions);
        setPermissionsRow(row);
      });
      return;
    }
    if (action === "reset" && !row.isInvitation) {
      const fd = new FormData();
      fd.set("intent", "reset");
      fd.set("memberId", row.id);
      startTransition(() => runAction(fd));
      return;
    }
    if (action === "suspend") setConfirm({ type: "suspend", row });
    else if (action === "activate") setConfirm({ type: "activate", row });
    else if (action === "remove") {
      if (row.isInvitation) {
        const fd = new FormData();
        fd.set("intent", "remove-invite");
        fd.set("invitationId", row.invitationId ?? "");
        startTransition(() => runAction(fd));
      } else {
        setDeleteRow(row);
      }
    } else if (action === "resend") setConfirm({ type: "resend", row });
  }

  function executeDelete(transferToId: string | null) {
    if (!deleteRow) return;
    const fd = new FormData();
    fd.set("intent", "delete");
    fd.set("memberId", deleteRow.id);
    if (transferToId) fd.set("transferToId", transferToId);
    setDeleteLoading(true);
    startTransition(() => {
      runAction(fd);
    });
  }

  function executeConfirm() {
    if (!confirm) return;
    const fd = new FormData();
    const { row } = confirm;
    switch (confirm.type) {
      case "suspend":
        fd.set("intent", "suspend");
        fd.set("memberId", row.id);
        fd.set("isActive", "false");
        break;
      case "activate":
        fd.set("intent", "activate");
        fd.set("memberId", row.id);
        fd.set("isActive", "true");
        break;
      case "resend":
        fd.set("intent", "resend");
        fd.set("invitationId", row.invitationId ?? "");
        break;
    }
    startTransition(() => runAction(fd));
  }

  return (
    <motion.section
      id="admins"
      {...fadeUp}
      className="scroll-mt-20 w-full rounded-2xl border border-violet-100/80 bg-white shadow-sm ring-1 ring-violet-50"
    >
      <div className="border-b border-violet-100/80 bg-gradient-to-r from-violet-50/80 via-white to-purple-50/40 p-6 sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
          Team
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Admin directory
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Invite <span className="font-medium text-slate-700">Admins</span> for
          your team.{" "}
          <span className="font-medium text-slate-700">Super Admin</span> is the
          platform owner role — keep that for yourself only.
        </p>

        <div className="mt-5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-semibold text-slate-900">
            Invite team member
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Most invites should be <span className="font-medium">Admin</span> —
            they join as team members with day-to-day access.
          </p>
          <form action={inviteAction} className="mt-4 space-y-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-12 xl:items-end">
              <div className="space-y-1.5 xl:col-span-3">
                <Label htmlFor="ops-name">Full name</Label>
                <Input
                  id="ops-name"
                  name="fullName"
                  required
                  placeholder="Jane Smith"
                  disabled={inviting}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5 xl:col-span-3">
                <Label htmlFor="ops-email">Email</Label>
                <Input
                  id="ops-email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@company.com"
                  disabled={inviting}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5 xl:col-span-3">
                <Label htmlFor="ops-role">Access level</Label>
                <select
                  id="ops-role"
                  name="adminRole"
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "admin" | "super_admin")
                  }
                  disabled={inviting}
                  className="h-11 w-full rounded-xl border border-border-strong bg-white px-3 text-sm outline-none focus:border-primary-500 focus:shadow-[var(--shadow-focus)]"
                >
                  {ADMIN_INVITE_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 xl:col-span-3">
                <Button
                  type="submit"
                  disabled={inviting}
                  className="h-11 w-full"
                >
                  <UserPlus className="mr-1.5 h-4 w-4 shrink-0" />
                  {inviting ? "Sending…" : "Send invite"}
                </Button>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              {inviteRoleHelp}
            </p>
            <AuthAlert error={inviteState.error} message={inviteState.message} />
          </form>
        </div>

        <div className="mt-5 space-y-3">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search admins…"
              className="h-11 pl-10"
            />
          </div>
          <AuthAlert error={actionState.error} message={actionState.message} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3.5 sm:px-8">Name</th>
              <th className="px-4 py-3.5">Email</th>
              <th className="px-4 py-3.5">Role</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Created</th>
              <th className="px-6 py-3.5 text-right sm:px-8">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-16 text-center sm:px-8"
                >
                  <p className="text-sm font-medium text-slate-500">
                    No administrators found
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Invite your first admin using the form above.
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-50 transition-colors hover:bg-slate-50/60"
                >
                  <td className="px-6 py-3.5 font-medium text-slate-900 sm:px-8">
                    {row.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{row.email}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                      {row.displayRoleLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        row.status === "active" && "bg-emerald-50 text-emerald-700",
                        row.status === "pending" && "bg-amber-50 text-amber-700",
                        row.status === "suspended" && "bg-rose-50 text-rose-700",
                      )}
                    >
                      {row.status === "active"
                        ? "Active"
                        : row.status === "pending"
                          ? "Pending"
                          : "Suspended"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">
                    {formatDate(row.created_at) ?? "—"}
                  </td>
                  <td className="relative px-6 py-3.5 text-right sm:px-8">
                    <div className="flex justify-end">
                      <RowMenu
                        row={row}
                        currentUserId={currentUserId}
                        onAction={handleAction}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm?.type === "suspend"
            ? "Suspend admin?"
            : confirm?.type === "activate"
              ? "Activate admin?"
              : "Resend invitation?"
        }
        description={
          confirm
            ? `${confirm.row.email} — this action takes effect immediately.`
            : ""
        }
        confirmLabel="Confirm"
        variant={confirm?.type === "suspend" ? "danger" : "primary"}
        loading={actionLoading || isPending}
        onConfirm={executeConfirm}
        onClose={() => setConfirm(null)}
      />

      {editRow && !editRow.isInvitation ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setEditRow(null)}
            aria-label="Close"
          />
          <div className="fixed inset-x-4 top-[20%] z-50 mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-xl sm:left-1/2 sm:-translate-x-1/2">
            <h3 className="font-semibold">Edit administrator</h3>
            <p className="mt-1 text-sm text-slate-500">{editRow.email}</p>
            <form action={runAction} className="mt-4 space-y-4">
              <input type="hidden" name="intent" value="edit" />
              <input type="hidden" name="memberId" value={editRow.id} />
              <div className="space-y-1.5">
                <Label htmlFor="edit-fullName">Full name</Label>
                <Input
                  id="edit-fullName"
                  name="fullName"
                  defaultValue={editRow.full_name ?? ""}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditRow(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={actionLoading}>
                  Save
                </Button>
              </div>
            </form>
          </div>
        </>
      ) : null}

      <AdminDeleteTransferDialog
        open={deleteRow !== null}
        adminId={deleteRow?.id ?? null}
        adminLabel={deleteRow?.full_name ?? deleteRow?.email ?? ""}
        transferCandidates={transferCandidates}
        loading={deleteLoading || actionLoading}
        onConfirm={executeDelete}
        onClose={() => setDeleteRow(null)}
      />

      <AdminPermissionsModal
        memberId={permissionsRow?.id ?? null}
        memberLabel={permissionsRow?.full_name ?? permissionsRow?.email ?? ""}
        teamRole={permissionsRow?.teamRole ?? null}
        initialPermissions={permissionRows}
        onClose={() => {
          setPermissionsRow(null);
          setPermissionRows([]);
        }}
      />
    </motion.section>
  );
}
