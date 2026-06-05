import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
};

const sizes = {
  sm: { mark: "h-9 w-9 text-sm", text: "text-base" },
  md: { mark: "h-11 w-11 text-base", text: "text-lg" },
  lg: { mark: "h-16 w-16 text-xl", text: "text-2xl" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#A78BFA] font-bold text-white shadow-[var(--shadow-sm)]",
          s.mark,
        )}
      >
        iF
      </div>
      {showText ? (
        <div className="flex flex-col leading-tight">
          <span className={cn("font-semibold tracking-tight text-foreground", s.text)}>
            iFranchise
          </span>
          <span className="text-xs font-medium text-primary-600">Portal</span>
        </div>
      ) : null}
    </div>
  );
}
