"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
};

const variants = {
  primary:
    "bg-[#6D28D9] text-white hover:bg-[#5B21B6] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-primary-50 hover:border-primary-200",
  ghost: "bg-transparent text-primary-700 hover:bg-primary-50",
  danger:
    "bg-transparent text-error border border-red-200 hover:bg-red-50",
};

const sizes = {
  sm: "h-10 px-4 text-sm rounded-xl",
  md: "h-11 px-5 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={disabled ? undefined : { scale: 1.02, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      disabled={disabled}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
