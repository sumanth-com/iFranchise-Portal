"use client";

import {
  Building2,
  ClipboardList,
  Images,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { NavIconName } from "@/lib/nav-config";

const ICONS: Record<NavIconName, LucideIcon> = {
  layoutDashboard: LayoutDashboard,
  building2: Building2,
  images: Images,
  clipboardList: ClipboardList,
  users: Users,
};

type NavIconProps = {
  name: NavIconName;
  className?: string;
};

export function NavIcon({ name, className }: NavIconProps) {
  const Icon = ICONS[name];
  return <Icon className={className} />;
}
