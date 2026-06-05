"use client";

import { motion } from "framer-motion";
import { ImageIcon, FileText, Percent } from "lucide-react";

import { Card } from "@/components/ui/card";
import { staggerContainer, staggerItem } from "@/lib/motion";

type StatCardsProps = {
  profileComplete: number;
  hasLogo: boolean;
  galleryCount: number;
};

export function StatCards({
  profileComplete,
  hasLogo,
  galleryCount,
}: StatCardsProps) {
  const stats = [
    {
      label: "Profile complete",
      value: `${profileComplete}%`,
      icon: Percent,
      highlight: true,
    },
    {
      label: "Logo",
      value: hasLogo ? "Ready" : "Pending",
      icon: FileText,
    },
    {
      label: "Gallery images",
      value: String(galleryCount),
      icon: ImageIcon,
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid gap-4 sm:grid-cols-3"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} animate className="!p-5">
            <div className="flex items-center gap-4">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  stat.highlight
                    ? "bg-gradient-to-br from-[#6D28D9] to-[#A78BFA] text-white"
                    : "bg-primary-50 text-primary-600"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </motion.div>
  );
}
