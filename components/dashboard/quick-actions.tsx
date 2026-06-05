"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Images, Send } from "lucide-react";

import { staggerContainer, staggerItem } from "@/lib/motion";

const actions = [
  { href: "#profile", label: "Edit profile", icon: FileText },
  { href: "#assets", label: "Upload assets", icon: Images },
  { href: "#profile", label: "Submit brand", icon: Send },
];

export function QuickActions() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid gap-3 sm:grid-cols-3"
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <motion.div key={action.label} variants={staggerItem}>
            <Link
              href={action.href}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)] transition-all hover:border-primary-200 hover:bg-primary-50/50 hover:shadow-[var(--shadow-md)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-foreground">
                {action.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
