"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  HelpCircle,
  LogOut,
  Settings,
  User,
  UserCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { logout } from "@/lib/auth/actions";
import { loadProfileExtras } from "@/lib/profile/client-preferences";
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const displayName = name?.trim() || email.split("@")[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  const refreshAvatar = useCallback(() => {
    setAvatarUrl(loadProfileExtras(userId).avatarDataUrl);
  }, [userId]);

  useEffect(() => {
    refreshAvatar();
    const handler = () => refreshAvatar();
    window.addEventListener("profile-updated", handler);
    return () => window.removeEventListener("profile-updated", handler);
  }, [refreshAvatar]);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "profile-cube relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl transition-all duration-200 sm:h-10 sm:w-10",
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
              className="absolute right-0 z-50 mt-2.5 w-[min(100vw-2rem,15.5rem)] overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl backdrop-saturate-150"
            >
              <div className="border-b border-slate-200/60 bg-gradient-to-br from-[#6D28D9]/10 via-white/50 to-transparent px-4 py-3.5">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {displayName}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6D28D9]">
                  Brand Owner
                </p>
              </div>
              <div className="p-1.5">
                <MenuLink
                  href="/dashboard/profile"
                  icon={User}
                  label="Profile"
                  onClick={() => setOpen(false)}
                />
                <MenuLink
                  href="/dashboard/settings"
                  icon={UserCircle}
                  label="My Account"
                  onClick={() => setOpen(false)}
                />
                <MenuLink
                  href="/dashboard/settings"
                  icon={Settings}
                  label="Settings"
                  onClick={() => setOpen(false)}
                />
                <MenuLink
                  href="/dashboard/notifications"
                  icon={Bell}
                  label="Notifications"
                  onClick={() => setOpen(false)}
                />
                <MenuLink
                  href="/dashboard/support"
                  icon={HelpCircle}
                  label="Help & Support"
                  onClick={() => setOpen(false)}
                />
              </div>
              <form action={logout} className="border-t border-slate-200/60 p-1.5">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50/80"
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

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: typeof User;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-white/80 hover:text-[#6D28D9]"
    >
      <Icon className="h-4 w-4 text-slate-400" />
      {label}
    </Link>
  );
}
