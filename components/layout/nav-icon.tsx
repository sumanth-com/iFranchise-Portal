"use client";

import {
  Bell,
  Building2,
  ClipboardList,
  Eye,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Plus,
  Settings,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { NavIconName } from "@/lib/nav-config";

const ICONS: Record<NavIconName, LucideIcon> = {
  layoutDashboard: LayoutDashboard,
  building2: Building2,
  plus: Plus,
  eye: Eye,
  messageSquare: MessageSquare,
  bell: Bell,
  settings: Settings,
  lifeBuoy: LifeBuoy,
  store: Store,
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
