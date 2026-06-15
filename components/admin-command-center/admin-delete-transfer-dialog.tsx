"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  getAdminDependenciesAction,
} from "@/lib/admin-management/actions";
import type { AdminDependencies } from "@/lib/admin-management/admin-dependencies";

type TransferCandidate = {
  id: string;
  label: string;
};

type AdminDeleteTransferDialogProps = {
  open: boolean;
  adminId: string | null;
  adminLabel: string;
  transferCandidates: TransferCandidate[];
  loading?: boolean;
  onConfirm: (transferToId: string | null) => void;
  onClose: () => void;
};

export function AdminDeleteTransferDialog({
  open,
  adminId,
  adminLabel,
  transferCandidates,
  loading = false,
  onConfirm,
  onClose,
}: AdminDeleteTransferDialogProps) {
  const [deps, setDeps] = useState<AdminDependencies | null>(null);
  const [checking, setChecking] = useState(false);
  const [transferToId, setTransferToId] = useState("");

  useEffect(() => {
    if (!open || !adminId) {
      setDeps(null);
      setTransferToId("");
      return;
    }

    let cancelled = false;
    setChecking(true);

    void getAdminDependenciesAction(adminId).then((result) => {
      if (cancelled) return;
      setDeps(result);
      setChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [open, adminId]);

  const needsTransfer = Boolean(deps && deps.hasDependencies);
  const canConfirm =
    !checking && (!needsTransfer || transferCandidates.length === 0 || transferToId);

  return (
    <AnimatePresence>
      {open && adminId ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close"
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            className="fixed inset-x-4 top-[20%] z-[70] mx-auto max-w-md rounded-2xl border border-white/60 bg-white p-6 shadow-2xl sm:left-1/2 sm:-translate-x-1/2"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-slate-900">
                  Delete administrator?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Permanently remove{" "}
                  <span className="font-medium text-slate-800">{adminLabel}</span>
                  . This cannot be undone.
                </p>
                {checking ? (
                  <p className="mt-3 text-sm text-slate-400">
                    Checking assigned leads and brands…
                  </p>
                ) : needsTransfer && deps ? (
                  <div className="mt-4 space-y-3 rounded-xl border border-amber-100 bg-amber-50/80 p-3">
                    <p className="text-sm text-amber-900">
                      This admin owns{" "}
                      <span className="font-semibold">{deps.assignedLeads}</span>{" "}
                      lead{deps.assignedLeads === 1 ? "" : "s"} and{" "}
                      <span className="font-semibold">{deps.reviewedBrands}</span>{" "}
                      brand{deps.reviewedBrands === 1 ? "" : "s"}. Transfer
                      ownership before deletion.
                    </p>
                    {transferCandidates.length > 0 ? (
                      <div className="space-y-1.5">
                        <Label htmlFor="transfer-admin">Transfer to</Label>
                        <select
                          id="transfer-admin"
                          value={transferToId}
                          onChange={(e) => setTransferToId(e.target.value)}
                          className="h-11 w-full rounded-xl border border-amber-200 bg-white px-3 text-sm"
                        >
                          <option value="">Select administrator…</option>
                          {transferCandidates.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <p className="text-sm text-rose-700">
                        No other administrators are available for transfer.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                disabled={!canConfirm || loading}
                onClick={() =>
                  onConfirm(needsTransfer ? transferToId || null : null)
                }
              >
                {loading ? "Deleting…" : "Delete account"}
              </Button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
