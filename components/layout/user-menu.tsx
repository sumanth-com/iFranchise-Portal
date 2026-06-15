"use client";

import { motion } from "framer-motion";
import { ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";

import { LogoutControl } from "@/components/auth/logout-control";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  email: string;
  name?: string | null;
  role: "client" | "admin";
  variant?: "brand" | "mono";
};

export function UserMenu({
  email,
  name,
  role,
  variant = "brand",
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const initials = (name || email).slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-2 py-1.5 text-sm hover:bg-surface-muted"
      >
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold",
            variant === "mono"
              ? "border border-black bg-white text-black"
              : "bg-gradient-to-br from-primary-600 to-accent-500 text-white",
          )}
        >
          {initials}
        </span>
        <span className="hidden max-w-[120px] truncate text-left sm:block">
          <span
            className={cn(
              "block font-medium",
              variant === "mono" ? "text-black" : "text-foreground",
            )}
          >
            {name || email.split("@")[0]}
          </span>
          <span
            className={cn(
              "block text-xs capitalize",
              variant === "mono" ? "text-black" : "text-slate-500",
            )}
          >
            {role}
          </span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute right-0 z-50 mt-2 w-56 rounded-[var(--radius-lg)] border border-border bg-surface p-2 shadow-[var(--shadow-md)]"
          >
            <p
              className={cn(
                "px-3 py-2 text-xs",
                variant === "mono" ? "text-black" : "text-slate-500",
              )}
            >
              {email}
            </p>
            <LogoutControl>
              <button
                type="submit"
                className={cn(
                  "flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm hover:bg-surface-muted",
                  variant === "mono" ? "text-black" : "text-slate-700",
                )}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </LogoutControl>
          </motion.div>
        </>
      ) : null}
    </div>
  );
}
