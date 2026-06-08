import { cn } from "@/lib/utils";
import {
  displayStatusLabel,
  STATUS_BADGE_STYLES,
  type BrandDisplayStatus,
} from "@/lib/dashboard/brand-display-status";

type DashboardStatusBadgeProps = {
  status: BrandDisplayStatus;
  pulse?: boolean;
  className?: string;
};

export function DashboardStatusBadge({
  status,
  pulse = false,
  className,
}: DashboardStatusBadgeProps) {
  const showPulse = pulse || status === "submitted";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-white/20",
        STATUS_BADGE_STYLES[status],
        className,
      )}
    >
      {showPulse ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
      ) : null}
      {displayStatusLabel(status)}
    </span>
  );
}
