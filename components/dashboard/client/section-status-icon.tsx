import { AlertTriangle, Check, Circle } from "lucide-react";

import type { SectionCompletionState } from "@/lib/dashboard/section-completion";
import { cn } from "@/lib/utils";

type SectionStatusIconProps = {
  state: SectionCompletionState;
  className?: string;
};

export function SectionStatusIcon({ state, className }: SectionStatusIconProps) {
  if (state === "completed") {
    return (
      <Check
        className={cn("h-3.5 w-3.5 text-black", className)}
        aria-label="Completed"
      />
    );
  }
  if (state === "needs_review") {
    return (
      <AlertTriangle
        className={cn("h-3.5 w-3.5 text-black", className)}
        aria-label="Needs review"
      />
    );
  }
  return (
    <Circle
      className={cn("h-3 w-3 text-black", className)}
      aria-label="Not started"
    />
  );
}
