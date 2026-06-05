"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus } from "lucide-react";

export function MobileFab() {
  return (
    <motion.div
      className="fixed bottom-20 right-4 z-40 lg:hidden"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 22 }}
    >
      <Link
        href="/dashboard/onboarding?step=1"
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#A78BFA] text-white shadow-[var(--shadow-glow)]"
        aria-label="Continue brand profile"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </motion.div>
  );
}
