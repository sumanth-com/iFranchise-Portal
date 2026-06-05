"use client";

import { motion } from "framer-motion";
import { FileText, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteBrandAssetForm } from "@/lib/assets/actions";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { BrandAssetWithUrl } from "@/types/assets";

type DocumentListProps = {
  items: BrandAssetWithUrl[];
  editable?: boolean;
  emptyMessage?: string;
};

export function DocumentList({
  items,
  editable = false,
  emptyMessage = "No documents uploaded yet.",
}: DocumentListProps) {
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
      className="space-y-3"
    >
      {items.map((item) => (
        <motion.li
          key={item.id}
          variants={staggerItem}
          className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground" title={item.file_name}>
              {item.file_name}
            </p>
            <p className="text-xs text-slate-400">
              {(item.file_size / 1024).toFixed(0)} KB
            </p>
          </div>
          {item.previewUrl ? (
            <a
              href={item.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              View
            </a>
          ) : null}
          {editable ? (
            <form action={deleteBrandAssetForm}>
              <input type="hidden" name="assetId" value={item.id} />
              <Button type="submit" variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            </form>
          ) : null}
        </motion.li>
      ))}
    </motion.ul>
  );
}
