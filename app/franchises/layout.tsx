import type { ReactNode } from "react";

import { MarketplaceHeader } from "@/components/marketplace/marketplace-header";

export default function FranchisesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-50">
      <MarketplaceHeader />
      <main>{children}</main>
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} iFranchise — India&apos;s franchise marketplace
      </footer>
    </div>
  );
}
