import { BrandOnboardingWizard } from "@/components/brand/BrandOnboardingWizard";
import { getBrandAssets } from "@/lib/assets/queries";
import { requireClient } from "@/lib/auth/session";
import { getClientBrandById } from "@/lib/brand/queries";
import { validateBrandSchemaOnLoad } from "@/lib/brand/schema";
import { createClient } from "@/lib/supabase/server";
import type { BrandAssetsBundle } from "@/types/assets";

type NewBrandPageProps = {
  searchParams: Promise<{ brandId?: string; step?: string }>;
};

function parseStep(value: string | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 8) return 1;
  return Math.floor(n);
}

const emptyAssets: BrandAssetsBundle = {
  logo: null,
  gallery: [],
  storePhotos: [],
  productPhotos: [],
  documents: [],
};

export default async function NewBrandPage({ searchParams }: NewBrandPageProps) {
  const params = await searchParams;
  const step = parseStep(params.step);
  const brandId = params.brandId?.trim() || null;

  let profile;
  try {
    profile = await requireClient();
  } catch {
    throw new Error("Authentication required.");
  }

  const supabase = await createClient();

  try {
    await validateBrandSchemaOnLoad(supabase);
  } catch (err) {
    console.warn("[brand wizard] Schema validation skipped:", err);
  }

  let brand = null;
  let loadError: string | null = null;

  if (brandId) {
    try {
      const result = await getClientBrandById(profile.id, brandId);
      brand = result.brand;
      loadError = result.error;
      if (!brand && !loadError) {
        loadError = "Brand not found or you do not have access.";
      }
    } catch (err) {
      console.error("[brand wizard] Brand load failed:", err);
      loadError = "Unable to load your brand. Please refresh and try again.";
    }
  }

  let assets: BrandAssetsBundle = emptyAssets;
  let assetsError: string | null = null;

  if (brand != null) {
    try {
      const assetsResult = await getBrandAssets(brand.id);
      assets = assetsResult.assets ?? emptyAssets;
      assetsError = assetsResult.error;
    } catch (err) {
      console.error("[brand wizard] Assets load failed:", err);
      assetsError = "Unable to load brand assets. You can still continue editing.";
    }
  }

  return (
    <BrandOnboardingWizard
      mode="create"
      brand={brandId ? brand : null}
      brandId={brandId}
      loadError={brandId ? loadError : null}
      assets={assets}
      assetsError={assetsError}
      initialStep={step}
    />
  );
}
