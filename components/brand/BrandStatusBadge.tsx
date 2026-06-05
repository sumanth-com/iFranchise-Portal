import {
  CheckCircle2,
  CircleDashed,
  MessageSquareWarning,
  Send,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { BrandStatus } from "@/types/brand";

const STATUS_CONFIG: Record<
  BrandStatus,
  { label: string; className: string; icon: LucideIcon }
> = {
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
    icon: CircleDashed,
  },
  submitted: {
    label: "Submitted",
    className: "bg-blue-50 text-blue-800 ring-blue-100",
    icon: Send,
  },
  changes_requested: {
    label: "Changes requested",
    className: "bg-amber-50 text-amber-900 ring-amber-100",
    icon: MessageSquareWarning,
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-800 ring-emerald-100",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-800 ring-red-100",
    icon: XCircle,
  },
};

type BrandStatusBadgeProps = {
  status: BrandStatus;
  pulse?: boolean;
  className?: string;
};

export function BrandStatusBadge({
  status,
  pulse = false,
  className,
}: BrandStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        config.className,
        className,
      )}
    >
      {pulse ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
      {config.label}
    </span>
  );
}
