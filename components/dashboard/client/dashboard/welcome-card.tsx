"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { getGreeting } from "@/lib/utils";

type WelcomeCardProps = {
  name?: string | null;
  brandCount: number;
  reviewLabel: string;
};

export function DashboardWelcomeCard({
  name,
  brandCount,
  reviewLabel,
}: WelcomeCardProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6D28D9] via-[#5B21B6] to-[#4F46E5] p-6 text-white shadow-[0_16px_48px_rgba(109,40,217,0.32)] sm:p-8">
      <div className="relative z-10">
        <p className="text-sm font-medium text-white/80">Brand Owner Portal</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {getGreeting(name)}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
          Manage your franchise portfolio and track your listing progress.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold backdrop-blur-sm">
            {brandCount} brand{brandCount === 1 ? "" : "s"}
          </span>
          <span className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold backdrop-blur-sm">
            {reviewLabel}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard/brands/new"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#6D28D9] shadow-lg transition-transform duration-200 hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            Create Brand
          </Link>
          <Link
            href="/dashboard/brands"
            className="inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors duration-200 hover:bg-white/20"
          >
            View My Brands
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
    </section>
  );
}
