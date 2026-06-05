import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

export type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  timestamp: string | null;
  status: "done" | "current" | "upcoming";
};

export function buildSubmissionTimeline(
  brand: Brand | null,
  assets: BrandAssetsBundle,
): TimelineEvent[] {
  if (!brand) {
    return [
      {
        id: "create",
        title: "Brand Created",
        description: "Start building your franchise profile",
        timestamp: null,
        status: "current",
      },
      {
        id: "assets",
        title: "Assets Uploaded",
        description: "Logo, gallery, and documents",
        timestamp: null,
        status: "upcoming",
      },
      {
        id: "submit",
        title: "Submitted",
        description: "Send for iFranchise review",
        timestamp: null,
        status: "upcoming",
      },
      {
        id: "review",
        title: "Admin Review",
        description: "Our team evaluates your listing",
        timestamp: null,
        status: "upcoming",
      },
      {
        id: "approved",
        title: "Approved",
        description: "Live on the marketplace",
        timestamp: null,
        status: "upcoming",
      },
    ];
  }

  const hasAssets =
    Boolean(assets.logo) ||
    assets.gallery.length > 0 ||
    assets.documents.length > 0;

  const events: TimelineEvent[] = [
    {
      id: "create",
      title: "Brand Created",
      description: brand.business_name,
      timestamp: brand.created_at,
      status: "done",
    },
    {
      id: "assets",
      title: "Assets Uploaded",
      description: hasAssets
        ? `${assets.gallery.length + assets.storePhotos.length + assets.productPhotos.length} images · ${assets.documents.length} docs`
        : "Upload logo and media",
      timestamp: hasAssets ? brand.updated_at : null,
      status: hasAssets ? "done" : brand.status === "draft" ? "current" : "upcoming",
    },
    {
      id: "submit",
      title: "Submitted",
      description: "Sent for review",
      timestamp: brand.submitted_at,
      status: brand.submitted_at
        ? "done"
        : brand.status === "draft"
          ? "upcoming"
          : "current",
    },
    {
      id: "review",
      title: "Admin Review",
      description: "iFranchise team evaluation",
      timestamp:
        brand.status === "submitted" ? brand.submitted_at : brand.reviewed_at,
      status:
        brand.status === "submitted"
          ? "current"
          : brand.reviewed_at
            ? "done"
            : "upcoming",
    },
  ];

  if (brand.status === "changes_requested") {
    events.push({
      id: "changes",
      title: "Changes Requested",
      description: brand.admin_feedback ?? "Update and resubmit",
      timestamp: brand.reviewed_at,
      status: "current",
    });
  }

  events.push({
    id: "approved",
    title: "Approved",
    description: brand.publish_ready ? "Publish ready" : "Marketplace listing live",
    timestamp: brand.status === "approved" ? brand.reviewed_at : null,
    status:
      brand.status === "approved"
        ? "done"
        : brand.status === "rejected"
          ? "upcoming"
          : "upcoming",
  });

  if (brand.status === "rejected") {
    events.push({
      id: "rejected",
      title: "Rejected",
      description: brand.admin_feedback ?? "Contact support for details",
      timestamp: brand.reviewed_at,
      status: "done",
    });
  }

  return events;
}
