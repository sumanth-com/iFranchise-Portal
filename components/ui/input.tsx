import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 text-base text-foreground outline-none transition-shadow placeholder:text-slate-400 focus:border-primary-500 focus:shadow-[var(--shadow-focus)] disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-slate-500 sm:text-sm",
        className,
      )}
      {...props}
    />
  );
}
