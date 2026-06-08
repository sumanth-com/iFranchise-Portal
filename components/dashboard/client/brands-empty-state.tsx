"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Plus, Sparkles, Store } from "lucide-react";

export function BrandsEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white px-6 py-16 text-center shadow-[0_8px_40px_rgba(15,23,42,0.06)] sm:px-12 sm:py-20"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#6D28D9]/5 via-white to-emerald-50/30"
        aria-hidden
      />

      <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] text-white shadow-[0_12px_32px_rgba(109,40,217,0.35)]">
        <Store className="h-9 w-9" />
      </div>

      <div className="relative mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#6D28D9]/10 px-3 py-1 text-xs font-semibold text-[#6D28D9]">
        <Sparkles className="h-3.5 w-3.5" />
        Franchise marketplace
      </div>

      <h2 className="relative mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Create your first brand listing
      </h2>
      <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
        Launch a premium franchise profile, upload assets, and submit for review.
        Your listing appears here instantly after submission.
      </p>

      <Link
        href="/dashboard/brands/new"
        className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-[#6D28D9] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(109,40,217,0.35)] transition-all hover:bg-[#5B21B6] hover:shadow-[0_12px_32px_rgba(109,40,217,0.4)]"
      >
        <Plus className="h-4 w-4" />
        Create Your First Brand
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  );
}
