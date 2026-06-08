"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { resolveFirstName } from "@/lib/utils";

type TopbarGreetingProps = {
  displayName: string;
  email: string;
};

export function TopbarGreetingCarousel({
  displayName,
  email,
}: TopbarGreetingProps) {
  const firstName = resolveFirstName(displayName, email);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20 backdrop-blur-sm"
        aria-hidden
      >
        <motion.span
          className="absolute inset-0 rounded-lg bg-white/10"
          animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.06, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <Sparkles className="relative h-4 w-4 text-white" strokeWidth={2} />
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.06,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="min-w-0 truncate text-[15px] font-semibold leading-tight tracking-tight text-white sm:text-base"
      >
        Welcome to{" "}
        <span className="topbar-brand-shimmer font-bold">iFranchise</span>,{" "}
        {firstName}
      </motion.h1>
    </div>
  );
}
