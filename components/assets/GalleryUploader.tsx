"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { DocumentList } from "@/components/assets/DocumentList";
import { FileDropzone } from "@/components/assets/FileDropzone";
import { ImagePreviewGrid } from "@/components/assets/ImagePreviewGrid";
import { UploadProgress } from "@/components/assets/UploadProgress";
import { AuthAlert } from "@/components/auth/auth-alert";
import { uploadGalleryImagesLegacy } from "@/lib/assets/actions";
import { validateDocumentFile, validateImageFile } from "@/lib/assets/validation";
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
  const router = useRouter();
  const [localError, setLocalError] = useState<string | null>(null);
  const [, startUpload] = useTransition();
  const [state, formAction, isPending] = useActionState(
    uploadGalleryImagesLegacy,
    initialAssetActionState,
  );

  useEffect(() => {
    if (state.message) router.refresh();
  }, [state.message, router]);

  const isDocument = assetType === "document";
  const heading = label ?? (isDocument ? "Documents" : "Gallery images");
  const uploadLabel = isDocument
    ? "Drop PDF documents here"
    : "Drop gallery images here";
  const uploadHint = isDocument
    ? "PDF only · Max 20MB"
    : "Select multiple files · JPG, PNG, WEBP · Max 5MB each";

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    setLocalError(null);
    for (const file of files) {
      const err = isDocument ? validateDocumentFile(file) : validateImageFile(file);
      if (err) {
        setLocalError(err);
        return;
      }
    }
    const fd = new FormData();
    fd.set("brandId", brandId);
    fd.set("assetType", assetType);
    files.forEach((f) => fd.append("files", f));
    startUpload(() => formAction(fd));
  };

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">{heading}</h3>

      <div aria-live="polite">
        <AuthAlert error={localError ?? state.error} message={state.message} />
      </div>

      {isDocument ? (
        <DocumentList items={gallery} editable={editable} />
      ) : (
        <ImagePreviewGrid items={gallery} editable={editable} />
      )}

      {editable ? (
        <div className="space-y-4">
          <FileDropzone
            accept={accept}
            multiple={!isDocument}
            disabled={isPending}
            label={uploadLabel}
            hint={uploadHint}
            onFilesSelected={handleFiles}
          />
          <UploadProgress
            active={isPending}
            label={isDocument ? "Uploading document…" : "Uploading images…"}
          />
        </div>
      ) : null}
    </section>
  );
}
