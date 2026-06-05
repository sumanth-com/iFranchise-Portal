"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type AuthAlertProps = {
  error?: string | null;
  message?: string | null;
};

export function AuthAlert({ error, message }: AuthAlertProps) {
  const content = error ?? message;
  if (!content) return null;

  const isError = Boolean(error);

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={content}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        role={isError ? "alert" : "status"}
        className={`flex items-start gap-2 rounded-[var(--radius-md)] px-4 py-3 text-sm ${
          isError
            ? "bg-red-50 text-red-800 ring-1 ring-red-100"
            : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
        }`}
      >
        {isError ? (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        {content}
      </motion.p>
    </AnimatePresence>
  );
}
