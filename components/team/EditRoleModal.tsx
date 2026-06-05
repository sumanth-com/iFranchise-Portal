"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useActionState, useEffect } from "react";
import { X } from "lucide-react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { RoleBadge } from "@/components/team/RoleBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateTeamMemberRole } from "@/lib/team/actions";
import { getRoleDescription } from "@/lib/team/permissions";
import {
  TEAM_ROLE_LABELS,
  initialTeamActionState,
  type TeamMember,
  type TeamRole,
} from "@/types/team";

type EditRoleModalProps = {
  member: TeamMember | null;
  open: boolean;
  onClose: () => void;
  assignableRoles: TeamRole[];
};

export function EditRoleModal({
  member,
  open,
  onClose,
  assignableRoles,
}: EditRoleModalProps) {
  const [state, formAction, isPending] = useActionState(
    updateTeamMemberRole,
    initialTeamActionState,
  );

  useEffect(() => {
    if (state.message && !state.error) {
      onClose();
    }
  }, [state.message, state.error, onClose]);

  if (!member) return null;

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close modal"
          />
          <motion.div
            className="fixed inset-x-4 top-[15%] z-50 mx-auto max-w-md rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-md)] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Edit role</h2>
                <p className="mt-1 text-sm text-slate-500">{member.email}</p>
                <div className="mt-2">
                  <RoleBadge role={member.team_role} />
                </div>
              </div>
              <button type="button" onClick={onClose} className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={formAction} className="mt-6 space-y-4">
              <input type="hidden" name="memberId" value={member.id} />
              <AuthAlert error={state.error} message={state.message} />

              <div className="space-y-2">
                <Label htmlFor="edit-role">New role</Label>
                <select
                  id="edit-role"
                  name="teamRole"
                  required
                  disabled={isPending}
                  defaultValue={member.team_role}
                  className="h-11 w-full rounded-xl border border-border-strong px-3 text-sm"
                >
                  {assignableRoles.map((role) => (
                    <option key={role} value={role}>
                      {TEAM_ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">
                  {getRoleDescription(member.team_role)}
                </p>
              </div>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Saving..." : "Update role"}
              </Button>
            </form>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
