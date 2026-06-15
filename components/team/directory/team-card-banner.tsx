import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type TeamCardBannerProps = {
  variantIndex: number;
  department: string;
  actions?: ReactNode;
};

const BASE_GRADIENT = "from-violet-800 via-purple-700 to-indigo-900";

/** Static accent overlays — no animation, same purple palette. */
const BANNER_ACCENTS = [
  "bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.18),transparent_45%)]",
  "bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_0%,transparent_50%)]",
  "bg-[radial-gradient(circle_at_15%_80%,rgba(167,139,250,0.35),transparent_50%)]",
  "bg-[linear-gradient(to_bottom,rgba(255,255,255,0.12),transparent_40%)]",
  "bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.14),transparent_55%)]",
  "bg-[linear-gradient(225deg,rgba(99,102,241,0.25)_0%,transparent_55%)]",
  "bg-[radial-gradient(circle_at_70%_60%,rgba(192,132,252,0.2),transparent_45%)]",
] as const;

export function TeamCardBanner({
  variantIndex,
  department,
  actions,
}: TeamCardBannerProps) {
  const accent = BANNER_ACCENTS[variantIndex % BANNER_ACCENTS.length];

  return (
    <div
      className={cn(
        "relative h-16 overflow-hidden bg-gradient-to-br px-4 pt-3",
        BASE_GRADIENT,
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0", accent)} aria-hidden />
      <div className="relative z-10 flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85">
          {department}
        </p>
        {actions}
      </div>
    </div>
  );
}
