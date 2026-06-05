/** Serializable nav config (safe to pass from Server → Client Components). */

export type NavIconName =
  | "layoutDashboard"
  | "building2"
  | "images"
  | "clipboardList"
  | "users";

export type NavItem = {
  href: string;
  label: string;
  icon: NavIconName;
  mobileLabel?: string;
};

export const clientNav: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "layoutDashboard",
    mobileLabel: "Home",
  },
  {
    href: "/dashboard#profile",
    label: "Brand profile",
    icon: "building2",
    mobileLabel: "Brand",
  },
  {
    href: "/dashboard#assets",
    label: "Assets",
    icon: "images",
    mobileLabel: "Assets",
  },
];

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
