import { cn } from "@/lib/utils";
import { TEAM_ROLE_LABELS, type TeamRole } from "@/types/team";

const ROLE_STYLES: Record<TeamRole, string> = {
  super_admin: "bg-purple-100 text-purple-900 ring-purple-200",
  admin: "bg-violet-50 text-violet-800 ring-violet-100",
  reviewer: "bg-blue-50 text-blue-800 ring-blue-100",
  content_manager: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  support: "bg-slate-100 text-slate-700 ring-slate-200",
};

type RoleBadgeProps = {
  role: TeamRole;
  className?: string;
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        ROLE_STYLES[role],
        className,
      )}
    >
      {TEAM_ROLE_LABELS[role]}
    </span>
  );
}
