"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TEAM_DESIGNATIONS, type TeamDirectoryMember } from "@/types/team-directory";

type ChangeRoleModalProps = {
  member: TeamDirectoryMember | null;
  onClose: () => void;
  onSave: (memberId: string, role: string) => void;
};

export function ChangeRoleModal({
  member,
  onClose,
  onSave,
}: ChangeRoleModalProps) {
  return (
    <AnimatePresence>
      {member ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close"
          />
          <motion.div
            className="fixed inset-x-4 top-[20%] z-[56] mx-auto max-w-sm rounded-2xl border bg-white p-6 shadow-xl sm:left-1/2 sm:-translate-x-1/2"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Change role</h3>
                <p className="mt-1 text-sm text-slate-500">{member.full_name}</p>
              </div>
              <button type="button" onClick={onClose} className="p-1 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const role = new FormData(e.currentTarget).get("role") as string;
                onSave(member.id, role);
                onClose();
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="change-role">Designation</Label>
                <select
                  id="change-role"
                  name="role"
                  defaultValue={member.role}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                >
                  {TEAM_DESIGNATIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full">
                Update role
              </Button>
            </form>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
