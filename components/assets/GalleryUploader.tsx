"use client";

import { motion } from "framer-motion";
import { useActionState } from "react";

import { ImagePreviewGrid } from "@/components/assets/ImagePreviewGrid";
import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";
import { uploadGalleryImages } from "@/lib/assets/actions";
import type { BrandAssetWithUrl } from "@/types/assets";
import { initialAssetActionState } from "@/types/assets";

type GalleryUploaderProps = {
  brandId: string;
  gallery: BrandAssetWithUrl[];
  editable: boolean;
};

export function GalleryUploader({
  brandId,
  gallery,
  editable,
}: GalleryUploaderProps) {
  const [state, formAction, isPending] = useActionState(
    uploadGalleryImages,
    initialAssetActionState,
  );

  return (
    <section className="space-y-4">
      <div aria-live="polite">
        <AuthAlert error={state.error} message={state.message} />
      </div>

      <ImagePreviewGrid items={gallery} editable={editable} />

      {editable ? (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="brandId" value={brandId} />
          <Dropzone
            name="files"
            multiple
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            disabled={isPending}
            label="Drop gallery images here"
            hint="Select multiple files · JPG, PNG, WEBP · Max 5MB each"
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
            {isPending ? "Uploading..." : "Upload images"}
          </Button>
        </form>
      ) : null}
    </section>
  );
}
