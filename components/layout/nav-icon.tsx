"use client";

import {
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  Globe,
  Images,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  Network,
  Send,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { NavIconName } from "@/lib/nav-config";

const ICONS: Record<NavIconName, LucideIcon> = {
  layoutDashboard: LayoutDashboard,
  building2: Building2,
  images: Images,
  clipboardList: ClipboardList,
  users: Users,
  wallet: Wallet,
  network: Network,
  globe: Globe,
  fileText: FileText,
  send: Send,
  bell: Bell,
  settings: Settings,
  barChart: BarChart3,
  eye: Eye,
  mapPin: MapPin,
  clock: Clock,
  lifeBuoy: LifeBuoy,
};

type NavIconProps = {
  name: NavIconName;
  className?: string;
};

export function NavIcon({ name, className }: NavIconProps) {
  const Icon = ICONS[name];
  return <Icon className={className} />;
}
