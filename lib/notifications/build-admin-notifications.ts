import type { AdminBrandListItem } from "@/types/admin";

import type { AdminNotification } from "./types";

type BuildAdminNotificationsOptions = {
  brands: AdminBrandListItem[];
  brandOwnerCount?: number;
};

export function buildAdminNotifications(
  options: BuildAdminNotificationsOptions,
): AdminNotification[] {
  const { brands, brandOwnerCount = 0 } = options;
  const items: AdminNotification[] = [];

  for (const brand of brands) {
    const href = `/admin/brands/${brand.id}`;
    const label = brand.business_name;
    const ownerLabel = brand.owner_name ?? brand.owner_email;

    if (brand.status === "submitted") {
      const isResubmission = Boolean(
        brand.submitted_at &&
          brand.created_at &&
          new Date(brand.submitted_at).getTime() -
            new Date(brand.created_at).getTime() >
            60_000,
      );

      items.push({
        id: `${brand.id}-${isResubmission ? "resubmission" : "new-submission"}`,
        category: isResubmission ? "resubmission" : "new_submission",
        title: isResubmission ? "Brand resubmitted" : "New brand submission",
        description: isResubmission
          ? `"${label}" was resubmitted by ${ownerLabel}.`
          : `"${label}" from ${ownerLabel} is awaiting review.`,
        time: brand.submitted_at ?? brand.created_at,
        href,
        brandName: label,
      });
    }
  }

  if (brandOwnerCount > 0) {
    items.push({
      id: "brand-owner-count",
      category: "owner_activity",
      title: "Brand owner activity",
      description: `${brandOwnerCount} brand owner${brandOwnerCount === 1 ? "" : "s"} registered on the platform.`,
      time: new Date().toISOString(),
      href: "/admin/brands",
    });
  }

  return items.sort((a, b) => {
    if (!a.time || !b.time) return 0;
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });
}
