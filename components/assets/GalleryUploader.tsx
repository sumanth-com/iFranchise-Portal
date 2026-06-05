"use client";

import { motion } from "framer-motion";
import { useActionState } from "react";

import { DocumentList } from "@/components/assets/DocumentList";
import { ImagePreviewGrid } from "@/components/assets/ImagePreviewGrid";
import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";
import { uploadGalleryImages } from "@/lib/assets/actions";
import type { AssetType, BrandAssetWithUrl } from "@/types/assets";
import { initialAssetActionState } from "@/types/assets";

type GalleryUploaderProps = {
  brandId: string;
  gallery: BrandAssetWithUrl[];
  editable: boolean;
  assetType?: AssetType;
  label?: string;
  accept?: string;
};

const DEFAULT_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

export function GalleryUploader({
  brandId,
  gallery,
  editable,
  assetType = "gallery",
  label,
  accept = DEFAULT_IMAGE_ACCEPT,
}: GalleryUploaderProps) {
  const [state, formAction, isPending] = useActionState(
    uploadGalleryImages,
    initialAssetActionState,
  );

  const isDocument = assetType === "document";
  const heading = label ?? (isDocument ? "Documents" : "Gallery images");
  const uploadLabel = isDocument
    ? "Drop PDF documents here"
    : "Drop gallery images here";
  const uploadHint = isDocument
    ? "Select PDF files · Max 5MB each"
    : "Select multiple files · JPG, PNG, WEBP · Max 5MB each";
  const submitLabel = isDocument
    ? isPending
      ? "Uploading..."
      : "Upload documents"
    : isPending
      ? "Uploading..."
      : "Upload images";

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">{heading}</h3>

      <div aria-live="polite">
        <AuthAlert error={state.error} message={state.message} />
      </div>

      {isDocument ? (
        <DocumentList items={gallery} editable={editable} />
      ) : (
        <ImagePreviewGrid items={gallery} editable={editable} />
      )}

      {editable ? (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="brandId" value={brandId} />
          <input type="hidden" name="assetType" value={assetType} />
          <Dropzone
            name="files"
            multiple
            accept={accept}
            disabled={isPending}
            label={uploadLabel}
            hint={uploadHint}
          />
          {isPending ? (
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary-600 to-accent-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            </div>
          ) : null}
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {submitLabel}
          </Button>
        </form>
      ) : null}
    </section>
  );
}
