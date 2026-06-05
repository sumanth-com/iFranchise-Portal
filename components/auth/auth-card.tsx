"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { fadeUp } from "@/lib/motion";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.4 }}
      className="w-full rounded-[var(--radius-xl)] border border-border bg-surface p-8 shadow-[0_18px_40px_rgba(2,6,23,0.12)] sm:p-10"
    >
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {children}
      {footer ? (
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-slate-500">
          {footer}
        </div>
      ) : null}
    </motion.div>
  );
}
