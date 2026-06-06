import { notFound } from "next/navigation";

import { BrandOnboardingWizard } from "@/components/brand/BrandOnboardingWizard";
import { getBrandAssets } from "@/lib/assets/queries";
import { requireClient } from "@/lib/auth/session";
import { getClientBrandById } from "@/lib/brand/queries";

type EditBrandPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
};

function parseStep(value: string | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 8) return 1;
  return Math.floor(n);
}

export default async function EditBrandPage({
  params,
  searchParams,
}: EditBrandPageProps) {
  const { id } = await params;
  const { step: stepParam } = await searchParams;
  const step = parseStep(stepParam);

  const profile = await requireClient();
  const { brand, error: loadError } = await getClientBrandById(profile.id, id);

  if (!brand && !loadError) {
    notFound();
  }

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
      mode="edit"
      brand={brand}
      brandId={id}
      loadError={loadError}
      assets={assetsResult.assets}
      assetsError={assetsResult.error}
      initialStep={step}
      editBasePath={`/dashboard/brands/${id}/edit`}
    />
  );
}
