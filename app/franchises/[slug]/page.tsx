import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BrandDetailView } from "@/components/marketplace/brand-detail-view";
import { getPublishedBrandBySlug } from "@/lib/public/brands";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedBrandBySlug(slug);
  if (!result.data) {
    return { title: "Brand not found | iFranchise" };
  }
  return {
    title: `${result.data.businessName} Franchise | iFranchise`,
    description:
      result.data.tagline ??
      result.data.description?.slice(0, 160) ??
      `Explore ${result.data.businessName} franchise opportunity on iFranchise.`,
    openGraph: {
      title: `${result.data.businessName} | iFranchise Marketplace`,
      description: result.data.tagline ?? undefined,
    },
  };
}

export default async function FranchiseDetailPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const result = await getPublishedBrandBySlug(slug);

  if (result.error === "SERVICE_UNAVAILABLE") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-slate-600">Marketplace is temporarily unavailable.</p>
      </div>
    );
  }

  if (!result.data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link
        href="/franchises"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to marketplace
      </Link>
      <div className="mt-6">
        <BrandDetailView brand={result.data} />
      </div>
    </div>
  );
}
