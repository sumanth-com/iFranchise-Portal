import { Logo } from "@/components/ui/logo";

type AuthLoadingScreenProps = {
  message?: string;
  className?: string;
};

export function AuthLoadingScreen({
  message = "Securing your workspace…",
  className,
}: AuthLoadingScreenProps) {
  return (
    <div
      className={
        className ??
        "flex min-h-[min(420px,60dvh)] w-full flex-col items-center justify-center gap-6 px-6 py-12"
      }
    >
      <Logo size="lg" />
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600"
        role="status"
        aria-label="Loading"
      />
      <p className="text-sm font-medium tracking-tight text-slate-600">
        {message}
      </p>
    </div>
  );
}
