import { cn } from "@/lib/utils";
import { displayStatusLabel } from "@/lib/dashboard/listing-data";
import type { BrandStatus } from "@/types/brand";

const STYLES: Record<BrandStatus | "preview", string> = {
  draft: "bg-slate-100 text-slate-700 ring-slate-200",
  submitted: "bg-amber-50 text-amber-800 ring-amber-200",
  changes_requested: "bg-orange-50 text-orange-800 ring-orange-200",
  approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-800 ring-rose-200",
  preview: "bg-violet-50 text-violet-800 ring-violet-200",
};

type DashboardStatusBadgeProps = {
  status: BrandStatus | "preview";
  pulse?: boolean;
  className?: string;
};

export function DashboardStatusBadge({
  status,
  pulse = false,
  className,
}: DashboardStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-black ring-1 ring-inset",
        STYLES[status],
        className,
      )}
    >
      {pulse ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-30" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-black" />
        </span>
      ) : null}
      {displayStatusLabel(status)}
    </span>
  );
}
