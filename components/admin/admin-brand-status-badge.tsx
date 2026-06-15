import { Globe } from "lucide-react";

import { BrandStatusBadge } from "@/components/brand/BrandStatusBadge";
import { cn } from "@/lib/utils";
import type { AdminBrandListItem } from "@/types/admin";
import type { Brand } from "@/types/brand";
import { isBrandPublished } from "@/types/admin";

type AdminBrandStatusBadgeProps = {
  brand: Pick<AdminBrandListItem, "status" | "published_at"> | Brand;
  pulse?: boolean;
  className?: string;
};

const ADMIN_STATUS_OVERRIDE: Partial<Record<Brand["status"], string>> = {
  submitted: "bg-violet-50 text-violet-800 ring-violet-200",
  changes_requested: "bg-purple-50 text-purple-800 ring-purple-200",
  approved: "bg-violet-50 text-violet-800 ring-violet-200",
};

export function AdminBrandStatusBadge({
  brand,
  pulse = false,
  className,
}: AdminBrandStatusBadgeProps) {
  if (isBrandPublished(brand)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800 ring-1 ring-inset ring-violet-200">
        <Globe className="h-3.5 w-3.5" />
        Published
      </span>
    );
  }

  return (
    <BrandStatusBadge
      status={brand.status}
      pulse={pulse && brand.status === "submitted"}
      className={cn(ADMIN_STATUS_OVERRIDE[brand.status], className)}
    />
  );
}
