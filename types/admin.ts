import type { Brand, BrandStatus } from "@/types/brand";

export type AdminBrandListItem = {
  id: string;
  business_name: string;
  industry: string | null;
  status: BrandStatus;
  created_at: string;
  owner_email: string;
};

export type AdminBrandDetail = Brand & {
  owner_email: string;
  owner_name: string | null;
};

export type AdminActionState = {
  error: string | null;
  message: string | null;
};

export const initialAdminActionState: AdminActionState = {
  error: null,
  message: null,
};

export function canAdminReviewBrand(status: BrandStatus): boolean {
  return status === "submitted";
}
