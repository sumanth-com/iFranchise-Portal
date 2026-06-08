import type { Brand, BrandStatus } from "@/types/brand";

export type BrandDisplayStatus = BrandStatus | "live" | "preview";

export function resolveBrandDisplayStatus(brand: Brand): BrandDisplayStatus {
  if (brand.status === "approved" && brand.published_at) {
    return "live";
  }
  return brand.status;
}

export function displayStatusLabel(status: BrandDisplayStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "submitted":
      return "Under Review";
    case "changes_requested":
      return "Changes Requested";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "live":
      return "Live";
    case "preview":
      return "Preview";
    default:
      return "Preview";
  }
}

export const STATUS_BADGE_STYLES: Record<BrandDisplayStatus, string> = {
  draft: "bg-slate-900/80 text-white backdrop-blur-md",
  submitted: "bg-amber-500/90 text-white backdrop-blur-md",
  changes_requested: "bg-orange-500/90 text-white backdrop-blur-md",
  approved: "bg-emerald-600/90 text-white backdrop-blur-md",
  rejected: "bg-rose-600/90 text-white backdrop-blur-md",
  live: "bg-violet-600/90 text-white backdrop-blur-md",
  preview: "bg-violet-500/90 text-white backdrop-blur-md",
};
