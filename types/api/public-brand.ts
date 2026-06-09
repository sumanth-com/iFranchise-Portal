/** Public API response types (camelCase for frontend consumption). */

export type PublicBrandImage = {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};

export type PublicBrandContact = {
  email: string | null;
  phone: string | null;
  websiteUrl: string | null;
};

export type PublicBrandSummary = {
  id: string;
  slug: string;
  businessName: string;
  tagline: string | null;
  industry: string | null;
  logo: PublicBrandImage | null;
  gallery: PublicBrandImage[];
  publishedAt: string | null;
  updatedAt: string;
  investmentMin?: number | null;
  investmentMax?: number | null;
  targetCities?: string[];
};

export type PublicBrandDetail = PublicBrandSummary & {
  description: string | null;
  contact: PublicBrandContact;
  existingCities?: string[];
  franchiseFee?: number | null;
  roiPercent?: number | null;
};

export type PublicBrandsListResponse = {
  data: PublicBrandSummary[];
  meta: {
    count: number;
  };
};

export type PublicBrandDetailResponse = {
  data: PublicBrandDetail;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
};
