"use client";

import { motion } from "framer-motion";
import { Building2, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export type AuthPortalRole = "client" | "admin";

export const AUTH_ROLE_COPY: Record<
  AuthPortalRole,
  { label: string; description: string }
> = {
  client: {
    label: "Brand Owner",
    description:
      "Manage your franchise profile and submit your brand for review.",
  },
  admin: {
    label: "Admin",
    description:
      "Manage brands, reviews, approvals, and platform operations.",
  },
};

type RoleSelectorProps = {
  value: AuthPortalRole;
  onChange: (role: AuthPortalRole) => void;
  className?: string;
};

const OPTIONS: {
  value: AuthPortalRole;
  label: string;
  icon: typeof Building2;
}[] = [
  { value: "client", label: "Brand Owner", icon: Building2 },
  { value: "admin", label: "Admin", icon: ShieldCheck },
];

export function RoleSelector({ value, onChange, className }: RoleSelectorProps) {
  return (
    <div
      className={cn(
        "relative flex gap-1 rounded-[16px] bg-slate-50 p-1 ring-1 ring-slate-200/60",
        className,
      )}
      role="tablist"
      aria-label="Account type"
    >
      {OPTIONS.map((option) => {
        const active = value === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-2 rounded-[14px] px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4",
              active
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            {active ? (
              <motion.span
                layoutId="auth-role-pill"
                className="absolute inset-0 rounded-[14px] bg-white shadow-[0_12px_35px_rgba(2,6,23,0.10)] ring-1 ring-slate-200"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <Icon className="relative z-10 h-4 w-4 shrink-0" />
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
