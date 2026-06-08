"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { loadProfileExtras } from "@/lib/profile/client-preferences";
import { PROFILE_UPDATED_EVENT } from "@/lib/profile/profile-events";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  userId: string;
  email: string;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZES = {
  sm: { box: "h-8 w-8", text: "text-[10px]", px: 32 },
  md: { box: "h-10 w-10", text: "text-xs", px: 40 },
  lg: { box: "h-14 w-14", text: "text-sm", px: 56 },
  xl: { box: "h-32 w-28 sm:h-36 sm:w-32", text: "text-2xl", px: 144 },
};

export function UserAvatar({
  userId,
  email,
  name,
  size = "md",
  className,
}: UserAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const s = SIZES[size];
  const displayName = name?.trim() || email.split("@")[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  const refresh = useCallback(() => {
    setAvatarUrl(loadProfileExtras(userId).avatarDataUrl);
  }, [userId]);

  useEffect(() => {
    refresh();
    window.addEventListener(PROFILE_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, refresh);
  }, [refresh]);

  return (
    <span
      className={cn(
        "relative shrink-0 overflow-hidden rounded-sm bg-gradient-to-br from-[#6D28D9] to-[#4F46E5]",
        s.box,
        className,
      )}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          width={s.px}
          height={s.px}
          unoptimized
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className={cn(
            "flex h-full w-full items-center justify-center font-bold text-white",
            s.text,
          )}
        >
          {initials}
        </span>
      )}
    </span>
  );
}
