/** Serializable nav config (safe to pass from Server → Client Components). */

export type NavIconName =
  | "layoutDashboard"
  | "building2"
  | "plus"
  | "eye"
  | "messageSquare"
  | "bell"
  | "settings"
  | "lifeBuoy"
  | "store"
  | "clipboardList"
  | "users";

export type NavItem = {
  href: string;
  label: string;
  icon: NavIconName;
  mobileLabel?: string;
  section?: string;
  /** Nested items shown indented under this entry */
  children?: NavItem[];
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
      },
    ],
  },
  {
    label: "Brands",
    items: [
      {
        href: "/dashboard/brands",
        label: "My Brands",
        icon: "store",
        mobileLabel: "Brands",
      },
      {
        href: "/dashboard/brands/new",
        label: "Create Brand",
        icon: "plus",
      },
    ],
  },
  {
    label: "",
    items: [
      {
        href: "/dashboard/marketplace-preview",
        label: "Marketplace Preview",
        icon: "eye",
      },
      {
        href: "/dashboard/messages",
        label: "Messages",
        icon: "messageSquare",
        mobileLabel: "Messages",
      },
      {
        href: "/dashboard/notifications",
        label: "Notifications",
        icon: "bell",
        mobileLabel: "Alerts",
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
