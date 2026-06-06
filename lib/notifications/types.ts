export type NotificationCategory =
  | "brand_submitted"
  | "brand_approved"
  | "brand_rejected"
  | "document_missing"
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
  brand_approved: "Brand Approved",
  brand_rejected: "Brand Rejected",
  document_missing: "Document Missing",
  admin_comment: "Admin Comment",
  system_update: "System Update",
};
