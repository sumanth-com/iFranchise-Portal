"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteBrandAssetForm } from "@/lib/assets/actions";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { BrandAssetWithUrl } from "@/types/assets";

type ImagePreviewGridProps = {
  items: BrandAssetWithUrl[];
  editable?: boolean;
  emptyMessage?: string;
  columns?: 2 | 3 | 4;
};

export function ImagePreviewGrid({
  items,
  editable = false,
  emptyMessage = "No images uploaded yet.",
  columns = 3,
}: ImagePreviewGridProps) {
  const columnClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 4
        ? "grid-cols-2 sm:grid-cols-4"
        : "grid-cols-2 sm:grid-cols-3";

  if (items.length === 0) {
    return (
      <p className="rounded-[var(--radius-md)] bg-surface-muted px-4 py-8 text-center text-sm text-slate-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <motion.ul
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn("grid gap-4", columnClass)}
    >
      {items.map((item) => (
        <motion.li
          key={item.id}
          variants={staggerItem}
          className="group overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-sm)]"
        >
          <div className="relative aspect-square bg-surface-muted">
            {item.previewUrl ? (
              <Image
                src={item.previewUrl}
                alt={item.file_name}
                fill
                unoptimized
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 200px"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-3 text-center text-xs text-slate-500">
                Preview unavailable
              </div>
            )}
          </div>
          <div className="space-y-2 p-3">
            <p className="truncate text-xs font-medium text-foreground" title={item.file_name}>
              {item.file_name}
            </p>
            <p className="text-xs text-slate-400">
              {(item.file_size / 1024).toFixed(0)} KB
            </p>
            {editable ? (
              <form action={deleteBrandAssetForm}>
                <input type="hidden" name="assetId" value={item.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full gap-1 text-xs text-slate-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </form>
            ) : null}
          </div>
        </motion.li>
      ))}
    </motion.ul>
  );
}
