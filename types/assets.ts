export type AssetType = "logo" | "gallery";

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
};

export type AssetActionState = {
  error: string | null;
  message: string | null;
};

export const initialAssetActionState: AssetActionState = {
  error: null,
  message: null,
};
