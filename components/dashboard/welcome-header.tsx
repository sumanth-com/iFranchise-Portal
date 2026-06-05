"use client";

import { motion } from "framer-motion";

import { fadeUp } from "@/lib/motion";
import { getGreeting } from "@/lib/utils";

type WelcomeHeaderProps = {
  name?: string | null;
  subtitle: string;
};

export function WelcomeHeader({ name, subtitle }: WelcomeHeaderProps) {
  return (
    <motion.div {...fadeUp} transition={{ duration: 0.35 }} className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
        Workspace
      </p>
      <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
        {getGreeting(name)}
      </h2>
      <p className="max-w-xl text-sm text-slate-500 sm:text-base">{subtitle}</p>
    </motion.div>
  );
}
