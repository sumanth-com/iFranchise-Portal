"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  Clock,
  Mail,
  Pencil,
  Phone,
  X,
} from "lucide-react";
import { useState } from "react";

import { TeamMemberAvatar } from "@/components/team/directory/team-member-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatRelativeTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import {
  TEAM_DEPARTMENTS,
  TEAM_DESIGNATIONS,
  type TeamDirectoryMember,
} from "@/types/team-directory";

type TeamProfileDrawerProps = {
  member: TeamDirectoryMember | null;
  onClose: () => void;
  onSave: (member: TeamDirectoryMember) => void;
  activity: { id: string; label: string; time: string }[];
};

export function TeamProfileDrawer({
  member,
  onClose,
  onSave,
  activity,
}: TeamProfileDrawerProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<TeamDirectoryMember | null>(null);

  const current = editing && draft ? draft : member;

  function startEdit() {
    if (!member) return;
    setDraft({ ...member });
    setEditing(true);
  }

  function handleSave() {
    if (!draft) return;
    onSave(draft);
    setEditing(false);
    setDraft(null);
  }

  return (
    <AnimatePresence>
      {member && current ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close drawer"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Team Profile</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="flex flex-col items-center text-center">
                <TeamMemberAvatar
                  name={current.full_name}
                  image={current.profile_image}
                  size="xl"
                />
                {!editing ? (
                  <>
                    <h3 className="mt-4 text-xl font-bold text-slate-900">
                      {current.full_name}
                    </h3>
                    <p className="text-sm text-violet-600">{current.role}</p>
                    <span
                      className={cn(
                        "mt-3 rounded-full px-3 py-1 text-xs font-semibold",
                        current.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {current.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </>
                ) : null}
              </div>

              {editing && draft ? (
                <div className="mt-6 space-y-3">
                  <div className="space-y-1.5">
                    <Label>Full name</Label>
                    <Input
                      value={draft.full_name}
                      onChange={(e) =>
                        setDraft({ ...draft, full_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input
                      value={draft.phone}
                      onChange={(e) =>
                        setDraft({ ...draft, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <select
                      value={draft.role}
                      onChange={(e) =>
                        setDraft({ ...draft, role: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                    >
                      {TEAM_DESIGNATIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Department</Label>
                    <select
                      value={draft.department}
                      onChange={(e) =>
                        setDraft({ ...draft, department: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                    >
                      {TEAM_DEPARTMENTS.filter((d) => d !== "All Departments").map(
                        (d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setEditing(false);
                        setDraft(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="button" className="flex-1" onClick={handleSave}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <dl className="mt-8 space-y-4 text-sm">
                    <div className="flex gap-3">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <dt className="text-xs text-slate-400">Email</dt>
                        <dd className="font-medium text-slate-800">
                          {current.email}
                        </dd>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <dt className="text-xs text-slate-400">Phone</dt>
                        <dd className="font-medium text-slate-800">
                          {current.phone}
                        </dd>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <dt className="text-xs text-slate-400">Department</dt>
                        <dd className="font-medium text-slate-800">
                          {current.department}
                        </dd>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <dt className="text-xs text-slate-400">Joined</dt>
                        <dd className="font-medium text-slate-800">
                          {formatDate(current.joined_at) ?? "—"}
                        </dd>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <dt className="text-xs text-slate-400">Last active</dt>
                        <dd className="font-medium text-slate-800">
                          {current.last_active_at
                            ? formatRelativeTime(current.last_active_at)
                            : "Never"}
                        </dd>
                      </div>
                    </div>
                  </dl>

                  <div className="mt-8">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Responsibilities
                    </h4>
                    <ul className="mt-2 space-y-1.5">
                      {current.responsibilities.map((r) => (
                        <li
                          key={r}
                          className="rounded-lg bg-violet-50/60 px-3 py-2 text-sm text-slate-700"
                        >
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Activity History
                    </h4>
                    <ul className="mt-3 space-y-3">
                      {activity.map((a) => (
                        <li
                          key={a.id}
                          className="flex items-start justify-between gap-2 border-l-2 border-violet-200 pl-3"
                        >
                          <span className="text-sm text-slate-700">{a.label}</span>
                          <time className="shrink-0 text-[11px] text-slate-400">
                            {a.time}
                          </time>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    type="button"
                    className="mt-8 w-full"
                    onClick={startEdit}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </>
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
