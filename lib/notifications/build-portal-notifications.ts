import { isWithinPostSubmitEditWindow } from "@/lib/brand/edit-window";
import { resolveFirstName } from "@/lib/utils";
import type { Brand } from "@/types/brand";
import { brandEditPath } from "@/types/brand";

import type { PortalNotification } from "./types";

type BuildNotificationsOptions = {
  userName?: string | null;
  userEmail?: string | null;
};

export function buildPortalNotifications(
  brands: Brand[],
  options: BuildNotificationsOptions = {},
): PortalNotification[] {
  const name = resolveFirstName(options.userName, options.userEmail);
  const items: PortalNotification[] = [];

  for (const brand of brands) {
    const editHref = brandEditPath(brand.id);
    const previewHref = `/dashboard/brands/${brand.id}/preview`;
    const brandLabel = brand.business_name;

    if (brand.status === "draft") {
      items.push({
        id: `${brand.id}-documents`,
        category: "document_missing",
        title: "Action required — complete your listing",
        description: `Hi ${name}, please complete the required documents and brand details for "${brandLabel}" so we can move your franchise listing forward.`,
        time: brand.updated_at,
        href: editHref,
        brandName: brandLabel,
      });
    }

    if (brand.status === "submitted") {
      items.push({
        id: `${brand.id}-submitted`,
        category: "brand_submitted",
        title: "Congratulations — submission received!",
        description: `Congratulations, ${name}! Your franchise listing "${brandLabel}" has been successfully submitted. Our review team will begin verification shortly.`,
        time: brand.submitted_at ?? brand.updated_at,
        href: previewHref,
        brandName: brandLabel,
      });
      items.push({
        id: `${brand.id}-review-started`,
        category: "review_started",
        title: "Review in progress",
        description: `Hi ${name}, our review team has started verifying "${brandLabel}". We'll notify you as soon as there is an update — no action is needed from you right now.`,
        time: brand.submitted_at ?? brand.updated_at,
        href: previewHref,
        brandName: brandLabel,
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
        title: "Edit window closed",
        description: `Hi ${name}, the post-submission edit window for "${brandLabel}" has closed. Your listing remains under review — we'll reach out if any further updates are required.`,
        time: brand.submitted_at,
        href: previewHref,
        brandName: brandLabel,
      });
    }

    if (brand.status === "changes_requested") {
      items.push({
        id: `${brand.id}-changes`,
        category: "admin_comment",
        title: "Updates requested on your listing",
        description:
          brand.admin_feedback?.trim() ??
          `Hi ${name}, our team has reviewed "${brandLabel}" and requested a few updates. Please review the feedback and resubmit when you're ready.`,
        time: brand.reviewed_at ?? brand.updated_at,
        href: editHref,
        brandName: brandLabel,
      });
    }

    if (brand.status === "approved") {
      items.push({
        id: `${brand.id}-approved`,
        category: "brand_approved",
        title: "Congratulations — listing approved!",
        description: `Congratulations, ${name}! "${brandLabel}" has been approved by iFranchise. You're one step closer to connecting with qualified franchise investors.`,
        time: brand.reviewed_at ?? brand.updated_at,
        href: previewHref,
        brandName: brandLabel,
      });

      if (brand.published_at) {
        items.push({
          id: `${brand.id}-published`,
          category: "marketplace_published",
          title: "You're live on the marketplace!",
          description: `Congratulations, ${name}! "${brandLabel}" is now live on the iFranchise marketplace. Investors can discover and enquire about your franchise opportunity.`,
          time: brand.published_at,
          href: previewHref,
          brandName: brandLabel,
        });
      }
    }

    if (brand.status === "rejected") {
      items.push({
        id: `${brand.id}-rejected`,
        category: "brand_rejected",
        title: "Listing requires updates",
        description:
          brand.admin_feedback?.trim() ??
          `Hi ${name}, thank you for submitting "${brandLabel}". After careful review, we weren't able to approve the listing at this time. Please review our feedback and resubmit when ready.`,
        time: brand.reviewed_at ?? brand.updated_at,
        href: editHref,
        brandName: brandLabel,
      });
    }
  }

  items.push({
    id: "system-welcome",
    category: "system_update",
    title: `Welcome to iFranchise Portal, ${name}!`,
    description: `Hi ${name}, welcome aboard! We're excited to partner with you as you build, manage, and grow your franchise listings on India's premier marketplace.`,
    time: new Date().toISOString(),
    href: "/dashboard",
  });

  return items.sort((a, b) => {
    if (!a.time || !b.time) return 0;
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });
}
