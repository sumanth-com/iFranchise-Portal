export type BrandStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "changes_requested";

export type Brand = {
  id: string;
  user_id: string;
  business_name: string;
  tagline: string | null;
  description: string | null;
  website_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  industry: string | null;
  status: BrandStatus;
  admin_feedback: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type BrandActionState = {
  error: string | null;
  message: string | null;
};

export const initialBrandActionState: BrandActionState = {
  error: null,
  message: null,
};

export function isBrandEditable(status: BrandStatus): boolean {
  return status === "draft" || status === "changes_requested";
}
