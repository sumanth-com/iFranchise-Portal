"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useActionState, useEffect, useRef } from "react";
import { X } from "lucide-react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  initialAdminManagementState,
  inviteAdminAccount,
} from "@/lib/admin-management/actions";
import { ADMIN_INVITE_ROLES } from "@/lib/admin-management/permissions-display";
import { useSafeRouterRefresh } from "@/lib/navigation/safe-router-refresh";
import type { TeamRole } from "@/types/team";

type InviteTeamModalProps = {
  open: boolean;
  onClose: () => void;
  assignableRoles?: TeamRole[];
};

export function InviteTeamModal({
  open,
  onClose,
}: InviteTeamModalProps) {
  const refresh = useSafeRouterRefresh();
  const handledMessageRef = useRef<string | null>(null);
  const [state, formAction, isPending] = useActionState(
    inviteAdminAccount,
    initialAdminManagementState,
  );

  useEffect(() => {
    if (!state.message || state.error) return;
    if (handledMessageRef.current === state.message) return;
    handledMessageRef.current = state.message;
    onClose();
    refresh();
  }, [state.message, state.error, onClose, refresh]);

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
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-h-[85vh] max-w-lg overflow-y-auto rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-md)] sm:inset-x-auto sm:left-1/2 sm:w-full sm:-translate-x-1/2"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Invite administrator
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Creates a real account, sends an email invitation, and adds
                  them to Team Hub instantly.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-500 hover:bg-surface-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={formAction} className="mt-6 space-y-5">
              <AuthAlert error={state.error} message={state.message} />

              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@company.com"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-name">Full name</Label>
                <Input
                  id="invite-name"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Jane Smith"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-phone">Phone (optional)</Label>
                <Input
                  id="invite-phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-role">Access level</Label>
                <select
                  id="invite-role"
                  name="adminRole"
                  required
                  disabled={isPending}
                  defaultValue="admin"
                  className="h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-sm outline-none focus:border-primary-500 focus:shadow-[var(--shadow-focus)]"
                >
                  {ADMIN_INVITE_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">
                  {ADMIN_INVITE_ROLES[0]?.description}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? "Sending…" : "Send invitation"}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
