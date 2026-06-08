"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Globe,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { Brand } from "@/types/brand";

type BrandSubmissionSuccessProps = {
  brand: Brand;
};

const STEPS = [
  { label: "Submitted", icon: CheckCircle2, done: true },
  { label: "Review", icon: ClipboardCheck, done: false },
  { label: "Approval", icon: ShieldCheck, done: false },
  { label: "Live", icon: Globe, done: false },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 420, damping: 32 },
  },
};

export function BrandSubmissionSuccess({ brand }: BrandSubmissionSuccessProps) {
  return (
    <motion.div
      className="mx-auto w-full max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_48px_rgba(15,23,42,0.07)] sm:rounded-3xl">
        <motion.div
          className="relative px-5 py-6 text-center sm:px-8 sm:py-7"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#6D28D9]/8 via-white to-emerald-50/40"
            aria-hidden
          />

          <motion.div variants={item} className="relative">
            <motion.div
              className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 sm:h-16 sm:w-16"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.05 }}
            >
              <motion.span
                className="absolute inset-0 rounded-2xl bg-emerald-400/20"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.35, opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              <Sparkles className="h-7 w-7 sm:h-8 sm:w-8" />
            </motion.div>
          </motion.div>

          <motion.h1
            variants={item}
            className="relative mt-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
          >
            Brand Submitted Successfully
          </motion.h1>

          <motion.p
            variants={item}
            className="relative mx-auto mt-2 max-w-lg text-sm leading-snug text-slate-600"
          >
            <strong className="text-slate-900">{brand.business_name}</strong> is in review.
            We&apos;ll notify you when it&apos;s approved for the marketplace.
          </motion.p>
        </motion.div>

        <div className="border-t border-slate-100 px-5 py-5 sm:px-8 sm:py-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500"
          >
            What happens next
          </motion.p>

          <motion.ol
            className="mt-3 grid grid-cols-4 gap-2 sm:gap-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {STEPS.map((step, index) => (
              <motion.li
                key={step.label}
                variants={item}
                className="flex flex-col items-center text-center"
              >
                <div className="flex w-full items-center justify-center">
                  {index > 0 ? (
                    <span
                      className={`mr-1 hidden h-px flex-1 sm:block ${
                        step.done ? "bg-emerald-300" : "bg-slate-200"
                      }`}
                      aria-hidden
                    />
                  ) : null}
                  <span
                    className={
                      step.done
                        ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-2 ring-emerald-200/80 sm:h-10 sm:w-10"
                        : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 sm:h-10 sm:w-10"
                    }
                  >
                    <step.icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  </span>
                  {index < STEPS.length - 1 ? (
                    <span
                      className="ml-1 hidden h-px flex-1 bg-slate-200 sm:block"
                      aria-hidden
                    />
                  ) : null}
                </div>
                <p
                  className={`mt-1.5 text-[10px] font-semibold leading-tight sm:text-xs ${
                    step.done ? "text-emerald-700" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </p>
              </motion.li>
            ))}
          </motion.ol>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.35 }}
            className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-center sm:text-left">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Estimated review
              </p>
              <p className="text-base font-bold text-slate-900">1–3 business days</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/dashboard/brands"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#5B21B6]"
              >
                My Brands
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/dashboard/brands/${brand.id}/preview`}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
              >
                Preview Listing
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
