"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useActionState, useEffect, useState } from "react";
import { X } from "lucide-react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import {
  initialAdminManagementState,
  updateAdminPermissions,
} from "@/lib/admin-management/actions";
import {
  ADMIN_PERMISSION_KEYS,
  ADMIN_PERMISSION_LABELS,
  defaultPermissionsForTeamRole,
  type AdminPermissionKey,
} from "@/lib/admin-management/permission-keys";

type AdminPermissionsModalProps = {
  memberId: string | null;
  memberLabel: string;
  teamRole: string | null;
  initialPermissions?: { permission: string; enabled: boolean }[];
  onClose: () => void;
};

export function AdminPermissionsModal({
  memberId,
  memberLabel,
  teamRole,
  initialPermissions = [],
  onClose,
}: AdminPermissionsModalProps) {
  const defaults = defaultPermissionsForTeamRole(teamRole ?? "admin");
  const [enabled, setEnabled] = useState<Record<AdminPermissionKey, boolean>>(
    () => {
      const map = { ...defaults };
      for (const row of initialPermissions) {
        if (ADMIN_PERMISSION_KEYS.includes(row.permission as AdminPermissionKey)) {
          map[row.permission as AdminPermissionKey] = row.enabled;
        }
      }
      return map;
    },
  );

  const [state, formAction, pending] = useActionState(
    updateAdminPermissions,
    initialAdminManagementState,
  );

  useEffect(() => {
    if (state.message && !state.error) {
      onClose();
    }
  }, [state.message, state.error, onClose]);

  useEffect(() => {
    if (!memberId) return;
    const map = defaultPermissionsForTeamRole(teamRole ?? "admin");
    for (const row of initialPermissions) {
      if (ADMIN_PERMISSION_KEYS.includes(row.permission as AdminPermissionKey)) {
        map[row.permission as AdminPermissionKey] = row.enabled;
      }
    }
    setEnabled(map);
  }, [memberId, teamRole, initialPermissions]);

  return (
    <AnimatePresence>
      {memberId ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close"
          />
          <motion.div
            className="fixed inset-x-4 top-[12%] z-50 mx-auto max-h-[80vh] max-w-md overflow-y-auto rounded-2xl border bg-white p-6 shadow-xl sm:left-1/2 sm:-translate-x-1/2"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">Admin permissions</h3>
                <p className="mt-1 text-sm text-slate-500">{memberLabel}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={formAction} className="mt-5 space-y-3">
              <input type="hidden" name="memberId" value={memberId} />
              <AuthAlert error={state.error} message={state.message} />

              {ADMIN_PERMISSION_KEYS.map((key) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5"
                >
                  <input
                    type="checkbox"
                    name={`perm_${key}`}
                    checked={enabled[key]}
                    onChange={(e) =>
                      setEnabled((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                    className="mt-0.5 h-4 w-4 rounded border-slate-300"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-800">
                      {ADMIN_PERMISSION_LABELS[key]}
                    </span>
                  </span>
                </label>
              ))}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={onClose}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={pending}>
                  {pending ? "Saving…" : "Save permissions"}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
