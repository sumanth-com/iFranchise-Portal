import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

export type ActivityFeedItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "asset" | "update" | "document" | "review" | "system";
};

export function buildActivityFeed(
  brand: Brand | null,
  assets: BrandAssetsBundle,
): ActivityFeedItem[] {
  const items: ActivityFeedItem[] = [];

  if (!brand) return items;

  items.push({
    id: "profile-updated",
    title: "Profile updated",
    description: `Status: ${brand.status.replace("_", " ")}`,
    timestamp: brand.updated_at,
    type: "update",
  });

  if (assets.logo) {
    items.push({
      id: "logo",
      title: "Logo uploaded",
      description: assets.logo.file_name,
      timestamp: assets.logo.created_at,
      type: "asset",
    });
  }

  for (const doc of assets.documents) {
    items.push({
      id: `doc-${doc.id}`,
      title: "Document uploaded",
      description: doc.file_name,
      timestamp: doc.created_at,
      type: "document",
    });
  }

  const imageCount =
    assets.gallery.length +
    assets.storePhotos.length +
    assets.productPhotos.length;

  if (imageCount > 0) {
    const latest = [
      ...assets.gallery,
      ...assets.storePhotos,
      ...assets.productPhotos,
    ].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];

    items.push({
      id: "gallery",
      title: "Gallery images uploaded",
      description: `${imageCount} image${imageCount === 1 ? "" : "s"}`,
      timestamp: latest.created_at,
      type: "asset",
    });
  }

  if (brand.investment_min != null) {
    items.push({
      id: "investment",
      title: "Investment updated",
      description: `From ₹${brand.investment_min.toLocaleString("en-IN")}`,
      timestamp: brand.updated_at,
      type: "update",
    });
  }

  if (brand.submitted_at) {
    items.push({
      id: "submitted",
      title: "Submitted for review",
      description: "Your brand entered the review queue",
      timestamp: brand.submitted_at,
      type: "system",
    });
  }

  if (brand.reviewed_at && brand.status === "changes_requested") {
    items.push({
      id: "changes",
      title: "Changes requested",
      description: brand.admin_feedback ?? "Reviewer left feedback",
      timestamp: brand.reviewed_at,
      type: "review",
    });
  }

  if (brand.reviewed_at && brand.status === "approved") {
    items.push({
      id: "approved",
      title: "Admin approved",
      description: "Your listing is approved",
      timestamp: brand.reviewed_at,
      type: "review",
    });
  }

  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}
