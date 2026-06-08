"use client";

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
    <div
      id={id}
      className={cn(
        "dash-card rounded-2xl border border-slate-200/70 bg-white text-slate-900 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)]",
        hover &&
          "transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(15,23,42,0.08),0_12px_32px_rgba(15,23,42,0.06)]",
        paddingClass[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
