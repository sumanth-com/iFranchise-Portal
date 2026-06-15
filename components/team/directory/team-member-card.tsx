"use client";

import { Calendar, Clock, Mail, MoreVertical, Phone } from "lucide-react";

import { TeamCardBanner } from "@/components/team/directory/team-card-banner";
import { TeamMemberAvatar } from "@/components/team/directory/team-member-avatar";
import { formatDate, formatRelativeTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { TeamDirectoryMember } from "@/types/team-directory";

type TeamMemberCardProps = {
  member: TeamDirectoryMember;
  index: number;
  onOpen: (member: TeamDirectoryMember) => void;
  onMenuToggle: (member: TeamDirectoryMember, anchor: DOMRect) => void;
  menuOpen: boolean;
};

function ContactRow({
  icon: Icon,
  value,
}: {
  icon: typeof Mail;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[1.75rem_1fr] items-center gap-x-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-violet-100">
        <Icon className="h-3.5 w-3.5 text-violet-600" />
      </span>
      <span className="truncate text-left text-[11px] font-medium leading-tight text-slate-700">
        {value}
      </span>
    </div>
  );
}

export function TeamMemberCard({
  member,
  index,
  onOpen,
  onMenuToggle,
  menuOpen,
}: TeamMemberCardProps) {
  return (
    <article className="group relative isolate flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-violet-200 hover:shadow-[0_12px_36px_rgba(124,58,237,0.1)]">
      <TeamCardBanner
        variantIndex={index}
        department={member.department}
        actions={
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              onMenuToggle(member, rect);
            }}
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/15 text-white transition-colors hover:bg-white/25",
              menuOpen && "bg-white/25",
            )}
            aria-label={`Actions for ${member.full_name}`}
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        }
      />

      <div className="relative z-10 -mt-8 flex justify-center pb-0.5">
        <TeamMemberAvatar
          name={member.full_name}
          image={member.profile_image}
          size="card"
          imagePosition={member.profile_image_position ?? "center top"}
          className="ring-[3px] ring-white shadow-md"
        />
      </div>

      <button
        type="button"
        onClick={() => onOpen(member)}
        className="flex flex-col px-3.5 pb-3.5 pt-1 text-left"
      >
        <h3 className="line-clamp-2 text-center text-sm font-semibold leading-snug text-slate-900">
          {member.full_name}
        </h3>

        <div className="mt-2 rounded-lg border border-violet-100/80 bg-violet-50/70 px-2.5 py-1.5">
          <p className="text-center text-[11px] font-semibold leading-snug text-violet-900">
            {member.role}
          </p>
        </div>

        <div className="mt-2.5 space-y-1.5 rounded-xl bg-slate-50/90 p-2 ring-1 ring-slate-100">
          <ContactRow icon={Mail} value={member.email} />
          <ContactRow icon={Phone} value={member.phone} />
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 text-[10px] text-slate-500">
            <span className="flex min-w-0 items-center gap-1 truncate">
              <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
              {formatDate(member.joined_at) ?? "—"}
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex min-w-0 items-center gap-1 truncate">
              <Clock className="h-3 w-3 shrink-0 text-slate-400" />
              {member.last_active_at
                ? formatRelativeTime(member.last_active_at) ?? "Recently"
                : "Never"}
            </span>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              member.is_invitation
                ? "bg-amber-50 text-amber-700"
                : member.status === "active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                member.is_invitation
                  ? "bg-amber-500"
                  : member.status === "active"
                    ? "bg-emerald-500"
                    : "bg-slate-400",
              )}
            />
            {member.is_invitation
              ? "Pending"
              : member.status === "active"
                ? "Active"
                : "Suspended"}
          </span>
        </div>
      </button>
    </article>
  );
}
