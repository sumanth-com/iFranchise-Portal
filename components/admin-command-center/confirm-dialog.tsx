"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "primary",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close dialog"
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            className="fixed inset-x-4 top-[20%] z-[70] mx-auto max-w-md rounded-2xl border border-white/60 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/5 backdrop-blur-xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
          >
            <div className="flex gap-4">
              <span
                className={
                  variant === "danger"
                    ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600"
                    : "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600"
                }
              >
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {description}
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={variant === "danger" ? "danger" : "primary"}
                className="flex-1"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? "Working..." : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
