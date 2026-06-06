"use client";

import { CheckCircle2, FileText, RefreshCw } from "lucide-react";

import { DeleteAssetButton } from "@/components/assets/DeleteAssetButton";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/assets/format";
import { formatDate } from "@/lib/format-date";
import type { BrandAssetWithUrl } from "@/types/assets";

type BrochureUploadedCardProps = {
  brochure: BrandAssetWithUrl;
  editable?: boolean;
  onReplace?: () => void;
  onRemoved?: () => void;
};

export function BrochureUploadedCard({
  brochure,
  editable = false,
  onReplace,
  onRemoved,
}: BrochureUploadedCardProps) {
  const uploadedLabel = formatDate(brochure.created_at);

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-white shadow-sm">
      <div className="flex flex-wrap items-start gap-4 p-4 sm:p-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#6D28D9]/10 text-[#6D28D9]">
          <FileText className="h-7 w-7" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-900" title={brochure.file_name}>
            {brochure.file_name}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Uploaded successfully
            </span>
            <span>{formatFileSize(brochure.file_size)}</span>
            {uploadedLabel ? (
              <span className="text-slate-500">Uploaded: {uploadedLabel}</span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-emerald-100/80 bg-white/60 px-4 py-3 sm:px-5">
        {brochure.previewUrl ? (
          <a
            href={brochure.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-primary-50 hover:border-primary-200"
          >
            View PDF
          </a>
        ) : (
          <Button size="sm" variant="secondary" disabled>
            View PDF
          </Button>
        )}

        {editable && onReplace ? (
          <Button type="button" size="sm" variant="secondary" onClick={onReplace}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Replace
          </Button>
        ) : null}

        {editable ? (
          <DeleteAssetButton
            assetId={brochure.id}
            label="Remove"
            onDeleted={onRemoved}
            className="ml-auto"
          />
        ) : null}
      </div>
    </div>
  );
}
