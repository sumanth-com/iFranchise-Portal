import { cn } from "@/lib/utils";
import { displayStatusLabel } from "@/lib/dashboard/listing-data";
import type { BrandStatus } from "@/types/brand";

const STYLES: Record<BrandStatus | "preview", string> = {
  draft: "bg-neutral-100 text-black ring-neutral-300",
  submitted: "bg-neutral-100 text-black ring-neutral-400",
  changes_requested: "bg-neutral-200 text-black ring-neutral-500",
  approved: "bg-neutral-100 text-black ring-black",
  rejected: "bg-neutral-200 text-black ring-neutral-600",
  preview: "bg-white text-black ring-black",
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
