"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function EarthLoader({ mini = false }: { mini?: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center",
        mini ? "bg-transparent" : "bg-[#060d1a]",
      )}
    >
      <motion.div
        className={cn(
          "rounded-full border-2 border-white/10 border-t-[#6366F1]",
          mini ? "h-8 w-8" : "h-10 w-10",
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
