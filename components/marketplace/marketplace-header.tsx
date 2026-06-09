import Link from "next/link";
import { Building2 } from "lucide-react";

export function MarketplaceHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/franchises" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Building2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">iFranchise</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Marketplace
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-primary-600"
          >
            Brand login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            List your brand
          </Link>
        </div>
      </div>
    </header>
  );
}
