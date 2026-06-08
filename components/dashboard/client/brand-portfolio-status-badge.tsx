import { cn } from "@/lib/utils";
import {
  displayStatusLabel,
  resolveBrandDisplayStatus,
  STATUS_BADGE_STYLES,
  type BrandDisplayStatus,
} from "@/lib/dashboard/brand-display-status";
import type { Brand } from "@/types/brand";

type BrandPortfolioStatusBadgeProps = {
  brand: Brand;
  pulse?: boolean;
  className?: string;
};

export function BrandPortfolioStatusBadge({
  brand,
  pulse = false,
  className,
}: BrandPortfolioStatusBadgeProps) {
  const status = resolveBrandDisplayStatus(brand);
  const showPulse = pulse || status === "submitted";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm",
        STATUS_BADGE_STYLES[status],
        className,
      )}
    >
      {showPulse ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
        </span>
      ) : null}
      {displayStatusLabel(status)}
    </span>
  );
}

export function StatusBadgeByKey({
  status,
  className,
}: {
  status: BrandDisplayStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        STATUS_BADGE_STYLES[status],
        className,
      )}
    >
      {displayStatusLabel(status)}
    </span>
  );
}
