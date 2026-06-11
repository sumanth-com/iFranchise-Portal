"use client";

import { motion } from "framer-motion";
import { MoreHorizontal, Search, UserPlus } from "lucide-react";
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { ConfirmDialog } from "@/components/admin-command-center/confirm-dialog";
import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  dispatchAdminDirectoryAction,
  initialAdminManagementState,
  inviteAdminAccount,
} from "@/lib/admin-management/actions";
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
  | { type: "remove"; row: AdminDirectoryRow }
  | { type: "resend"; row: AdminDirectoryRow }
  | null;

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
  const ref = useRef<HTMLDivElement>(null);
  const isSelf = row.id === currentUserId;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const items = row.isInvitation
    ? [
        { id: "resend", label: "Resend invite" },
        { id: "remove", label: "Revoke invite", danger: true },
      ]
    : [
        { id: "edit", label: "Edit admin" },
        ...(row.is_active
          ? [{ id: "suspend", label: "Suspend", danger: true }]
          : [{ id: "activate", label: "Activate" }]),
        { id: "remove", label: "Remove admin", danger: true, disabled: isSelf },
      ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
        aria-label="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={"disabled" in item && item.disabled}
              onClick={() => {
                setOpen(false);
                onAction(item.id, row);
              }}
              className={cn(
                "flex w-full px-3 py-2 text-left text-sm disabled:opacity-40",
                item.danger
                  ? "text-rose-600 hover:bg-rose-50"
                  : "text-slate-700 hover:bg-slate-50",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function OperationsAdminPanel({
  rows,
  currentUserId,
}: OperationsAdminPanelProps) {
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [editRow, setEditRow] = useState<AdminDirectoryRow | null>(null);
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
    }
  }, [actionState.message, actionState.error]);

  function handleAction(action: string, row: AdminDirectoryRow) {
    if (action === "edit") {
      setEditRow(row);
      return;
    }
    if (action === "suspend") setConfirm({ type: "suspend", row });
    else if (action === "activate") setConfirm({ type: "activate", row });
    else if (action === "remove") setConfirm({ type: "remove", row });
    else if (action === "resend") setConfirm({ type: "resend", row });
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
      case "remove":
        if (row.isInvitation && row.invitationId) {
          fd.set("intent", "remove-invite");
          fd.set("invitationId", row.invitationId);
        } else {
          fd.set("intent", "remove-admin");
          fd.set("memberId", row.id);
        }
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
      className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
          Administration
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Admin Directory
        </h2>

        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5">
          <p className="text-sm font-semibold text-slate-900">Invite administrator</p>
          <form action={inviteAction} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="ops-name">Full name</Label>
              <Input id="ops-name" name="fullName" required placeholder="Jane Smith" disabled={inviting} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ops-email">Email</Label>
              <Input id="ops-email" name="email" type="email" required placeholder="admin@company.com" disabled={inviting} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ops-role">Role</Label>
              <select
                id="ops-role"
                name="adminRole"
                defaultValue="senior_admin"
                disabled={inviting}
                className="h-11 w-full rounded-xl border border-border-strong bg-white px-3 text-sm"
              >
                <option value="admin">Admin</option>
                <option value="senior_admin">Senior Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={inviting} className="w-full">
                <UserPlus className="mr-1.5 h-4 w-4" />
                {inviting ? "Sending..." : "Invite Admin"}
              </Button>
            </div>
          </form>
          <AuthAlert error={inviteState.error} message={inviteState.message} />
        </div>

        <div className="relative mt-4 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search admins..."
            className="pl-10"
          />
        </div>
        <div className="mt-3">
          <AuthAlert error={actionState.error} message={actionState.message} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  No administrators found.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-6 py-3.5 font-medium text-slate-900">
                    {row.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{row.email}</td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">
                      {row.displayRoleLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
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
                  <td className="px-6 py-3.5 text-right">
                    <RowMenu
                      row={row}
                      currentUserId={currentUserId}
                      onAction={handleAction}
                    />
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
              : confirm?.type === "resend"
                ? "Resend invitation?"
                : "Remove admin?"
        }
        description={
          confirm
            ? `${confirm.row.email} — this action takes effect immediately.`
            : ""
        }
        confirmLabel={confirm?.type === "remove" ? "Remove" : "Confirm"}
        variant={
          confirm?.type === "remove" || confirm?.type === "suspend"
            ? "danger"
            : "primary"
        }
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
    </motion.section>
  );
}
