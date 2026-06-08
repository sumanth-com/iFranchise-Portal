"use client";

import Link from "next/link";
import {
  Eye,
  Headphones,
  MessageSquare,
  PlusCircle,
  Store,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import { cn } from "@/lib/utils";

const ACTIONS: {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  primary?: boolean;
}[] = [
  {
    href: "/dashboard/brands/new",
    label: "Create Brand",
    description: "Start a new franchise listing",
    icon: PlusCircle,
    primary: true,
  },
  {
    href: "/dashboard/brands",
    label: "View My Brands",
    description: "Manage your portfolio",
    icon: Store,
  },
  {
    href: "/dashboard/marketplace-preview",
    label: "Marketplace Preview",
    description: "See how investors view you",
    icon: Eye,
  },
  {
    href: "/dashboard/support",
    label: "Contact Support",
    description: "Get help from our team",
    icon: Headphones,
  },
  {
    href: "/dashboard/messages",
    label: "View Messages",
    description: "Admin & review updates",
    icon: MessageSquare,
  },
];

export function DashboardQuickActions() {
  return (
    <GlassCard padding="lg">
      <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
      <p className="mt-0.5 text-sm text-slate-500">
        Jump to common workflows
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {ACTIONS.map(({ href, label, description, icon: Icon, primary }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-start gap-3 rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
              primary
                ? "border-[#6D28D9]/25 bg-gradient-to-br from-[#6D28D9]/8 to-[#6D28D9]/3 hover:border-[#6D28D9]/40"
                : "border-slate-200 bg-white hover:border-slate-300",
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
                primary
                  ? "bg-[#6D28D9] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 group-hover:bg-[#6D28D9]/10 group-hover:text-[#6D28D9]",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}
