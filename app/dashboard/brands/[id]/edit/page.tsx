import { notFound } from "next/navigation";

import { BrandOnboardingWizard } from "@/components/brand/BrandOnboardingWizard";
import { getBrandAssets } from "@/lib/assets/queries";
import { requireClient } from "@/lib/auth/session";
import { getClientBrandById } from "@/lib/brand/queries";
import { resolveWizardResumeStep } from "@/lib/brand/wizard-resume";
import type { BrandAssetsBundle } from "@/types/assets";

type EditBrandPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
};

const emptyAssets: BrandAssetsBundle = {
  logo: null,
  gallery: [],
  storePhotos: [],
  productPhotos: [],
  documents: [],
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

  const profile = await requireClient();

  const [brandResult, assetsResult] = await Promise.all([
    getClientBrandById(profile.id, id),
    getBrandAssets(id),
  ]);

  const { brand, error: loadError } = brandResult;
  const assets = assetsResult.assets ?? emptyAssets;

  if (!brand && !loadError) {
    notFound();
  }

  const step =
    stepParam != null && stepParam !== ""
      ? parseStep(stepParam)
      : brand
        ? resolveWizardResumeStep(brand, assets)
        : 1;

  return (
    <BrandOnboardingWizard
      mode="edit"
      brand={brand}
      brandId={id}
      loadError={loadError}
      assets={assets}
      assetsError={assetsResult.error}
      initialStep={step}
      editBasePath={`/dashboard/brands/${id}/edit`}
    />
  );
}
