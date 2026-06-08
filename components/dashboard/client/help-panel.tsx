"use client";

import Link from "next/link";
import { BookOpen, LifeBuoy, MessageCircle } from "lucide-react";

import { GlassCard } from "@/components/dashboard/client/glass-card";

const LINKS = [
  {
    href: "/dashboard/support",
    label: "Chat Support",
    icon: MessageCircle,
    description: "Talk to our franchise team",
  },
  {
    href: "/dashboard/documentation",
    label: "Documentation",
    icon: BookOpen,
    description: "Guides for brand onboarding",
  },
  {
    href: "/dashboard/support#contact",
    label: "Contact Team",
    icon: LifeBuoy,
    description: "Email support@ifranchise.in",
  },
];

export function HelpPanel() {
  return (
    <GlassCard padding="lg" className="text-black">
      <h3 className="text-lg font-semibold text-black">Need help?</h3>
      <p className="mt-1 text-sm text-black">
        We&apos;re here to help you launch on iFranchise
      </p>

      <ul className="mt-5 space-y-2">
        {LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center gap-3 rounded-xl border border-neutral-300 bg-white p-3 transition-colors hover:bg-white"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-300 bg-white text-black">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-black">
                    {link.label}
                  </span>
                  <span className="text-xs text-black">{link.description}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
