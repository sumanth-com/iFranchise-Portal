import type { AdminBrandListItem } from "@/types/admin";
import type { ActivityLog } from "@/types/team";

import { buildAdminNotificationMessage } from "./admin-notification-message";
import type { AdminNotification } from "./types";

type BuildAdminNotificationsOptions = {
  brands: AdminBrandListItem[];
  brandOwnerCount?: number;
  adminName?: string;
  teamActivity?: ActivityLog[];
};

export function buildAdminNotifications(
  options: BuildAdminNotificationsOptions,
): AdminNotification[] {
  const { brands, brandOwnerCount = 0, adminName = "Marketplace Admin", teamActivity = [] } =
    options;
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

      const category = isResubmission ? "resubmission" : "new_submission";
      const id = `${brand.id}-${isResubmission ? "resubmission" : "new-submission"}`;

      items.push({
        id,
        category,
        title: isResubmission ? "Brand resubmitted" : "New brand submission",
        description: isResubmission
          ? `"${label}" was resubmitted by ${ownerLabel}.`
          : `"${label}" from ${ownerLabel} is awaiting review.`,
        time: brand.submitted_at ?? brand.created_at,
        href,
        brandName: label,
        ownerName: ownerLabel,
        message: buildAdminNotificationMessage({
          category,
          brandName: label,
          ownerName: ownerLabel,
          adminName,
        }),
      });
    }
  }

  if (brandOwnerCount > 0) {
    const id = "brand-owner-count";

    items.push({
      id,
      category: "owner_activity",
      title: "Brand owner activity",
      description: `${brandOwnerCount} brand owner${brandOwnerCount === 1 ? "" : "s"} registered on the platform.`,
      time: new Date().toISOString(),
      href: "/admin/brands",
      message: buildAdminNotificationMessage({
        category: "owner_activity",
        brandOwnerCount,
        adminName,
      }),
    });
  }

  for (const log of teamActivity) {
    const meta = log.metadata ?? {};
    const email = typeof meta.email === "string" ? meta.email : null;
    const fullName =
      typeof meta.full_name === "string" ? meta.full_name : null;

    if (
      log.action === "admin.invited" ||
      log.action === "admin.welcome_notification"
    ) {
      items.push({
        id: `team-${log.id}`,
        category: "team_admin",
        title:
          log.action === "admin.welcome_notification"
            ? "Welcome invitation sent"
            : "Administrator invited",
        description:
          fullName && email
            ? `${fullName} (${email}) was invited to the platform.`
            : email
              ? `Invitation sent to ${email}.`
              : "A new administrator invitation was created.",
        time: log.created_at,
        href: "/admin/team",
        message: buildAdminNotificationMessage({
          category: "owner_activity",
          adminName,
          brandOwnerCount: 0,
        }),
      });
    } else if (log.action === "admin.enabled") {
      items.push({
        id: `team-${log.id}`,
        category: "team_admin",
        title: "Administrator activated",
        description: email ? `${email} is now active.` : "An admin account was activated.",
        time: log.created_at,
        href: "/admin/team",
        message: buildAdminNotificationMessage({
          category: "owner_activity",
          adminName,
        }),
      });
    }
  }

  return items.sort((a, b) => {
    if (!a.time || !b.time) return 0;
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });
}
