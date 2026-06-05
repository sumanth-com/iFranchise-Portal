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
        "dash-card rounded-2xl border border-neutral-300 bg-white text-black shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
        hover && "transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]",
        paddingClass[padding],
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
