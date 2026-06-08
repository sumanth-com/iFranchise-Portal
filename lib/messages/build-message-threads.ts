import { canOwnerEditBrand } from "@/lib/brand/owner-access";
import type { Brand } from "@/types/brand";
import { brandEditPath } from "@/types/brand";

import type { MessageThread } from "./types";

function preview(text: string, max = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}

export function buildMessageThreads(brands: Brand[]): MessageThread[] {
  const threads: MessageThread[] = [];

  for (const brand of brands) {
    const editHref = brandEditPath(brand.id);
    const previewHref = `/dashboard/brands/${brand.id}/preview`;

    if (brand.status === "submitted") {
      threads.push({
        id: `${brand.id}-review-queue`,
        section: "review",
        title: `Review started — ${brand.business_name}`,
        preview: preview(
          `Your franchise listing "${brand.business_name}" is now in the iFranchise review queue. Our team will verify your submission shortly.`,
        ),
        body: `Hello,\n\nYour franchise listing "${brand.business_name}" has entered the review queue. Our review team is verifying your business details, financials, and supporting documents.\n\nYou will receive an update once the review is complete. No action is required at this time unless we request additional information.\n\n— iFranchise Review Team`,
        sender: "iFranchise Review Team",
        date: brand.submitted_at ?? brand.updated_at,
        href: previewHref,
        brandName: brand.business_name,
        replyEnabled: false,
      });
    }

    if (brand.status === "changes_requested" && brand.admin_feedback?.trim()) {
      threads.push({
        id: `${brand.id}-admin-changes`,
        section: "admin",
        title: `Changes requested — ${brand.business_name}`,
        preview: preview(brand.admin_feedback),
        body: brand.admin_feedback.trim(),
        sender: "iFranchise Admin",
        date: brand.reviewed_at ?? brand.updated_at,
        href: editHref,
        brandName: brand.business_name,
        replyEnabled: canOwnerEditBrand(brand),
      });
    }

    if (brand.status === "rejected" && brand.admin_feedback?.trim()) {
      threads.push({
        id: `${brand.id}-admin-rejected`,
        section: "admin",
        title: `Listing not approved — ${brand.business_name}`,
        preview: preview(brand.admin_feedback),
        body: brand.admin_feedback.trim(),
        sender: "iFranchise Admin",
        date: brand.reviewed_at ?? brand.updated_at,
        href: editHref,
        brandName: brand.business_name,
        replyEnabled: canOwnerEditBrand(brand),
      });
    }

    if (brand.status === "approved") {
      threads.push({
        id: `${brand.id}-support-approved`,
        section: "support",
        title: `Congratulations — ${brand.business_name} approved`,
        preview: preview(
          brand.publish_ready
            ? `Your listing is approved and ready for the iFranchise marketplace.`
            : `Your listing has been approved. Marketplace publishing will follow shortly.`,
        ),
        body: brand.publish_ready
          ? `Congratulations!\n\n"${brand.business_name}" has been approved and is publish-ready on the iFranchise marketplace. Investors can now discover your franchise opportunity.\n\n— iFranchise Support`
          : `Congratulations!\n\n"${brand.business_name}" has been approved by our team. We are preparing your listing for marketplace publication.\n\n— iFranchise Support`,
        sender: "iFranchise Support",
        date: brand.reviewed_at ?? brand.updated_at,
        href: previewHref,
        brandName: brand.business_name,
        replyEnabled: false,
      });
    }

    if (brand.status === "draft") {
      threads.push({
        id: `${brand.id}-support-draft`,
        section: "support",
        title: `Complete your listing — ${brand.business_name}`,
        preview: preview(
          `Finish your brand profile and submit for review to appear on iFranchise.`,
        ),
        body: `Hello,\n\nYour draft listing "${brand.business_name}" is incomplete. Complete all wizard steps, upload required documents, and submit for review to join the iFranchise marketplace.\n\n— iFranchise Support`,
        sender: "iFranchise Support",
        date: brand.updated_at,
        href: editHref,
        brandName: brand.business_name,
        replyEnabled: true,
      });
    }
  }

  if (threads.length === 0) {
    threads.push({
      id: "support-welcome",
      section: "support",
      title: "Welcome to iFranchise Portal",
      preview: preview(
        "Create your first franchise listing to start receiving updates from our team.",
      ),
      body: `Welcome to the iFranchise Brand Portal.\n\nCreate and manage franchise listings, track review progress, and grow your presence on India's premier franchise marketplace.\n\n— iFranchise Support`,
      sender: "iFranchise Support",
      date: new Date().toISOString(),
      href: "/dashboard/brands/new",
      brandName: "iFranchise",
      replyEnabled: false,
    });
  }

  return threads.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
