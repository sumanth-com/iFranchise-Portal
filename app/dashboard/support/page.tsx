import Link from "next/link";
import { Mail, MessageCircle, BookOpen } from "lucide-react";
import { redirect } from "next/navigation";

import { LegacyDocRedirect } from "@/components/dashboard/client/legacy-doc-redirect";
import { GlassCard } from "@/components/dashboard/client/glass-card";

const OPTIONS = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our support team during business hours.",
    href: "mailto:support@ifranchise.com?subject=Support%20Request",
    cta: "Start chat",
  },
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Full guide to iFranchise and the Brand Owner Portal.",
    href: "/dashboard/documentation",
    cta: "Browse docs",
  },
  {
    icon: Mail,
    title: "Contact Support",
    description: "Email us for account, billing, or listing questions.",
    href: "mailto:support@ifranchise.com",
    cta: "Send email",
  },
];

type SupportPageProps = {
  searchParams: Promise<{ section?: string }>;
};

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const params = await searchParams;
  if (params.section === "documentation") {
    redirect("/dashboard/documentation");
  }

  return (
    <div className="space-y-8">
      <LegacyDocRedirect />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6D28D9]">
          Help Center
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Support
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          We&apos;re here to help you manage your franchise listings.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <GlassCard key={opt.title} padding="lg" hover>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F3FF] text-[#6D28D9]">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-slate-900">
                {opt.title}
              </h2>
              <p className="mt-2 text-sm text-slate-500">{opt.description}</p>
              <Link
                href={opt.href}
                className="mt-4 inline-block text-sm font-semibold text-[#6D28D9] hover:underline"
              >
                {opt.cta} →
              </Link>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
