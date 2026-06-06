export type AssetType =
  | "logo"
  | "gallery"
  | "store_photo"
  | "product_photo"
  | "document";

export type BrandAsset = {
  id: string;
  brand_id: string;
  asset_type: AssetType;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
};

export type BrandAssetWithUrl = BrandAsset & {
  previewUrl: string | null;
};

export type BrandAssetsBundle = {
  logo: BrandAssetWithUrl | null;
  gallery: BrandAssetWithUrl[];
  storePhotos: BrandAssetWithUrl[];
  productPhotos: BrandAssetWithUrl[];
  documents: BrandAssetWithUrl[];
};

export type AssetActionState = {
  error: string | null;
  message: string | null;
  /** Raw server error — logged to browser console for debugging */
  debug?: string | null;
  /** Single asset returned after logo/brochure upload for optimistic UI */
  uploadedAsset?: BrandAssetWithUrl | null;
  /** Multiple assets returned after gallery upload */
  uploadedAssets?: BrandAssetWithUrl[];
};

export const initialAssetActionState: AssetActionState = {
  error: null,
  message: null,
  debug: null,
};
