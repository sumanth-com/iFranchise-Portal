"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { logout } from "@/lib/auth/actions";
import { usePortalProfile } from "@/lib/profile/use-portal-profile";
import { cn } from "@/lib/utils";

type ClientUserMenuProps = {
  userId: string;
  email: string;
  name?: string | null;
  variant?: "default" | "onPurple";
};

export function ClientUserMenu({
  userId,
  email,
  name,
  variant = "default",
}: ClientUserMenuProps) {
  const onPurple = variant === "onPurple";
  const [open, setOpen] = useState(false);
  const { displayName, avatarUrl } = usePortalProfile(userId, name, email);
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "profile-cube relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-sm transition-all duration-200 sm:h-10 sm:w-10",
          onPurple
            ? "bg-white/15 shadow-[0_2px_12px_rgba(0,0,0,0.12)] ring-1 ring-white/30 hover:bg-white/25 hover:shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:ring-white/50"
            : "bg-white shadow-sm ring-1 ring-slate-200/80 hover:shadow-md hover:ring-[#6D28D9]/25",
          open && "scale-95",
        )}
        aria-label={`Account menu for ${displayName}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className={cn(
              "flex h-full w-full items-center justify-center text-[11px] font-bold tracking-tight",
              onPurple
                ? "bg-gradient-to-br from-white/30 to-white/10 text-white"
                : "bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] text-white",
            )}
          >
            {initials}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="client-user-menu-panel absolute right-0 z-50 mt-2.5 w-[min(100vw-2rem,17rem)] overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.16)]"
            >
              <div className="flex flex-col items-center border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-5 py-5 text-center">
                <span className="max-w-full truncate text-base font-semibold capitalize text-slate-900 sm:text-lg">
                  {displayName}
                </span>
                <span className="mt-2 inline-flex rounded-full bg-[#F5F3FF] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#6D28D9]">
                  Brand Owner
                </span>
              </div>
              <form action={logout} className="p-3">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </form>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
