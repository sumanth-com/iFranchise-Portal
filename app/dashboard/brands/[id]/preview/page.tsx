import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PremiumMarketplaceListing } from "@/components/dashboard/client/premium-marketplace-listing";
import { requireClient } from "@/lib/auth/session";
import { getBrandWithAssets } from "@/lib/dashboard/context";
import { buildMarketplaceListing } from "@/lib/dashboard/listing-data";

type BrandPreviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BrandPreviewPage({ params }: BrandPreviewPageProps) {
  const { id } = await params;
  const profile = await requireClient();
  const { data, error } = await getBrandWithAssets(profile.id, id);

  if (!data) {
    if (error) {
      return (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      );
    }
    notFound();
  }

  const { brand, assets } = data;
  const listing = buildMarketplaceListing(brand, assets);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/brands"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#6D28D9]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Brands
      </Link>

      <PremiumMarketplaceListing listing={listing} brand={brand} assets={assets} />
    </div>
  );
}
