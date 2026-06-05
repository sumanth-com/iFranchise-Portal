import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  variant?: "brand" | "mono";
};

const sizes = {
  sm: { mark: "h-9 w-9 text-sm", text: "text-base" },
  md: { mark: "h-11 w-11 text-base", text: "text-lg" },
  lg: { mark: "h-16 w-16 text-xl", text: "text-2xl" },
};

export function Logo({
  size = "md",
  showText = true,
  className,
  variant = "brand",
}: LogoProps) {
  const s = sizes[size];
  const mono = variant === "mono";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl font-bold shadow-[var(--shadow-sm)]",
          mono
            ? "border border-black bg-white text-black"
            : "bg-gradient-to-br from-[#6D28D9] to-[#A78BFA] text-white",
          s.mark,
        )}
      >
        iF
      </div>
      {showText ? (
        <div className="flex flex-col leading-tight">
          <span
            className={cn(
              "font-semibold tracking-tight",
              mono ? "text-black" : "text-foreground",
              s.text,
            )}
          >
            iFranchise
          </span>
          <span
            className={cn(
              "text-xs font-medium",
              mono ? "text-black" : "text-primary-600",
            )}
          >
            Portal
          </span>
        </div>
      ) : null}
    </div>
  );
}
