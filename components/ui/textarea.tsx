import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full resize-y rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 py-2.5 text-base text-foreground outline-none transition-shadow placeholder:text-slate-400 focus:border-primary-500 focus:shadow-[var(--shadow-focus)] disabled:cursor-not-allowed disabled:bg-surface-muted sm:text-sm",
        className,
      )}
      {...props}
    />
  );
}
