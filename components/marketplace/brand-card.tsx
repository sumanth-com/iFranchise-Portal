import Image from "next/image";
import Link from "next/link";
import { MapPin, TrendingUp } from "lucide-react";

import type { PublicBrandSummary } from "@/types/api/public-brand";
import { formatInvestmentRange } from "@/lib/marketplace/format";

type BrandCardProps = {
  brand: PublicBrandSummary;
};

export function BrandCard({ brand }: BrandCardProps) {
  const href = `/franchises/${brand.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] bg-slate-100">
        {brand.logo?.url ? (
          <Image
            src={brand.logo.url}
            alt={brand.businessName}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No image
          </div>
        )}
        {brand.industry ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 backdrop-blur-sm">
            {brand.industry}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-600">
          {brand.businessName}
        </h3>
        {brand.tagline ? (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{brand.tagline}</p>
        ) : null}
        <div className="mt-4 space-y-2 text-xs text-slate-500">
          {brand.investmentMin != null || brand.investmentMax != null ? (
            <p className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary-600" />
              {formatInvestmentRange(brand.investmentMin, brand.investmentMax)}
            </p>
          ) : null}
          {(brand.targetCities?.length ?? 0) > 0 ? (
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary-600" />
              {brand.targetCities!.slice(0, 2).join(", ")}
              {(brand.targetCities?.length ?? 0) > 2
                ? ` +${brand.targetCities!.length - 2}`
                : ""}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
