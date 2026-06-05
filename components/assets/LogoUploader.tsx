"use client";

import { motion } from "framer-motion";
import { useActionState } from "react";

import { ImagePreviewGrid } from "@/components/assets/ImagePreviewGrid";
import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";
import { uploadLogo } from "@/lib/assets/actions";
import type { BrandAssetWithUrl } from "@/types/assets";
import { initialAssetActionState } from "@/types/assets";

type LogoUploaderProps = {
  brandId: string;
  logo: BrandAssetWithUrl | null;
  editable: boolean;
};

export function LogoUploader({ brandId, logo, editable }: LogoUploaderProps) {
  const [state, formAction, isPending] = useActionState(
    uploadLogo,
    initialAssetActionState,
  );

  return (
    <section className="space-y-4">
      <div aria-live="polite">
        <AuthAlert error={state.error} message={state.message} />
      </div>

      <ImagePreviewGrid
        items={logo ? [logo] : []}
        editable={editable}
        emptyMessage="No logo uploaded yet."
        columns={2}
      />

      {editable ? (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="brandId" value={brandId} />
          <Dropzone
            name="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            required={!logo}
            disabled={isPending}
            label={logo ? "Replace logo" : "Drop your logo here"}
            hint="JPG, PNG, or WEBP · Max 5MB"
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
            {isPending ? "Uploading..." : logo ? "Replace logo" : "Upload logo"}
          </Button>
        </form>
      ) : null}
    </section>
  );
}
