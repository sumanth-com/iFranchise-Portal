"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Megaphone,
  Users,
  UserPlus,
} from "lucide-react";

import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ACTIONS = [
  {
    title: "Review Pending Brands",
    description: "Evaluate submissions and move qualified franchises forward.",
    href: "/admin/reviews",
    icon: Building2,
    accent: "from-violet-600 to-indigo-600",
  },
  {
    title: "Manage Team",
    description: "Invite operators, assign roles, and keep coverage strong.",
    href: "/admin/team",
    icon: Users,
    accent: "from-slate-800 to-slate-600",
  },
  {
    title: "View Leads",
    description: "Follow up on inbound interest and prioritize hot prospects.",
    href: "/admin/leads",
    icon: UserPlus,
    accent: "from-emerald-600 to-teal-600",
  },
  {
    title: "Send Announcement",
    description: "Share updates with brand owners and internal stakeholders.",
    href: "/admin/notifications",
    icon: Megaphone,
    accent: "from-amber-500 to-orange-600",
  },
] as const;

export function ExecutivePriorityActions() {
  return (
    <motion.section {...fadeUp} className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Priority actions
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
          What needs your attention
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div
                className={cn(
                  "mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                  action.accent,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {action.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {action.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 transition-colors group-hover:text-violet-800">
                Open
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </motion.section>
  );
}
