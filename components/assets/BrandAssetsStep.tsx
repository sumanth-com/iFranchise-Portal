"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  ImageIcon,
  Sparkles,
} from "lucide-react";

import { BrochureUploadedCard } from "@/components/assets/BrochureUploadedCard";
import { DeleteAssetButton } from "@/components/assets/DeleteAssetButton";
import { FileDropzone } from "@/components/assets/FileDropzone";
import { UploadProgress } from "@/components/assets/UploadProgress";
import {
  IMAGE_ACCEPT,
  MAX_GALLERY_IMAGES,
  PDF_ACCEPT,
} from "@/lib/assets/constants";
import { formatFileSize } from "@/lib/assets/format";
import {
  uploadBrochure,
  uploadGalleryImages,
  uploadLogo,
} from "@/lib/assets/actions";
import { validateDocumentFile, validateImageFile } from "@/lib/assets/validation";
import { formatDate } from "@/lib/format-date";
import type { BrandAssetWithUrl, BrandAssetsBundle } from "@/types/assets";
import { initialAssetActionState } from "@/types/assets";

type BrandAssetsStepProps = {
  brandId: string;
  assets: BrandAssetsBundle;
  editable: boolean;
  assetsError?: string | null;
  logoError?: string | null;
};

function StatusBanner({
  error,
  message,
}: {
  error: string | null;
  message: string | null;
}) {
  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </p>
    );
  }
  if (message) {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        {message}
      </p>
    );
  }
  return null;
}

function orderGalleryItems(items: BrandAssetWithUrl[], brandId: string) {
  if (typeof window === "undefined") return items;
  try {
    const raw = localStorage.getItem(`gallery-order-${brandId}`);
    if (!raw) return items;
    const order = JSON.parse(raw) as string[];
    const map = new Map(items.map((i) => [i.id, i]));
    const sorted = order.map((id) => map.get(id)).filter(Boolean) as BrandAssetWithUrl[];
    const rest = items.filter((i) => !order.includes(i.id));
    return [...sorted, ...rest];
  } catch {
    return items;
  }
}

function persistGalleryOrder(brandId: string, ids: string[]) {
  localStorage.setItem(`gallery-order-${brandId}`, JSON.stringify(ids));
}

export function BrandAssetsStep({
  brandId,
  assets,
  editable,
  assetsError,
  logoError,
}: BrandAssetsStepProps) {
  const [, startUpload] = useTransition();
  const brochureReplaceRef = useRef<HTMLInputElement>(null);

  const [logoState, logoAction, logoPending] = useActionState(
    uploadLogo,
    initialAssetActionState,
  );
  const [galleryState, galleryAction, galleryPending] = useActionState(
    uploadGalleryImages,
    initialAssetActionState,
  );
  const [brochureState, brochureAction, brochurePending] = useActionState(
    uploadBrochure,
    initialAssetActionState,
  );

  const [localError, setLocalError] = useState<string | null>(null);
  const [localLogo, setLocalLogo] = useState<BrandAssetWithUrl | null>(assets.logo);
  const [localBrochure, setLocalBrochure] = useState<BrandAssetWithUrl | null>(
    assets.documents[0] ?? null,
  );
  const [logoPreviewOverride, setLogoPreviewOverride] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<BrandAssetWithUrl[]>(() =>
    orderGalleryItems(assets.gallery, brandId),
  );
  const [showBrochureDropzone, setShowBrochureDropzone] = useState(
    !assets.documents[0],
  );

  useEffect(() => {
    setLocalLogo(assets.logo);
    setLocalBrochure(assets.documents[0] ?? null);
    setGalleryItems(orderGalleryItems(assets.gallery, brandId));
    if (assets.documents[0]) {
      setShowBrochureDropzone(false);
    }
  }, [assets.logo, assets.gallery, assets.documents, brandId]);

  useEffect(() => {
    if (logoState.uploadedAsset) {
      setLocalLogo(logoState.uploadedAsset);
      setLogoPreviewOverride(null);
    }
  }, [logoState.uploadedAsset]);

  useEffect(() => {
    if (galleryState.uploadedAssets?.length) {
      setGalleryItems((prev) => {
        const ids = new Set(prev.map((i) => i.id));
        const merged = [...prev];
        for (const item of galleryState.uploadedAssets!) {
          if (!ids.has(item.id)) merged.push(item);
        }
        return orderGalleryItems(merged, brandId);
      });
    }
  }, [galleryState.uploadedAssets, brandId]);

  useEffect(() => {
    if (brochureState.uploadedAsset) {
      setLocalBrochure(brochureState.uploadedAsset);
      setShowBrochureDropzone(false);
    }
  }, [brochureState.uploadedAsset]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      if (logoState.debug) console.warn("[UPLOAD DEBUG] logo:", logoState.debug);
      if (galleryState.debug) console.warn("[UPLOAD DEBUG] gallery:", galleryState.debug);
      if (brochureState.debug) console.warn("[UPLOAD DEBUG] brochure:", brochureState.debug);
    }
  }, [logoState.debug, galleryState.debug, brochureState.debug]);

  const slotsLeft = MAX_GALLERY_IMAGES - galleryItems.length;
  const logoPreviewUrl = logoPreviewOverride ?? localLogo?.previewUrl ?? null;

  const moveGallery = (index: number, direction: -1 | 1) => {
    const next = [...galleryItems];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setGalleryItems(next);
    persistGalleryOrder(
      brandId,
      next.map((i) => i.id),
    );
  };

  const uploadLogoFile = (files: File[]) => {
    setLocalError(null);
    const file = files[0];
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);
    setLogoPreviewOverride(blobUrl);

    const err = validateImageFile(file);
    if (err) {
      URL.revokeObjectURL(blobUrl);
      setLogoPreviewOverride(null);
      setLocalError(err);
      return;
    }
    const fd = new FormData();
    fd.set("brandId", brandId);
    fd.set("file", file);
    startUpload(() => logoAction(fd));
  };

  const uploadGalleryFiles = (files: File[]) => {
    setLocalError(null);

    if (files.length > slotsLeft) {
      setLocalError(`Maximum ${MAX_GALLERY_IMAGES} gallery images allowed.`);
      return;
    }
    for (const file of files) {
      const err = validateImageFile(file);
      if (err) {
        setLocalError(err);
        return;
      }
    }
    const fd = new FormData();
    fd.set("brandId", brandId);
    files.forEach((f) => fd.append("files", f));
    startUpload(() => galleryAction(fd));
  };

  const uploadBrochureFile = (files: File[]) => {
    setLocalError(null);
    const file = files[0];
    if (!file) return;

    const err = validateDocumentFile(file);
    if (err) {
      setLocalError(err);
      return;
    }

    const fd = new FormData();
    fd.set("brandId", brandId);
    fd.set("file", file);
    startUpload(() => brochureAction(fd));
  };

  const handleBrochureReplaceClick = () => {
    brochureReplaceRef.current?.click();
  };

  const handleBrochureReplaceSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length > 0) uploadBrochureFile(files);
  };

  const activeBanner = useMemo(() => {
    if (localError) return { error: localError, message: null };
    if (logoState.error) return { error: logoState.error, message: null };
    if (galleryState.error) return { error: galleryState.error, message: null };
    if (brochureState.error) return { error: brochureState.error, message: null };
    const message =
      logoState.message ?? galleryState.message ?? brochureState.message ?? null;
    return { error: null, message };
  }, [localError, logoState, galleryState, brochureState]);

  return (
    <div className="space-y-8">
      {assetsError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {assetsError}
        </p>
      ) : null}

      {logoError ? (
        <p className="text-sm font-medium text-red-600">{logoError}</p>
      ) : null}

      <StatusBanner error={activeBanner.error} message={activeBanner.message} />

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Sparkles className="h-4 w-4 text-[#6D28D9]" />
            Brand Logo
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600">
              Required
            </span>
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            One logo · JPG, PNG, WEBP · Max 5MB
          </p>
        </div>

        {logoPreviewUrl ? (
          <div className="mb-4 flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white shadow-sm">
              <Image
                src={logoPreviewUrl}
                alt="Brand logo"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {localLogo?.file_name ?? "Logo"}
              </p>
              {localLogo ? (
                <p className="text-xs text-slate-500">
                  {formatFileSize(localLogo.file_size)}
                  {formatDate(localLogo.created_at)
                    ? ` · Uploaded ${formatDate(localLogo.created_at)}`
                    : null}
                </p>
              ) : logoPending ? (
                <p className="text-xs text-[#6D28D9]">Uploading preview…</p>
              ) : null}
              {localLogo && !logoPending ? (
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Uploaded successfully
                </p>
              ) : null}
            </div>
            {editable && localLogo ? (
              <DeleteAssetButton
                assetId={localLogo.id}
                label="Remove"
                onDeleted={() => {
                  setLocalLogo(null);
                  setLogoPreviewOverride(null);
                }}
              />
            ) : null}
          </div>
        ) : (
          <p className="mb-4 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No logo uploaded yet.
          </p>
        )}

        {editable ? (
          <>
            <FileDropzone
              accept={IMAGE_ACCEPT}
              disabled={logoPending}
              label={localLogo ? "Replace logo" : "Drop your logo here"}
              hint="Drag & drop or click to browse"
              onFilesSelected={uploadLogoFile}
            />
            <UploadProgress active={logoPending} label="Uploading logo…" />
          </>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <ImageIcon className="h-4 w-4 text-[#6D28D9]" />
            Store / Brand Gallery
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
              Recommended
            </span>
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Up to {MAX_GALLERY_IMAGES} images · JPG, PNG, WEBP · Max 5MB each ·{" "}
            {galleryItems.length}/{MAX_GALLERY_IMAGES} used
          </p>
        </div>

        {galleryItems.length > 0 ? (
          <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {galleryItems.map((item, index) => (
              <li
                key={item.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative aspect-square bg-slate-100">
                  {item.previewUrl ? (
                    <Image
                      src={item.previewUrl}
                      alt={item.file_name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      Preview unavailable
                    </div>
                  )}
                  {editable ? (
                    <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => moveGallery(index, -1)}
                        disabled={index === 0}
                        className="rounded-md bg-white/90 p-1 shadow disabled:opacity-40"
                        aria-label="Move left"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveGallery(index, 1)}
                        disabled={index === galleryItems.length - 1}
                        className="rounded-md bg-white/90 p-1 shadow disabled:opacity-40"
                        aria-label="Move right"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-2 p-2">
                  <p className="truncate text-[11px] text-slate-600" title={item.file_name}>
                    {item.file_name}
                  </p>
                  {editable ? (
                    <DeleteAssetButton
                      assetId={item.id}
                      label=""
                      className="h-7 px-2"
                      onDeleted={() =>
                        setGalleryItems((prev) => prev.filter((i) => i.id !== item.id))
                      }
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No gallery images yet.
          </p>
        )}

        {editable && slotsLeft > 0 ? (
          <>
            <FileDropzone
              accept={IMAGE_ACCEPT}
              multiple
              disabled={galleryPending}
              label="Drop gallery images here"
              hint={`Add up to ${slotsLeft} more image${slotsLeft === 1 ? "" : "s"}`}
              onFilesSelected={uploadGalleryFiles}
            />
            <UploadProgress active={galleryPending} label="Uploading gallery…" />
          </>
        ) : editable ? (
          <p className="text-sm text-slate-500">
            Gallery limit reached ({MAX_GALLERY_IMAGES} images).
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <FileText className="h-4 w-4 text-[#6D28D9]" />
            Brochure PDF
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
              Optional
            </span>
          </h3>
          <p className="mt-1 text-sm text-slate-500">One PDF · Max 20MB</p>
        </div>

        {localBrochure ? (
          <BrochureUploadedCard
            brochure={localBrochure}
            editable={editable}
            onReplace={handleBrochureReplaceClick}
            onRemoved={() => {
              setLocalBrochure(null);
              setShowBrochureDropzone(true);
            }}
          />
        ) : (
          <p className="mb-4 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No brochure uploaded yet.
          </p>
        )}

        {editable ? (
          <>
            <input
              ref={brochureReplaceRef}
              type="file"
              accept={PDF_ACCEPT}
              className="sr-only"
              onChange={handleBrochureReplaceSelected}
            />
            {(showBrochureDropzone || !localBrochure) && (
              <FileDropzone
                accept={PDF_ACCEPT}
                disabled={brochurePending}
                label={localBrochure ? "Replace brochure PDF" : "Drop brochure PDF here"}
                hint="PDF only · Max 20MB"
                onFilesSelected={uploadBrochureFile}
              />
            )}
            <UploadProgress active={brochurePending} label="Uploading brochure…" />
          </>
        ) : null}
      </section>
    </div>
  );
}
