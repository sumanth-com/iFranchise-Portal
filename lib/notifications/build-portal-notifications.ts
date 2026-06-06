import type { Brand } from "@/types/brand";
import { brandEditPath } from "@/types/brand";

import type { PortalNotification } from "./types";

export function buildPortalNotifications(brands: Brand[]): PortalNotification[] {
  const items: PortalNotification[] = [];

  for (const brand of brands) {
    const editHref = brandEditPath(brand.id);
    const previewHref = `/dashboard/brands/${brand.id}/preview`;

    if (brand.status === "draft") {
      items.push({
        id: `${brand.id}-draft`,
        category: "document_missing",
        title: "Complete your brand profile",
        description: `Finish "${brand.business_name}" and submit for review.`,
        time: brand.updated_at,
        href: editHref,
        brandName: brand.business_name,
      });
    }

    if (brand.status === "submitted") {
      items.push({
        id: `${brand.id}-submitted`,
        category: "brand_submitted",
        title: "Brand Submitted",
        description: `Your brand "${brand.business_name}" has been submitted for review.`,
        time: brand.submitted_at ?? brand.updated_at,
        href: previewHref,
        brandName: brand.business_name,
      });
    }

    if (brand.status === "changes_requested" && brand.admin_feedback) {
      items.push({
        id: `${brand.id}-changes`,
        category: "admin_comment",
        title: "Admin requested changes",
        description: brand.admin_feedback,
        time: brand.reviewed_at ?? brand.updated_at,
        href: editHref,
        brandName: brand.business_name,
      });
    }

    if (brand.status === "approved") {
      items.push({
        id: `${brand.id}-approved`,
        category: "brand_approved",
        title: "Brand Approved",
        description: `"${brand.business_name}" has been approved by iFranchise.`,
        time: brand.reviewed_at ?? brand.updated_at,
        href: previewHref,
        brandName: brand.business_name,
      });
    }

    if (brand.status === "rejected") {
      items.push({
        id: `${brand.id}-rejected`,
        category: "brand_rejected",
        title: "Brand Rejected",
        description:
          brand.admin_feedback ??
          `"${brand.business_name}" was not approved. Review feedback and resubmit.`,
        time: brand.reviewed_at ?? brand.updated_at,
        href: editHref,
        brandName: brand.business_name,
      });
    }
  }

  items.push({
    id: "system-welcome",
    category: "system_update",
    title: "Welcome to iFranchise Portal",
    description: "Create and manage franchise listings from your dashboard.",
    time: new Date().toISOString(),
    href: "/dashboard",
  });

  return items.sort((a, b) => {
    if (!a.time || !b.time) return 0;
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });
}
