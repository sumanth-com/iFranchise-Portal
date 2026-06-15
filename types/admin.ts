import type { Brand, BrandStatus } from "@/types/brand";

export type AdminBrandListItem = {
  id: string;
  business_name: string;
  tagline: string | null;
  industry: string | null;
  status: BrandStatus;
  created_at: string;
  submitted_at: string | null;
  published_at: string | null;
  owner_email: string;
  owner_name: string | null;
  logo_url: string | null;
};

export type AdminBrandDetail = Brand & {
  owner_email: string;
  owner_name: string | null;
};

export type AdminDashboardStats = {
  pendingReviews: number;
  approvedBrands: number;
  publishedBrands: number;
  rejectedBrands: number;
  totalBrands: number;
  totalBrandOwners: number;
};

export type AdminActivityItem = {
  id: string;
  type:
    | "brand_submitted"
    | "brand_updated"
    | "brand_resubmitted"
    | "brand_published"
    | "brand_approved"
    | "brand_rejected"
    | "changes_requested";
  title: string;
  description: string;
  timestamp: string | null;
  brandId: string;
  brandName: string;
};

export type AdminBrandsQueryResult = {
  brands: AdminBrandListItem[];
  total: number;
  page: number;
  pageSize: number;
  error: string | null;
};

export type AdminActionState = {
  error: string | null;
  message: string | null;
};

export const initialAdminActionState: AdminActionState = {
  error: null,
  message: null,
};

export const ADMIN_PAGE_SIZE = 10;

export function canAdminReviewBrand(status: BrandStatus): boolean {
  return status === "submitted";
}

export function canAdminPublishBrand(brand: Brand): boolean {
  return brand.status === "approved" && !brand.published_at;
}

export function canAdminUnpublishBrand(brand: Brand): boolean {
  return brand.status === "approved" && Boolean(brand.published_at);
}

export function isBrandPublished(brand: Brand): boolean {
  return brand.status === "approved" && Boolean(brand.published_at);
}
