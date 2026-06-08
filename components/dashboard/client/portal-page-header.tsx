import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PortalPageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function PortalPageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: PortalPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
