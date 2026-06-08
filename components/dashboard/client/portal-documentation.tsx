"use client";

import type { ReactNode } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Eye,
  LayoutDashboard,
  Plus,
  Settings,
  Store,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type PortalDocumentationProps = {
  variant?: "page" | "embedded";
  onBack?: () => void;
  className?: string;
};

const TOC = [
  { id: "about", label: "What is iFranchise?" },
  { id: "portal", label: "Brand Owner Portal" },
  { id: "workflow", label: "How listings work" },
  { id: "sections", label: "Portal sections" },
  { id: "review", label: "Review & approval" },
  { id: "marketplace", label: "Marketplace preview" },
  { id: "notifications", label: "Notifications" },
  { id: "settings", label: "Settings & account" },
  { id: "best-practices", label: "Best practices" },
  { id: "faq", label: "Common questions" },
] as const;

const BRAND_STATUSES = [
  {
    status: "Draft",
    meaning:
      "Your listing is private. Only you can see and edit it. Build every section before submitting.",
  },
  {
    status: "Submitted",
    meaning:
      "Your brand is in the iFranchise review queue. Our team checks completeness, accuracy, and presentation.",
  },
  {
    status: "Changes requested",
    meaning:
      "A reviewer needs updates. Read the feedback in Notifications, make edits, and resubmit.",
  },
  {
    status: "Approved",
    meaning:
      "Your listing passed review and can appear on the iFranchise marketplace for franchise investors.",
  },
  {
    status: "Rejected",
    meaning:
      "The listing did not meet requirements. Review admin feedback and contact support if you need clarity.",
  },
] as const;

const PORTAL_SECTIONS = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    body: "Your command center. See brand health, review progress, recent activity, and key stats at a glance. Use it daily to track where each listing stands.",
  },
  {
    icon: Plus,
    title: "Create Brand",
    body: "Start a new franchise listing. You’ll walk through business details, visuals, investment numbers, franchise model, locations, and documents step by step.",
  },
  {
    icon: Store,
    title: "My Brands",
    body: "Manage all your listings in one place — grid or list view. Open any brand to edit, submit, preview, or track status.",
  },
  {
    icon: Eye,
    title: "Marketplace Preview",
    body: "See exactly how investors will view your brand on iFranchise — layout, copy, gallery, and investment highlights. Always preview before you submit.",
  },
  {
    icon: Bell,
    title: "Notifications",
    body: "Review updates, approval messages, and change requests land here. Treat it like your inbox — respond quickly to keep momentum.",
  },
  {
    icon: Settings,
    title: "Settings",
    body: "Update your profile, account security, portal preferences (theme, layout), and access Help & Support including this documentation.",
  },
] as const;

const FAQ = [
  {
    q: "Who can see my brand before approval?",
    a: "Only you and the iFranchise review team. Draft and in-review listings are not public on the marketplace.",
  },
  {
    q: "Can I edit after I submit?",
    a: "You may have a short edit window right after submission. Once review advances, wait for feedback or approval before making major changes.",
  },
  {
    q: "What do reviewers look for?",
    a: "Complete profiles, accurate investment data, professional images, clear franchise model, and a compelling story that serious buyers can trust.",
  },
  {
    q: "How do I go live on the marketplace?",
    a: "Finish every section, preview your listing, submit for review, and address any change requests. Approval unlocks marketplace visibility.",
  },
  {
    q: "Where do I get help?",
    a: "Use Live chat or Email support from Help & Support in Settings, or reach support@ifranchise.com for account and listing questions.",
  },
] as const;

function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

export function PortalDocumentation({
  variant = "page",
  onBack,
  className,
}: PortalDocumentationProps) {
  const embedded = variant === "embedded";

  return (
    <div className={cn("space-y-8", className)}>
      {embedded && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6D28D9] transition-colors hover:text-[#5B21B6]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Help & Support
        </button>
      ) : null}

      <header className="rounded-2xl border border-[#6D28D9]/15 bg-gradient-to-br from-[#F5F3FF] via-white to-[#EEF2FF] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6D28D9]">
          iFranchise Documentation
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Brand Owner Portal Guide
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Everything you need to list, manage, and launch your franchise brand on
          iFranchise — from your first draft to marketplace approval.
        </p>
      </header>

      <nav
        aria-label="Documentation contents"
        className="rounded-xl border border-slate-200 bg-white p-5"
      >
        <p className="text-sm font-semibold text-slate-900">On this page</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {TOC.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="text-sm text-[#6D28D9] hover:underline"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-10">
        <DocSection id="about" title="What is iFranchise?">
          <p>
            <strong className="text-slate-800">iFranchise</strong> is a franchise
            marketplace that connects proven brands with serious franchise
            investors. As a brand owner, you use the portal to build a professional
            listing, submit it for quality review, and — once approved — present
            your opportunity to buyers exploring expansion options.
          </p>
          <p>
            Think of iFranchise as your digital storefront: the portal is where you
            stock the shelves (content, photos, numbers), and the marketplace is
            where investors browse when your listing goes live.
          </p>
        </DocSection>

        <DocSection id="portal" title="Brand Owner Portal">
          <p>
            The <strong className="text-slate-800">Brand Owner Portal</strong> is
            your private workspace. Sign in to create listings, upload assets,
            track review status, and preview how your brand appears to the world.
          </p>
          <p>
            The purple header shows you are in the portal. Use the left sidebar on
            desktop (or the bottom navigation on mobile) to move between sections.
            Your profile menu in the top right shows your name, role, and logout.
          </p>
        </DocSection>

        <DocSection id="workflow" title="How listings work">
          <p>Every brand on iFranchise follows a clear lifecycle:</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <strong className="text-slate-800">Create</strong> — Start from Create
              Brand and fill in business, visual, and financial details.
            </li>
            <li>
              <strong className="text-slate-800">Preview</strong> — Open
              Marketplace Preview and read your listing like an investor would.
            </li>
            <li>
              <strong className="text-slate-800">Submit</strong> — Send your
              complete listing into the iFranchise review queue.
            </li>
            <li>
              <strong className="text-slate-800">Review</strong> — Our team
              validates accuracy, completeness, and presentation quality.
            </li>
            <li>
              <strong className="text-slate-800">Go live</strong> — Approved brands
              can appear on the public iFranchise marketplace.
            </li>
          </ol>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">What it means</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {BRAND_STATUSES.map((row) => (
                  <tr key={row.status}>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {row.status}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocSection>

        <DocSection id="sections" title="Portal sections">
          <p>Each area of the portal has a specific job in your listing journey:</p>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {PORTAL_SECTIONS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <span className="dash-on-color flex h-9 w-9 items-center justify-center rounded-lg bg-[#6D28D9]">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </DocSection>

        <DocSection id="review" title="Review & approval">
          <p>
            iFranchise reviewers act as quality gatekeepers — similar to how a CEO
            or franchise judge would evaluate a pitch. They check that your listing
            tells a coherent story, uses real numbers, and looks professional
            enough for serious capital.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Business name, industry, description, and contact details</li>
            <li>Logo, gallery, and store or product photography</li>
            <li>Investment range, franchise fee, space requirements, and ROI</li>
            <li>Franchise model, territories, and expansion plans</li>
            <li>Supporting documents where applicable</li>
          </ul>
          <p>
            If something is missing or unclear, you will receive{" "}
            <strong className="text-slate-800">changes requested</strong> with
            specific feedback. Fix the items, resubmit, and your listing re-enters
            the queue.
          </p>
        </DocSection>

        <DocSection id="marketplace" title="Marketplace preview">
          <p>
            Marketplace Preview is one of the most important tools in the portal.
            It renders your brand the same way franchise investors see it —
            headline, highlights, gallery, about section, investment block, and
            support details.
          </p>
          <p>
            Use preview mode before every submission. Ask yourself: Would I invest
            based on this page? If the answer is not an immediate yes, keep
            refining copy, images, and numbers until it is.
          </p>
        </DocSection>

        <DocSection id="notifications" title="Notifications">
          <p>
            Notifications is your activity inbox inside the portal. Submission
            confirmations, review outcomes, and change requests all appear here
            with clear messages tied to your brands.
          </p>
          <p>
            Enable approval and activity alerts in Settings → Preferences so you
            never miss a reviewer message. Fast responses shorten your time to
            approval.
          </p>
        </DocSection>

        <DocSection id="settings" title="Settings & account">
          <p>In Settings you can manage:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-slate-800">Profile</strong> — Name, photo,
              and public-facing owner details
            </li>
            <li>
              <strong className="text-slate-800">Account</strong> — Email,
              password, and security
            </li>
            <li>
              <strong className="text-slate-800">Preferences</strong> — Theme,
              dashboard layout, brand grid/list view, and notification filters
            </li>
            <li>
              <strong className="text-slate-800">Help & Support</strong> — Live
              chat, this documentation, email support, and quick tips
            </li>
          </ul>
        </DocSection>

        <DocSection id="best-practices" title="Best practices">
          <div className="space-y-3">
            {[
              "Write for investors, not insiders — explain your concept in plain language.",
              "Use high-quality, well-lit photos; blurry assets signal an unready brand.",
              "Keep financial figures consistent across every section of your listing.",
              "Preview on mobile and desktop — many buyers browse on their phone first.",
              "Submit once, submit right — incomplete drafts are the top reason reviews stall.",
            ].map((tip) => (
              <div key={tip} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </DocSection>

        <DocSection id="faq" title="Common questions">
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">{item.q}</p>
                <p className="mt-2 text-sm text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </DocSection>
      </div>

      {!embedded ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
          <p className="text-sm text-slate-600">Still need help?</p>
          <Link
            href="/dashboard/settings"
            className="mt-2 inline-flex text-sm font-semibold text-[#6D28D9] hover:underline"
          >
            Go to Settings → Help & Support
          </Link>
        </div>
      ) : null}
    </div>
  );
}
