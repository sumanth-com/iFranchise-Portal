"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { FileDropzone } from "@/components/assets/FileDropzone";
import { ImagePreviewGrid } from "@/components/assets/ImagePreviewGrid";
import { UploadProgress } from "@/components/assets/UploadProgress";
import { AuthAlert } from "@/components/auth/auth-alert";
import { uploadLogo } from "@/lib/assets/actions";
import { validateImageFile } from "@/lib/assets/validation";
import { IMAGE_ACCEPT } from "@/lib/assets/constants";
import type { BrandAssetWithUrl } from "@/types/assets";
import { initialAssetActionState } from "@/types/assets";

type LogoUploaderProps = {
  brandId: string;
  logo: BrandAssetWithUrl | null;
  editable: boolean;
};

export function LogoUploader({ brandId, logo, editable }: LogoUploaderProps) {
  const router = useRouter();
  const [localError, setLocalError] = useState<string | null>(null);
  const [, startUpload] = useTransition();
  const [state, formAction, isPending] = useActionState(
    uploadLogo,
    initialAssetActionState,
  );

  useEffect(() => {
    if (state.message) router.refresh();
  }, [state.message, router]);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setLocalError(null);
    const err = validateImageFile(file);
    if (err) {
      setLocalError(err);
      return;
    }
    const fd = new FormData();
    fd.set("brandId", brandId);
    fd.set("file", file);
    startUpload(() => formAction(fd));
  };

  return (
    <section className="space-y-4">
      <div aria-live="polite">
        <AuthAlert error={localError ?? state.error} message={state.message} />
      </div>

      <ImagePreviewGrid
        items={logo ? [logo] : []}
        editable={editable}
        emptyMessage="No logo uploaded yet."
        columns={2}
      />

      {editable ? (
        <div className="space-y-4">
          <FileDropzone
            accept={IMAGE_ACCEPT}
            disabled={isPending}
            label={logo ? "Replace logo" : "Drop your logo here"}
            hint="JPG, PNG, or WEBP · Max 5MB"
            onFilesSelected={handleFiles}
          />
          <UploadProgress
            active={isPending}
            error={isPending ? null : state.error}
            label="Uploading logo…"
          />
        </div>
      ) : null}
    </section>
  );
}
