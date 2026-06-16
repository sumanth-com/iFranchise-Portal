/** Serializable nav config (safe to pass from Server → Client Components). */

export type NavIconName =
  | "layoutDashboard"
  | "sparkles"
  | "store"
  | "eye"
  | "messageSquare"
  | "bell"
  | "settings"
  | "lifeBuoy"
  | "building2"
  | "plus"
  | "clipboardList"
  | "users"
  | "bookOpen"
  | "trendingUp"
  | "shield";

export type NavItem = {
  href: string;
  label: string;
  icon: NavIconName;
  mobileLabel?: string;
  section?: string;
  children?: NavItem[];
};

export type ClientNavGroup = {
  label: string;
  items: NavItem[];
};

/** Brand Owner sidebar — Create Brand before My Brands for new-user flow. */
export const clientNavGroups: ClientNavGroup[] = [
  {
    label: "",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: "layoutDashboard",
        mobileLabel: "Home",
      },
      {
        href: "/dashboard/brands/new",
        label: "Create Brand",
        icon: "plus",
        mobileLabel: "Create",
      },
      {
        href: "/dashboard/brands",
        label: "My Brands",
        icon: "store",
        mobileLabel: "Brands",
      },
      {
        href: "/dashboard/marketplace-preview",
        label: "Live Listing",
        icon: "eye",
        mobileLabel: "Listing",
      },
      {
        href: "/dashboard/notifications",
        label: "Notifications",
        icon: "bell",
        mobileLabel: "Alerts",
      },
      {
        href: "/dashboard/leads",
        label: "Leads",
        icon: "messageSquare",
        mobileLabel: "Leads",
      },
      {
        href: "/dashboard/settings",
        label: "Settings",
        icon: "settings",
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        href: "/dashboard/blog",
        label: "Blog",
        icon: "bookOpen",
        mobileLabel: "Blog",
      },
      {
        href: "/dashboard/growth-hub",
        label: "Growth Hub",
        icon: "trendingUp",
        mobileLabel: "Growth",
      },
    ],
  },
];

export const clientNav: NavItem[] = clientNavGroups.flatMap((g) => g.items);

export const adminNavGroups: ClientNavGroup[] = [
  {
    label: "",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: "layoutDashboard",
        mobileLabel: "Home",
      },
      {
        href: "/admin/reviews",
        label: "Review Queue",
        icon: "clipboardList",
        mobileLabel: "Queue",
      },
      {
        href: "/admin/brands",
        label: "All Brands",
        icon: "building2",
        mobileLabel: "Brands",
      },
      {
        href: "/admin/notifications",
        label: "Notifications",
        icon: "bell",
        mobileLabel: "Alerts",
      },
      {
        href: "/admin/leads",
        label: "Leads",
        icon: "messageSquare",
        mobileLabel: "Leads",
      },
      {
        href: "/admin/admin-management",
        label: "Command Center",
        icon: "shield",
        mobileLabel: "Command",
      },
      {
        href: "/admin/auth-diagnostics",
        label: "Auth diagnostics",
        icon: "settings",
        mobileLabel: "Auth",
      },
      {
        href: "/admin/team",
        label: "Team",
        icon: "users",
        mobileLabel: "Team",
      },
    ],
  },
];

export const adminNav: NavItem[] = adminNavGroups.flatMap((g) => g.items);
