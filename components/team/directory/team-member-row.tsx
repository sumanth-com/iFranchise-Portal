"use client";

import { motion } from "framer-motion";
import { Mail, MoreVertical, Phone } from "lucide-react";

import { TeamMemberAvatar } from "@/components/team/directory/team-member-avatar";
import { formatDate, formatRelativeTime } from "@/lib/format-date";
import { staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { TeamDirectoryMember } from "@/types/team-directory";

type TeamMemberRowProps = {
  member: TeamDirectoryMember;
  onOpen: (member: TeamDirectoryMember) => void;
  onMenuToggle: (member: TeamDirectoryMember, anchor: DOMRect) => void;
  menuOpen: boolean;
};

export function TeamMemberRow({
  member,
  onOpen,
  onMenuToggle,
  menuOpen,
}: TeamMemberRowProps) {
  return (
    <motion.article
      variants={staggerItem}
      className="group grid w-full grid-cols-1 items-center gap-4 border-b border-slate-100 px-4 py-4 transition-colors last:border-b-0 hover:bg-violet-50/40 sm:px-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_auto] lg:gap-5 lg:px-6"
    >
      <button
        type="button"
        onClick={() => onOpen(member)}
        className="flex min-w-0 items-center gap-3 text-left"
      >
        <TeamMemberAvatar
          name={member.full_name}
          image={member.profile_image}
          size="sm"
        />
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">
            {member.full_name}
          </p>
          <p className="truncate text-sm text-slate-500">{member.role}</p>
        </div>
      </button>

      <div className="hidden min-w-0 lg:block">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{member.email}</span>
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{member.phone}</span>
        </p>
      </div>

      <div className="hidden min-w-0 lg:block">
        <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
          {member.department}
        </span>
      </div>

      <div className="hidden lg:block">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
            member.status === "active"
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10"
              : "bg-slate-100 text-slate-600 ring-1 ring-slate-300/30",
          )}
        >
          {member.status === "active" ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="hidden min-w-0 text-sm text-slate-500 lg:block">
        <p>Joined {formatDate(member.joined_at) ?? "—"}</p>
        <p className="mt-0.5 text-xs text-slate-400">
          {member.last_active_at
            ? formatRelativeTime(member.last_active_at) ?? "Recently"
            : "Never active"}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <div className="flex flex-wrap items-center gap-2 lg:hidden">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              member.status === "active"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600",
            )}
          >
            {member.status === "active" ? "Active" : "Inactive"}
          </span>
          <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-violet-700">
            {member.department}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            onMenuToggle(member, rect);
          }}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-white hover:text-slate-800",
            menuOpen && "border-violet-200 bg-violet-50 text-violet-700",
          )}
          aria-label={`Actions for ${member.full_name}`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
}
