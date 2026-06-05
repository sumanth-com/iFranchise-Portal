/** Serializable nav config (safe to pass from Server → Client Components). */

import type { SectionKey } from "@/lib/dashboard/section-completion";

export type NavIconName =
  | "layoutDashboard"
  | "building2"
  | "images"
  | "clipboardList"
  | "users"
  | "wallet"
  | "network"
  | "globe"
  | "fileText"
  | "send"
  | "bell"
  | "settings"
  | "barChart"
  | "eye"
  | "mapPin"
  | "clock"
  | "lifeBuoy";

export type NavItem = {
  href: string;
  label: string;
  icon: NavIconName;
  mobileLabel?: string;
  section?: string;
  completionKey?: SectionKey;
};

export type ClientNavGroup = {
  label: string;
  items: NavItem[];
};

export const clientNavGroups: ClientNavGroup[] = [
  {
    label: "",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: "layoutDashboard",
        mobileLabel: "Home",
        section: "main",
        completionKey: "dashboard",
      },
    ],
  },
  {
    label: "Brand Management",
    items: [
      {
        href: "/dashboard/onboarding?step=1",
        label: "My Brand",
        icon: "building2",
        mobileLabel: "Brand",
        section: "brand",
        completionKey: "my_brand",
      },
      {
        href: "/dashboard/brand-preview",
        label: "Brand Preview",
        icon: "eye",
        section: "brand",
        completionKey: "brand_preview",
      },
      {
        href: "/dashboard/onboarding?step=2",
        label: "Assets",
        icon: "images",
        section: "brand",
        completionKey: "assets",
      },
      {
        href: "/dashboard/onboarding?step=8",
        label: "Documents",
        icon: "fileText",
        section: "brand",
        completionKey: "documents",
      },
    ],
  },
  {
    label: "Business Details",
    items: [
      {
        href: "/dashboard/onboarding?step=3",
        label: "Investment",
        icon: "wallet",
        section: "business",
        completionKey: "investment",
      },
      {
        href: "/dashboard/onboarding?step=4",
        label: "Franchise Model",
        icon: "network",
        section: "business",
        completionKey: "franchise_model",
      },
      {
        href: "/dashboard/onboarding?step=6",
        label: "Expansion Plan",
        icon: "globe",
        section: "business",
        completionKey: "expansion",
      },
      {
        href: "/dashboard/onboarding?step=5",
        label: "Locations",
        icon: "mapPin",
        section: "business",
        completionKey: "locations",
      },
    ],
  },
  {
    label: "Submission",
    items: [
      {
        href: "/dashboard/onboarding?step=9",
        label: "Review & Submit",
        icon: "send",
        mobileLabel: "Submit",
        section: "submission",
        completionKey: "review_submit",
      },
    ],
  },
  {
    label: "Activity",
    items: [
      {
        href: "/dashboard/notifications",
        label: "Notifications",
        icon: "bell",
        mobileLabel: "Alerts",
        section: "activity",
        completionKey: "notifications",
      },
      {
        href: "/dashboard/timeline",
        label: "Timeline",
        icon: "clock",
        section: "activity",
        completionKey: "timeline",
      },
      {
        href: "/dashboard/support",
        label: "Support",
        icon: "lifeBuoy",
        section: "activity",
        completionKey: "support",
      },
    ],
  },
  {
    label: "",
    items: [
      {
        href: "/dashboard/settings",
        label: "Settings",
        icon: "settings",
        section: "settings",
        completionKey: "settings",
      },
    ],
  },
];

/** Flat list for legacy/mobile compatibility */
export const clientNav: NavItem[] = clientNavGroups.flatMap((g) => g.items);

export const adminNav: NavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    icon: "layoutDashboard",
    mobileLabel: "Home",
  },
  {
    href: "/admin#queue",
    label: "Submissions",
    icon: "clipboardList",
    mobileLabel: "Queue",
  },
  {
    href: "/admin/team",
    label: "Team",
    icon: "users",
    mobileLabel: "Team",
  },
];
