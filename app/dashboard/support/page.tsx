import { BookOpen, LifeBuoy, Mail, MessageCircle } from "lucide-react";

import { GlassCard } from "@/components/dashboard/client/glass-card";

const SUPPORT_OPTIONS = [
  {
    id: "chat",
    icon: MessageCircle,
    title: "Chat Support",
    description:
      "Connect with our franchise onboarding team for real-time help with your listing.",
    action: "Start chat",
    href: "mailto:support@ifranchise.in?subject=Chat%20Support",
  },
  {
    id: "documentation",
    icon: BookOpen,
    title: "Documentation",
    description:
      "Step-by-step guides for brand profiles, asset uploads, investment details, and submission.",
    action: "View docs",
    href: "#documentation",
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact Team",
    description:
      "Email our team for account issues, review questions, or partnership inquiries.",
    action: "Email us",
    href: "mailto:support@ifranchise.in",
  },
];

export default function SupportPage() {
  return (
    <div className="space-y-6 text-black">
      <div>
        <h2 className="text-2xl font-bold text-black sm:text-3xl">Support</h2>
        <p className="mt-2 text-sm text-black">
          Get help launching your franchise on iFranchise.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {SUPPORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <GlassCard key={option.id} hover id={option.id} className="text-black">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-300 bg-neutral-100 text-black">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-black">
                {option.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-black">
                {option.description}
              </p>
              <a
                href={option.href}
                className="mt-4 inline-flex text-sm font-semibold text-black underline"
              >
                {option.action} →
              </a>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard padding="lg" className="flex items-start gap-4 text-black">
        <LifeBuoy className="h-6 w-6 shrink-0 text-black" />
        <div>
          <h3 className="font-semibold text-black">Priority support</h3>
          <p className="mt-1 text-sm text-black">
            Brands under review receive priority responses within 1 business day.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
