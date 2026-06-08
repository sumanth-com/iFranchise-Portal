"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { deleteBrandAsset } from "@/lib/assets/actions";
import { initialAssetActionState } from "@/types/assets";

type DeleteAssetButtonProps = {
  assetId: string;
  label?: string;
  className?: string;
  onDeleted?: () => void;
};

export function DeleteAssetButton({
  assetId,
  label = "Remove",
  className,
  onDeleted,
}: DeleteAssetButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = () => {
    setDeleteError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("assetId", assetId);
      const result = await deleteBrandAsset(initialAssetActionState, fd);
      if (result.error) {
        setDeleteError(result.error);
        return;
      }
      onDeleted?.();
      router.refresh();
    });
  };

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={handleDelete}
        className={className}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {pending ? "Removing…" : label}
      </Button>
      {deleteError ? (
        <span className="max-w-[12rem] text-right text-[10px] text-red-600" role="alert">
          {deleteError}
        </span>
      ) : null}
    </div>
  );
}
