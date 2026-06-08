import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PortalEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function PortalEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: PortalEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-14 text-center sm:py-16",
        className,
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon className="h-7 w-7" strokeWidth={1.5} />
      </span>
      <p className="mt-5 text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
