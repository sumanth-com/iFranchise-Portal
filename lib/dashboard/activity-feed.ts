import type { BrandAssetsBundle } from "@/types/assets";
import type { Brand } from "@/types/brand";

export type DashboardActivity = {
  id: string;
  title: string;
  description: string;
  timestamp: string | null;
};

export function buildDashboardActivity(
  brands: Brand[],
  assetsByBrandId: Record<string, BrandAssetsBundle>,
): DashboardActivity[] {
  const items: DashboardActivity[] = [];

  for (const brand of brands) {
    const assets = assetsByBrandId[brand.id];
    const hasAssets =
      Boolean(assets?.logo) ||
      (assets?.gallery.length ?? 0) > 0 ||
      (assets?.documents.length ?? 0) > 0;

    if (brand.submitted_at) {
      items.push({
        id: `${brand.id}-submitted`,
        title: "Brand Submitted",
        description: `"${brand.business_name}" sent for review.`,
        timestamp: brand.submitted_at,
      });
    }

    if (hasAssets) {
      items.push({
        id: `${brand.id}-assets`,
        title: "Assets Uploaded",
        description: `Media and documents added for "${brand.business_name}".`,
        timestamp: brand.updated_at,
      });
    }

    if (brand.status === "submitted" || brand.status === "changes_requested") {
      items.push({
        id: `${brand.id}-review`,
        title: "Review Started",
        description: `"${brand.business_name}" is in the iFranchise review queue.`,
        timestamp: brand.submitted_at ?? brand.updated_at,
      });
    }

    if (brand.reviewed_at && brand.status === "changes_requested") {
      items.push({
        id: `${brand.id}-review-update`,
        title: "Review Updated",
        description: `Changes requested for "${brand.business_name}".`,
        timestamp: brand.reviewed_at,
      });
    }

    if (brand.published_at) {
      items.push({
        id: `${brand.id}-published`,
        title: "Brand Published",
        description: `"${brand.business_name}" is live on the marketplace.`,
        timestamp: brand.published_at,
      });
    }

    if (brand.status === "approved") {
      items.push({
        id: `${brand.id}-approved`,
        title: "Review Approved",
        description: `"${brand.business_name}" has been approved.`,
        timestamp: brand.reviewed_at ?? brand.updated_at,
      });
    }
  }

  return items
    .sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })
    .slice(0, 8);
}
