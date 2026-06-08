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
  | "trendingUp";

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
