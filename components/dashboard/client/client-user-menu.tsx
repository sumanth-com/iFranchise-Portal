"use client";

import { motion } from "framer-motion";
import { ChevronDown, HelpCircle, LogOut, Settings, User } from "lucide-react";
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
};

export function ClientUserMenu({ userId, email, name }: ClientUserMenuProps) {
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const displayName = name?.trim() || email.split("@")[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  const refreshAvatar = useCallback(() => {
    setAvatarUrl(loadProfileExtras(userId).avatarDataUrl);
  }, [userId]);

  useEffect(() => {
    setMounted(true);
    refreshAvatar();
    const handler = () => refreshAvatar();
    window.addEventListener("profile-updated", handler);
    return () => window.removeEventListener("profile-updated", handler);
  }, [refreshAvatar]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition-all hover:border-[#6D28D9]/20 hover:shadow-md"
      >
        {mounted && avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={36}
            height={36}
            unoptimized
            className="h-9 w-9 rounded-xl object-cover ring-2 ring-[#6D28D9]/20"
          />
        ) : (
          <span className="dash-on-color flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] text-xs font-bold !text-white shadow-[0_4px_12px_rgba(109,40,217,0.35)]">
            {initials}
          </span>
        )}
        <span className="hidden text-left sm:block">
          <span className="block max-w-[140px] truncate text-sm font-semibold text-slate-900">
            {displayName}
          </span>
          <span className="block text-xs text-slate-500">Brand Owner</span>
        </span>
        <ChevronDown
          className={cn(
            "hidden h-4 w-4 text-slate-400 transition-transform sm:block",
            open && "rotate-180",
          )}
        />
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
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.14)]"
          >
            <div className="border-b border-slate-100 bg-gradient-to-br from-[#6D28D9]/5 to-transparent px-4 py-4">
              <div className="flex items-center gap-3">
                {mounted && avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt=""
                    width={44}
                    height={44}
                    unoptimized
                    className="h-11 w-11 rounded-xl object-cover ring-2 ring-[#6D28D9]/20"
                  />
                ) : (
                  <span className="dash-on-color flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] text-sm font-bold !text-white">
                    {initials}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {displayName}
                  </p>
                  <p className="text-xs font-medium text-[#6D28D9]">
                    Brand Owner
                  </p>
                  <p className="truncate text-xs text-slate-500">{email}</p>
                </div>
              </div>
            </div>
            <div className="p-1.5">
              <MenuLink
                href="/dashboard/profile"
                icon={User}
                label="My Profile"
                onClick={() => setOpen(false)}
              />
              <MenuLink
                href="/dashboard/settings"
                icon={Settings}
                label="Settings"
                onClick={() => setOpen(false)}
              />
              <MenuLink
                href="/dashboard/support"
                icon={HelpCircle}
                label="Help Center"
                onClick={() => setOpen(false)}
              />
            </div>
            <form action={logout} className="border-t border-slate-100 p-1.5">
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </motion.div>
        </>
      ) : null}
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
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#6D28D9]"
    >
      <Icon className="h-4 w-4 text-slate-400" />
      {label}
    </Link>
  );
}
