import Image from "next/image";

import { cn } from "@/lib/utils";

const LOGO_SRC = "/assets/Logo.webp";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  variant?: "brand" | "mono";
  /** Collapsed sidebar — logo only, no purple background */
  markVariant?: "plain" | "nav";
};

const sizes = {
  sm: { mark: "h-8 w-8", px: 32, text: "text-sm leading-tight", sub: "text-[10px]" },
  md: { mark: "h-10 w-10", px: 40, text: "text-base", sub: "text-xs" },
  lg: { mark: "h-14 w-14", px: 56, text: "text-xl", sub: "text-sm" },
};

export function Logo({
  size = "md",
  showText = true,
  className,
  variant = "brand",
  markVariant = "plain",
}: LogoProps) {
  const s = sizes[size];
  const mono = variant === "mono";
  const navMark = markVariant === "nav";

  if (navMark && !showText) {
    return (
      <div
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-sm",
          className,
        )}
        aria-label="iFranchise"
      >
        <Image
          src={LOGO_SRC}
          alt=""
          width={36}
          height={36}
          className="h-full w-full object-contain"
          priority
        />
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-sm",
          s.mark,
        )}
      >
        <Image
          src={LOGO_SRC}
          alt="iFranchise"
          width={s.px}
          height={s.px}
          className="h-full w-full object-contain"
          priority={size === "lg"}
        />
      </div>
      {showText ? (
        <div className="min-w-0 flex flex-col leading-tight">
          <span
            className={cn(
              "truncate font-semibold tracking-tight",
              mono ? "text-black" : "text-foreground",
              s.text,
            )}
          >
            iFranchise
          </span>
          <span
            className={cn(
              "font-medium",
              mono ? "text-slate-600" : "text-primary-600",
              s.sub,
            )}
          >
            Portal
          </span>
        </div>
      ) : null}
    </div>
  );
}
