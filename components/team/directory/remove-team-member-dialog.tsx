"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TeamDirectoryMember } from "@/types/team-directory";

type RemoveTeamMemberDialogProps = {
  member: TeamDirectoryMember | null;
  onConfirm: () => void;
  onClose: () => void;
};

export function RemoveTeamMemberDialog({
  member,
  onConfirm,
  onClose,
}: RemoveTeamMemberDialogProps) {
  return (
    <AnimatePresence>
      {member ? (
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
            className="fixed inset-x-4 top-[25%] z-[70] mx-auto max-w-md rounded-2xl border border-white/60 bg-white p-6 shadow-2xl sm:left-1/2 sm:-translate-x-1/2"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Remove team member?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Are you sure you want to remove{" "}
                  <span className="font-medium text-slate-800">
                    {member.full_name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                onClick={onConfirm}
              >
                Remove
              </Button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
