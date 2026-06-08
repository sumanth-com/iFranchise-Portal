"use client";

import {
  Bell,
  Building2,
  ClipboardList,
  Eye,
  LayoutGrid,
  LifeBuoy,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { NavIconName } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

const ICONS: Record<NavIconName, LucideIcon> = {
  layoutDashboard: LayoutGrid,
  sparkles: Sparkles,
  store: Store,
  eye: Eye,
  messageSquare: MessageSquare,
  bell: Bell,
  settings: Settings,
  lifeBuoy: LifeBuoy,
  building2: Building2,
  plus: Plus,
  clipboardList: ClipboardList,
  users: Users,
};

/** Per-icon hover animation classes — 200ms, hover only. */
const HOVER_ANIM: Partial<Record<NavIconName, string>> = {
  layoutDashboard:
    "transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-translate-y-0.5",
  plus:
    "transition-transform duration-200 ease-out group-hover:rotate-90 group-hover:scale-110",
  sparkles:
    "transition-transform duration-200 ease-out group-hover:rotate-12 group-hover:scale-110",
  store:
    "transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-translate-y-px origin-bottom",
  eye: "nav-icon-blink transition-transform duration-200 ease-out group-hover:scale-105",
  messageSquare:
    "transition-transform duration-200 ease-out group-hover:scale-125 group-hover:-translate-y-0.5",
  bell: "nav-icon-swing transition-transform duration-200 ease-out origin-top",
  settings:
    "transition-transform duration-200 ease-out group-hover:rotate-45",
};

type AnimatedNavIconProps = {
  name: NavIconName;
  className?: string;
  active?: boolean;
};

export function AnimatedNavIcon({
  name,
  className,
  active = false,
}: AnimatedNavIconProps) {
  const Icon = ICONS[name];
  const hoverAnim = HOVER_ANIM[name] ?? "transition-transform duration-200 group-hover:scale-105";

  return (
    <span className={cn("inline-flex items-center justify-center", hoverAnim)}>
      <Icon
        className={cn("h-[18px] w-[18px]", className)}
        strokeWidth={active ? 2.25 : 2}
      />
    </span>
  );
}
