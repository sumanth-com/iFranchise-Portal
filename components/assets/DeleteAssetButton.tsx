"use client";

import { useTransition } from "react";
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

  const handleDelete = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("assetId", assetId);
      const result = await deleteBrandAsset(initialAssetActionState, fd);
      if (!result.error) {
        onDeleted?.();
        router.refresh();
      }
    });
  };

  return (
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
  );
}
