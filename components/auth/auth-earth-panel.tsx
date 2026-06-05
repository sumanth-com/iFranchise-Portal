"use client";

import dynamic from "next/dynamic";
import { ChevronDown, Globe } from "lucide-react";
import { EarthConnectionNetwork } from "@/components/auth/earth/earth-connection-network";
import { EarthLoader } from "@/components/auth/earth/earth-loader";
import { TestimonialCarousel } from "@/components/auth/earth/testimonial-carousel";
import { cn } from "@/lib/utils";

const EarthCanvas = dynamic(
  () =>
    import("@/components/auth/earth/earth-canvas").then((m) => m.EarthCanvas),
  {
    ssr: false,
    loading: () => <EarthLoader />,
  },
);

type EarthPanelProps = {
  mini?: boolean;
  className?: string;
};

export function AuthEarthPanel({ mini = false, className }: EarthPanelProps) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-[#060d1a]",
        className,
      )}
    >
      {/* Deep space gradient */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 75% at 50% 32%, #0f1f3d 0%, #0a1428 45%, #060d1a 100%)",
        }}
      />

      {/* Soft nebula glow behind earth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 55% 45% at 50% 34%, rgba(56,189,248,0.1), transparent 70%), radial-gradient(ellipse 35% 30% at 72% 18%, rgba(129,140,248,0.07), transparent 65%)",
        }}
      />

      {/* Star field — layered for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.9), transparent), radial-gradient(1px 1px at 25% 65%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 42% 12%, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 58% 78%, rgba(255,255,255,0.6), transparent), radial-gradient(1px 1px at 73% 35%, rgba(255,255,255,0.85), transparent), radial-gradient(1px 1px at 88% 55%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 15% 88%, rgba(255,255,255,0.55), transparent), radial-gradient(1px 1px at 92% 8%, rgba(255,255,255,0.75), transparent)",
          backgroundSize: "100% 100%",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 42%, rgba(255,255,255,0.55) 0.5px, transparent 0.6px), radial-gradient(circle at 62% 28%, rgba(255,255,255,0.45) 0.5px, transparent 0.6px), radial-gradient(circle at 38% 72%, rgba(255,255,255,0.4) 0.5px, transparent 0.6px)",
          backgroundSize: "180px 180px, 220px 220px, 160px 160px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.35) 0.4px, transparent 0.5px)",
          backgroundSize: "120px 120px",
        }}
      />

      {/* Earth + network overlays */}
      <div
        className={cn(
          mini
            ? "absolute inset-0 z-[1] flex items-center justify-center"
            : "absolute left-1/2 top-[7%] z-[1] h-[58%] w-[76%] -translate-x-1/2",
        )}
      >
        <EarthCanvas mini={mini} className="h-full w-full" />

        {!mini ? <EarthConnectionNetwork /> : null}
      </div>

      {!mini ? (
        <>
          <button
            type="button"
            className="absolute right-5 top-5 z-10 flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/90 ring-1 ring-white/10 backdrop-blur-md"
          >
            <Globe className="h-3.5 w-3.5 text-white/80" />
            English
            <ChevronDown className="h-3 w-3 text-white/60" />
          </button>

          <TestimonialCarousel className="absolute bottom-4 left-4 right-4 z-10" />
        </>
      ) : null}
    </div>
  );
}
