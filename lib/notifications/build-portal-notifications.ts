import { isWithinPostSubmitEditWindow } from "@/lib/brand/edit-window";
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
        id: `${brand.id}-documents`,
        category: "document_missing",
        title: "Documents Requested",
        description: `Complete required documents and details for "${brand.business_name}".`,
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
      items.push({
        id: `${brand.id}-review-started`,
        category: "review_started",
        title: "Review Started",
        description: `Our review team is verifying "${brand.business_name}".`,
        time: brand.submitted_at ?? brand.updated_at,
        href: previewHref,
        brandName: brand.business_name,
      });
    }

    if (
      (brand.status === "submitted" || brand.status === "changes_requested") &&
      brand.submitted_at &&
      !isWithinPostSubmitEditWindow(brand)
    ) {
      items.push({
        id: `${brand.id}-edit-expired`,
        category: "edit_window_expired",
        title: "Edit Window Expired",
        description: `The post-submission edit window for "${brand.business_name}" has closed.`,
        time: brand.submitted_at,
        href: previewHref,
        brandName: brand.business_name,
      });
    }

    if (brand.status === "changes_requested") {
      items.push({
        id: `${brand.id}-changes`,
        category: "admin_comment",
        title: "Admin requested changes",
        description:
          brand.admin_feedback ??
          `Please update "${brand.business_name}" and resubmit.`,
        time: brand.reviewed_at ?? brand.updated_at,
        href: editHref,
        brandName: brand.business_name,
      });
    }

    if (brand.status === "approved") {
      items.push({
        id: `${brand.id}-approved`,
        category: "brand_approved",
        title: "Review Approved",
        description: `"${brand.business_name}" has been approved by iFranchise.`,
        time: brand.reviewed_at ?? brand.updated_at,
        href: previewHref,
        brandName: brand.business_name,
      });

      if (brand.publish_ready) {
        items.push({
          id: `${brand.id}-published`,
          category: "marketplace_published",
          title: "Marketplace Published",
          description: `"${brand.business_name}" is now live on the iFranchise marketplace.`,
          time: brand.published_at ?? brand.reviewed_at ?? brand.updated_at,
          href: previewHref,
          brandName: brand.business_name,
        });
      }
    }

    if (brand.status === "rejected") {
      items.push({
        id: `${brand.id}-rejected`,
        category: "brand_rejected",
        title: "Review Rejected",
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
