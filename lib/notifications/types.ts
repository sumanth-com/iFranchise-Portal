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

export type AdminNotificationCategory =
  | "new_submission"
  | "resubmission"
  | "owner_activity";

export type AdminNotificationMessage = {
  greetingName: string;
  paragraphs: string[];
  highlight?: { label: string; value: string };
  instructions?: { title: string; items: string[] };
  notice?: { title: string; paragraphs: string[] };
  closing: string;
  signOff: string;
};

export type PortalNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  time: string | null;
  href: string;
  brandName?: string;
};

export type AdminNotification = {
  id: string;
  category: AdminNotificationCategory;
  title: string;
  description: string;
  time: string | null;
  href: string;
  brandName?: string;
  ownerName?: string;
  message: AdminNotificationMessage;
};

export type AdminNotificationPreview = Pick<
  AdminNotification,
  "id" | "title" | "description" | "time" | "category"
>;

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  brand_submitted: "Brand Submitted",
  review_started: "Under Review",
  brand_approved: "Approved",
  brand_rejected: "Rejected",
  edit_window_expired: "Edit Window Expired",
  document_missing: "Documents Requested",
  marketplace_published: "Published",
  admin_comment: "Changes Requested",
  system_update: "System Update",
};

export const ADMIN_NOTIFICATION_CATEGORY_LABELS: Record<
  AdminNotificationCategory,
  string
> = {
  new_submission: "New Submission",
  resubmission: "Resubmission",
  owner_activity: "Brand Owner Activity",
};
