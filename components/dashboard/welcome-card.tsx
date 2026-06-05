"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { fadeUp } from "@/lib/motion";
import { getGreeting } from "@/lib/utils";

type WelcomeCardProps = {
  name?: string | null;
  subtitle: string;
  showCta?: boolean;
};

export function WelcomeCard({ name, subtitle, showCta = true }: WelcomeCardProps) {
  return (
    <motion.div
      {...fadeUp}
      className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] p-6 text-white shadow-[var(--shadow-md)] sm:p-8"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative z-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          iFranchise Portal
        </span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          {getGreeting(name)}
        </h2>
        <p className="mt-2 max-w-lg text-sm text-white/85 sm:text-base">{subtitle}</p>
        {showCta ? (
          <Link
            href="#profile"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 shadow-sm transition-transform hover:scale-[1.02]"
          >
            Continue setup
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}
