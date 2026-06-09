import type { AdminActivityItem } from "@/types/admin";
import type { Brand } from "@/types/brand";

type BrandWithOwner = Brand & {
  owner_name?: string | null;
};

export function buildAdminActivityFeed(
  brands: BrandWithOwner[],
): AdminActivityItem[] {
  const items: AdminActivityItem[] = [];

  for (const brand of brands) {
    const label = brand.business_name;

    if (brand.submitted_at) {
      const isResubmission =
        brand.reviewed_at &&
        new Date(brand.submitted_at).getTime() >
          new Date(brand.reviewed_at).getTime();

      items.push({
        id: `${brand.id}-submitted`,
        type: isResubmission ? "brand_resubmitted" : "brand_submitted",
        title: isResubmission ? "Brand Resubmitted" : "New Brand Submitted",
        description: isResubmission
          ? `"${label}" was resubmitted for review.`
          : `"${label}" was submitted for review.`,
        timestamp: brand.submitted_at,
        brandId: brand.id,
        brandName: label,
      });
    }

    if (
      brand.updated_at &&
      brand.status !== "draft" &&
      brand.updated_at !== brand.submitted_at
    ) {
      items.push({
        id: `${brand.id}-updated`,
        type: "brand_updated",
        title: "Brand Updated",
        description: `"${label}" profile was updated.`,
        timestamp: brand.updated_at,
        brandId: brand.id,
        brandName: label,
      });
    }

    if (brand.reviewed_at && brand.status === "approved") {
      items.push({
        id: `${brand.id}-approved`,
        type: "brand_approved",
        title: "Brand Approved",
        description: `"${label}" was approved by the review team.`,
        timestamp: brand.reviewed_at,
        brandId: brand.id,
        brandName: label,
      });
    }

    if (brand.reviewed_at && brand.status === "rejected") {
      items.push({
        id: `${brand.id}-rejected`,
        type: "brand_rejected",
        title: "Brand Rejected",
        description: `"${label}" was rejected.`,
        timestamp: brand.reviewed_at,
        brandId: brand.id,
        brandName: label,
      });
    }

    if (brand.reviewed_at && brand.status === "changes_requested") {
      items.push({
        id: `${brand.id}-changes`,
        type: "changes_requested",
        title: "Changes Requested",
        description: `Updates requested for "${label}".`,
        timestamp: brand.reviewed_at,
        brandId: brand.id,
        brandName: label,
      });
    }

    if (brand.published_at) {
      items.push({
        id: `${brand.id}-published`,
        type: "brand_published",
        title: "Brand Published",
        description: `"${label}" is now live on the public website.`,
        timestamp: brand.published_at,
        brandId: brand.id,
        brandName: label,
      });
    }
  }

  return items
    .sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })
    .slice(0, 12);
}
