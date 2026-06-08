"use client";

import { AnimatedNavIcon } from "@/components/layout/animated-nav-icon";
import type { NavIconName } from "@/lib/nav-config";

type NavIconProps = {
  name: NavIconName;
  className?: string;
  active?: boolean;
};

export function NavIcon({ name, className, active }: NavIconProps) {
  return (
    <AnimatedNavIcon name={name} className={className} active={active} />
  );
}
