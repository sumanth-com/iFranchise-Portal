"use client";

import { motion } from "framer-motion";
import { Calendar, Mail, MoreVertical, Phone } from "lucide-react";

import { TeamMemberAvatar } from "@/components/team/directory/team-member-avatar";
import { formatDate, formatRelativeTime } from "@/lib/format-date";
import { staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { TeamDirectoryMember } from "@/types/team-directory";

type TeamMemberCardProps = {
  member: TeamDirectoryMember;
  onOpen: (member: TeamDirectoryMember) => void;
  onMenuToggle: (member: TeamDirectoryMember, anchor: DOMRect) => void;
  menuOpen: boolean;
};

export function TeamMemberCard({
  member,
  onOpen,
  onMenuToggle,
  menuOpen,
}: TeamMemberCardProps) {
  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="group relative flex h-full min-h-[260px] flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:border-violet-200/80 hover:shadow-[0_12px_40px_rgba(124,58,237,0.08)]"
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpen(member)}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <TeamMemberAvatar
            name={member.full_name}
            image={member.profile_image}
            size="md"
          />
          <div className="min-w-0 pt-0.5">
            <p className="truncate font-semibold text-slate-900">
              {member.full_name}
            </p>
            <p className="truncate text-sm text-slate-500">{member.role}</p>
          </div>
        </button>
        <button
          type="button"
          onClick={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            onMenuToggle(member, rect);
          }}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700",
            menuOpen && "bg-slate-100 text-slate-700",
          )}
          aria-label={`Actions for ${member.full_name}`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onOpen(member)}
        className="mt-4 flex flex-1 flex-col text-left"
      >
        <div className="space-y-2.5 text-sm text-slate-600">
          <p className="flex items-center gap-2.5">
            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{member.email}</span>
          </p>
          <p className="flex items-center gap-2.5">
            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{member.phone}</span>
          </p>
        </div>

        <div className="mt-4 flex min-h-[28px] flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              member.status === "active"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10"
                : "bg-slate-100 text-slate-600 ring-1 ring-slate-300/30",
            )}
          >
            {member.status === "active" ? "Active" : "Inactive"}
          </span>
          <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-violet-700">
            {member.department}
          </span>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-400">
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            Joined {formatDate(member.joined_at) ?? "—"}
          </p>
          <p className="mt-1">
            Last active{" "}
            {member.last_active_at
              ? formatRelativeTime(member.last_active_at) ?? "Recently"
              : "Never"}
          </p>
        </div>
      </button>
    </motion.article>
  );
}
