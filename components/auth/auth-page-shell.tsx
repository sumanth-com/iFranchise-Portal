"use client";

import type { ReactNode } from "react";

import { AuthEarthPanel } from "@/components/auth/auth-earth-panel";
import { Logo } from "@/components/ui/logo";

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-white px-4 py-5 sm:px-8 sm:py-6">
      <div className="relative z-10 flex h-[min(760px,92dvh)] w-full max-w-[1180px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        {/* Left: Authentication */}
        <section className="flex min-h-0 w-full flex-col justify-center overflow-hidden px-6 py-6 sm:px-9 sm:py-7 lg:w-1/2 lg:px-11">
          <div className="mb-5 lg:hidden">
            <div className="h-[120px] w-full overflow-hidden rounded-[20px] bg-[#070b14]">
              <AuthEarthPanel mini className="h-full w-full" />
            </div>
          </div>

          <div className="mb-5 shrink-0">
            <Logo size="md" />
            <p className="mt-2 text-sm text-slate-500">
              Join the iFranchise ecosystem
            </p>
          </div>

          <div className="min-h-0 w-full overflow-hidden">{children}</div>
        </section>

        {/* Right: Earth panel — sharp clean split, no gap */}
        <aside className="relative hidden min-h-0 overflow-hidden bg-[#060d1a] lg:block lg:w-1/2">
          <AuthEarthPanel className="h-full w-full" />
        </aside>
      </div>
    </div>
  );
}
