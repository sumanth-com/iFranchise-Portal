"use client";

import { motion } from "framer-motion";
import type { HTMLAttributes, ReactNode } from "react";

import { staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  animate?: boolean;
  padding?: "none" | "md" | "lg";
  glass?: boolean;
  children: ReactNode;
};

const paddingMap = {
  none: "",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Card({
  className,
  children,
  animate = false,
  padding = "md",
  glass = false,
  id,
  ...props
}: CardProps) {
  const classes = cn(
    "rounded-[var(--radius-card)] border border-border shadow-[var(--shadow-sm)] transition-shadow duration-300 hover:shadow-[var(--shadow-md)]",
    glass ? "glass-panel" : "bg-surface",
    paddingMap[padding],
    className,
  );

  if (animate) {
    return (
      <motion.div
        id={id}
        variants={staggerItem}
        initial="initial"
        animate="animate"
        whileHover={{ y: -2 }}
        className={classes}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div id={id} className={classes} {...props}>
      {children}
    </div>
  );
}
