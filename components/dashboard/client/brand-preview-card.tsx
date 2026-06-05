"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import { MarketplaceListing } from "@/components/dashboard/client/marketplace-listing";
import type { MarketplaceListingData } from "@/lib/dashboard/listing-data";

type BrandPreviewCardProps = {
  listing: MarketplaceListingData;
};

export function BrandPreviewCard({ listing }: BrandPreviewCardProps) {
  return (
    <GlassCard padding="lg" className="text-black">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-black">Brand Preview</h3>
          <p className="mt-1 text-sm text-black">
            How investors will see your listing
          </p>
        </div>
        <Link
          href="/dashboard/brand-preview"
          className="inline-flex items-center gap-2 rounded-xl border border-black bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-neutral-100"
        >
          <Eye className="h-3.5 w-3.5" />
          View Full Preview
        </Link>
      </div>

      <div className="mt-5">
        <MarketplaceListing listing={listing} variant="mini" />
      </div>
    </GlassCard>
  );
}
