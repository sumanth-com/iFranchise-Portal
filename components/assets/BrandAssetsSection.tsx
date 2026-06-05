import { GalleryUploader } from "@/components/assets/GalleryUploader";
import { LogoUploader } from "@/components/assets/LogoUploader";
import { Card } from "@/components/ui/card";
import type { BrandAssetsBundle } from "@/types/assets";

type BrandAssetsSectionProps = {
  brandId: string;
  assets: BrandAssetsBundle;
  editable: boolean;
  assetsError?: string | null;
};

export function BrandAssetsSection({
  brandId,
  assets,
  editable,
  assetsError,
}: BrandAssetsSectionProps) {
  return (
    <Card id="assets" className="scroll-mt-24" padding="lg">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">
          Brand assets
        </h2>
        <p className="text-sm text-slate-500">
          {editable
            ? "Drag and drop your logo and gallery images."
            : "Assets are locked while your brand is under review."}
        </p>
      </div>

      {assetsError ? (
        <p
          className="mt-4 rounded-[var(--radius-md)] bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {assetsError}
        </p>
      ) : null}

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Logo</h3>
          <LogoUploader brandId={brandId} logo={assets.logo} editable={editable} />
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Gallery</h3>
          <GalleryUploader
            brandId={brandId}
            gallery={assets.gallery}
            editable={editable}
          />
        </div>
      </div>
    </Card>
  );
}
