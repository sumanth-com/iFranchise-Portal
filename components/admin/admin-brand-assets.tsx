import Image from "next/image";

import { DocumentList } from "@/components/assets/DocumentList";
import { ImagePreviewGrid } from "@/components/assets/ImagePreviewGrid";
import { Card } from "@/components/ui/card";
import type { BrandAssetsBundle } from "@/types/assets";

type AdminBrandAssetsProps = {
  assets: BrandAssetsBundle;
  assetsError?: string | null;
};

export function AdminBrandAssets({ assets, assetsError }: AdminBrandAssetsProps) {
  const allImages = [
    ...assets.gallery,
    ...assets.storePhotos,
    ...assets.productPhotos,
  ];

  return (
    <Card padding="lg">
      <h3 className="text-base font-semibold text-foreground">Uploaded assets</h3>
      <p className="mt-1 text-sm text-slate-500">
        Logo, gallery images, brochures, and supporting documents
      </p>

      {assetsError ? (
        <p
          className="mt-4 rounded-[var(--radius-md)] bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {assetsError}
        </p>
      ) : null}

      <div className="mt-8 space-y-10">
        <section>
          <h4 className="mb-4 text-sm font-semibold text-foreground">Logo</h4>
          {assets.logo?.previewUrl ? (
            <div className="relative h-32 w-32 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-muted">
              <Image
                src={assets.logo.previewUrl}
                alt={assets.logo.file_name}
                fill
                unoptimized
                className="object-contain p-2"
              />
            </div>
          ) : (
            <p className="rounded-[var(--radius-md)] bg-surface-muted px-4 py-6 text-center text-sm text-slate-500">
              No logo uploaded
            </p>
          )}
        </section>

        <section>
          <h4 className="mb-4 text-sm font-semibold text-foreground">Gallery images</h4>
          <ImagePreviewGrid
            items={assets.gallery}
            editable={false}
            emptyMessage="No gallery images uploaded."
          />
        </section>

        {allImages.length > assets.gallery.length ? (
          <section>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Store & product photos
            </h4>
            <ImagePreviewGrid
              items={[...assets.storePhotos, ...assets.productPhotos]}
              editable={false}
              emptyMessage="No additional photos uploaded."
            />
          </section>
        ) : null}

        <section>
          <h4 className="mb-4 text-sm font-semibold text-foreground">
            Brochure & documents
          </h4>
          <DocumentList
            items={assets.documents}
            editable={false}
            emptyMessage="No brochure or documents uploaded."
          />
        </section>
      </div>
    </Card>
  );
}
