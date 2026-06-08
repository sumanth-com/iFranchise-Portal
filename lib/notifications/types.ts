export type NotificationCategory =
  | "brand_submitted"
  | "review_started"
  | "brand_approved"
  | "brand_rejected"
  | "edit_window_expired"
  | "document_missing"
  | "marketplace_published"
  | "admin_comment"
  | "system_update";

export type PortalNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  time: string | null;
  href: string;
  brandName?: string;
};

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  brand_submitted: "Brand Submitted",
  review_started: "Review Started",
  brand_approved: "Review Approved",
  brand_rejected: "Review Rejected",
  edit_window_expired: "Edit Window Expired",
  document_missing: "Documents Requested",
  marketplace_published: "Marketplace Published",
  admin_comment: "Admin Comment",
  system_update: "System Update",
};
