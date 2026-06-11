"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import { TeamMemberAvatar } from "@/components/team/directory/team-member-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TEAM_DEPARTMENTS,
  TEAM_DESIGNATIONS,
  type TeamDirectoryMember,
} from "@/types/team-directory";

type AddTeamMemberModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (member: Omit<TeamDirectoryMember, "id" | "source">) => void;
};

export function AddTeamMemberModal({
  open,
  onClose,
  onAdd,
}: AddTeamMemberModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");

  function handleImage(file: File | null) {
    if (!file) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const full_name = String(fd.get("fullName") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const phone = String(fd.get("phone") ?? "").trim();
    const role = String(fd.get("role") ?? "");
    const department = String(fd.get("department") ?? "");

    if (!full_name || !email) return;

    onAdd({
      full_name,
      email,
      phone: phone || "—",
      role,
      department,
      status: "active",
      joined_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
      profile_image: preview,
      responsibilities: [`${role} responsibilities`],
    });

    setName("");
    setPreview(null);
    e.currentTarget.reset();
    onClose();
  }

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
            aria-label="Close"
          />
          <motion.div
            className="fixed inset-x-4 top-[5%] z-50 mx-auto max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add Team Member
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create a new team member profile instantly.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <TeamMemberAvatar
                  name={name || "New Member"}
                  image={preview}
                  size="lg"
                />
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="mr-1.5 h-4 w-4" />
                    Upload photo
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImage(e.target.files?.[0] ?? null)}
                  />
                  <p className="mt-1 text-xs text-slate-400">JPG or PNG, max 2MB</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="tm-name">Full Name</Label>
                  <Input
                    id="tm-name"
                    name="fullName"
                    required
                    placeholder="Priya Sharma"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tm-email">Email</Label>
                  <Input
                    id="tm-email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@ifranchise.in"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tm-phone">Phone</Label>
                  <Input
                    id="tm-phone"
                    name="phone"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tm-role">Role</Label>
                  <select
                    id="tm-role"
                    name="role"
                    required
                    defaultValue={TEAM_DESIGNATIONS[0]}
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
                  <Label htmlFor="tm-dept">Department</Label>
                  <select
                    id="tm-dept"
                    name="department"
                    required
                    defaultValue="Operations"
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
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create Member
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
