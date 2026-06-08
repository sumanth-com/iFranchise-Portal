"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "md" | "lg";
  id?: string;
};

const paddingClass = {
  none: "",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function GlassCard({
  children,
  className,
  hover = false,
  padding = "md",
  id,
}: GlassCardProps) {
  return (
    <motion.div
      id={id}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        "dash-card rounded-2xl border border-slate-200/90 bg-white text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)]",
        hover &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(15,23,42,0.08),0_8px_24px_rgba(15,23,42,0.06)]",
        paddingClass[padding],
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
