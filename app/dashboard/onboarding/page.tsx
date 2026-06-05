import { BrandOnboardingWizard } from "@/components/brand/BrandOnboardingWizard";
import { getBrandAssets } from "@/lib/assets/queries";
import { requireClient } from "@/lib/auth/session";
import { getClientBrand } from "@/lib/brand/queries";

type OnboardingPageProps = {
  searchParams: Promise<{ step?: string }>;
};

function parseStep(value: string | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 9) return 1;
  return Math.floor(n);
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const step = parseStep(params.step);

  const profile = await requireClient();
  const { brand, error: loadError } = await getClientBrand(profile.id);

  const assetsResult = brand
    ? await getBrandAssets(brand.id)
    : {
        assets: {
          logo: null,
          gallery: [],
          storePhotos: [],
          productPhotos: [],
          documents: [],
        },
        error: null,
      };

  return (
    <BrandOnboardingWizard
      brand={brand}
      loadError={loadError}
      assets={assetsResult.assets}
      assetsError={assetsResult.error}
      initialStep={step}
    />
  );
}
