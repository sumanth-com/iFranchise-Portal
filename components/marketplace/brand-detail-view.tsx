import Image from "next/image";
import { Globe, Mail, MapPin, Phone, TrendingUp } from "lucide-react";

import { InquiryForm } from "@/components/marketplace/inquiry-form";
import { formatInvestmentRange } from "@/lib/marketplace/format";
import type { PublicBrandDetail } from "@/types/api/public-brand";

type BrandDetailViewProps = {
  brand: PublicBrandDetail;
};

export function BrandDetailView({ brand }: BrandDetailViewProps) {
  const cities = [
    ...new Set([...(brand.targetCities ?? []), ...(brand.existingCities ?? [])]),
  ];

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-2">
          <div className="relative aspect-[4/3] bg-slate-100 lg:aspect-auto lg:min-h-[360px]">
            {brand.gallery[0]?.url || brand.logo?.url ? (
              <Image
                src={brand.gallery[0]?.url ?? brand.logo!.url}
                alt={brand.businessName}
                fill
                unoptimized
                className="object-cover"
                priority
              />
            ) : null}
          </div>
          <div className="p-8">
            {brand.industry ? (
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                {brand.industry}
              </span>
            ) : null}
            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              {brand.businessName}
            </h1>
            {brand.tagline ? (
              <p className="mt-2 text-lg text-slate-600">{brand.tagline}</p>
            ) : null}
            <div className="mt-6 grid gap-3 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary-600" />
                {formatInvestmentRange(brand.investmentMin, brand.investmentMax)}
              </p>
              {brand.franchiseFee != null ? (
                <p>Franchise fee: ₹{brand.franchiseFee.toLocaleString("en-IN")}</p>
              ) : null}
              {brand.roiPercent != null ? (
                <p>Expected ROI: {brand.roiPercent}%</p>
              ) : null}
              {cities.length > 0 ? (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  {cities.join(", ")}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {brand.description ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">About the brand</h2>
          <p className="mt-4 whitespace-pre-wrap text-slate-600 leading-relaxed">
            {brand.description}
          </p>
        </section>
      ) : null}

      {brand.gallery.length > 1 ? (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Gallery</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brand.gallery.slice(1).map((img) => (
              <div
                key={img.id}
                className="relative aspect-video overflow-hidden rounded-xl bg-slate-100"
              >
                <Image
                  src={img.url}
                  alt={img.fileName}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <InquiryForm brandId={brand.id} brandName={brand.businessName} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {brand.contact.email ? (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary-600" />
                  {brand.contact.email}
                </li>
              ) : null}
              {brand.contact.phone ? (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary-600" />
                  {brand.contact.phone}
                </li>
              ) : null}
              {brand.contact.websiteUrl ? (
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary-600" />
                  <a
                    href={brand.contact.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    Website
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
