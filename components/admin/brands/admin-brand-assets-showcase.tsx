"use client";

import Image from "next/image";
import { FileText, Images, Sparkles } from "lucide-react";

import {
  AssetImageViewer,
  type AssetSlide,
} from "@/components/admin/brands/asset-image-viewer";
import { DocumentList } from "@/components/assets/DocumentList";
import type { BrandAssetWithUrl, BrandAssetsBundle } from "@/types/assets";

type AdminBrandAssetsShowcaseProps = {
  assets: BrandAssetsBundle;
  assetsError?: string | null;
};

function toSlide(
  asset: BrandAssetWithUrl,
  label: string,
): AssetSlide | null {
  if (!asset.previewUrl) return null;
  return {
    id: asset.id,
    url: asset.previewUrl,
    label,
    fileName: asset.file_name,
  };
}

function buildSlides(assets: BrandAssetsBundle): AssetSlide[] {
  const slides: AssetSlide[] = [];

  if (assets.logo) {
    const logoSlide = toSlide(assets.logo, "Brand logo");
    if (logoSlide) slides.push(logoSlide);
  }

  for (const item of assets.gallery) {
    const slide = toSlide(item, "Gallery");
    if (slide) slides.push(slide);
  }
  for (const item of assets.storePhotos) {
    const slide = toSlide(item, "Store photo");
    if (slide) slides.push(slide);
  }
  for (const item of assets.productPhotos) {
    const slide = toSlide(item, "Product photo");
    if (slide) slides.push(slide);
  }

  return slides;
}

export function AdminBrandAssetsShowcase({
  assets,
  assetsError,
}: AdminBrandAssetsShowcaseProps) {
  const slides = buildSlides(assets);
  const imageCount = slides.length;
  const docCount = assets.documents.length;

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-100/80 bg-white shadow-[0_8px_30px_rgba(124,58,237,0.06)] ring-1 ring-violet-50">
      {/* Header */}
      <div className="border-b border-violet-100/80 bg-gradient-to-r from-violet-50/80 via-white to-purple-50/50 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
              Brand media
            </p>
            <h3 className="mt-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Images className="h-5 w-5 text-violet-600" />
              Uploaded assets
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Click any image to expand · use arrows to browse the full gallery
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              {imageCount} image{imageCount === 1 ? "" : "s"}
            </span>
            {docCount > 0 ? (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                {docCount} document{docCount === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        {assetsError ? (
          <p
            className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-100"
            role="alert"
          >
            {assetsError}
          </p>
        ) : null}

        {/* Featured logo strip when we have logo + more images */}
        {assets.logo?.previewUrl && imageCount > 1 ? (
          <div className="flex items-center gap-4 rounded-xl border border-violet-100 bg-violet-50/40 px-4 py-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-white p-1.5 shadow-sm">
              <Image
                src={assets.logo.previewUrl}
                alt="Brand logo"
                fill
                unoptimized
                className="object-contain"
                sizes="56px"
              />
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-violet-600">
                <Sparkles className="h-3.5 w-3.5" />
                Primary logo
              </p>
              <p className="mt-0.5 text-sm font-medium text-slate-600">
                Official brand mark
              </p>
            </div>
          </div>
        ) : null}

        <AssetImageViewer
          slides={slides}
          emptyMessage="No logo or gallery images uploaded yet."
        />

        {/* Documents */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FileText className="h-4 w-4 text-violet-600" />
            Brochures & documents
          </p>
          <DocumentList
            items={assets.documents}
            editable={false}
            emptyMessage="No brochure or documents uploaded."
          />
        </div>
      </div>
    </section>
  );
}
