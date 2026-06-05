import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import { MarketplaceListing } from "@/components/dashboard/client/marketplace-listing";
import { getDashboardContext } from "@/lib/dashboard/context";
import { buildMarketplaceListing } from "@/lib/dashboard/listing-data";

export default async function BrandPreviewPage() {
  const { brand, assets } = await getDashboardContext();
  const listing = buildMarketplaceListing(brand, assets);

  return (
    <div className="space-y-6 text-black">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-black hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <h2 className="mt-3 text-2xl font-bold text-black sm:text-3xl">
            Brand Preview
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-black">
            Read-only preview of how your franchise listing will appear on the
            iFranchise marketplace.
          </p>
        </div>
        <Link
          href="/dashboard/onboarding?step=1"
          className="inline-flex items-center gap-2 rounded-xl border border-black bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-neutral-100"
        >
          <Pencil className="h-4 w-4" />
          Edit Brand
        </Link>
      </div>

      <GlassCard padding="lg" className="text-black">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full border border-black px-3 py-1 text-xs font-semibold text-black">
            Marketplace Preview Mode
          </span>
          <span className="text-xs text-black">Read only</span>
        </div>
        <MarketplaceListing listing={listing} variant="full" />
      </GlassCard>

      {!brand ? (
        <p className="rounded-xl border border-neutral-400 bg-neutral-100 px-4 py-3 text-sm text-black">
          Showing sample listing data. Create your brand profile to preview your
          actual franchise listing.
        </p>
      ) : null}
    </div>
  );
}
