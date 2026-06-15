import { AdminBrandAssetsShowcase } from "@/components/admin/brands/admin-brand-assets-showcase";
import type { BrandAssetsBundle } from "@/types/assets";

type AdminBrandAssetsProps = {
  assets: BrandAssetsBundle;
  assetsError?: string | null;
};

/** Server wrapper — interactive gallery lives in the client showcase. */
export function AdminBrandAssets({ assets, assetsError }: AdminBrandAssetsProps) {
  return <AdminBrandAssetsShowcase assets={assets} assetsError={assetsError} />;
}
