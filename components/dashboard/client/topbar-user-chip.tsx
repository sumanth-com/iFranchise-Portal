"use client";

import { UserAvatar } from "@/components/dashboard/client/user-avatar";
import { usePortalProfile } from "@/lib/profile/use-portal-profile";

type TopbarUserChipProps = {
  userId: string;
  email: string;
  name?: string | null;
};

export function TopbarUserChip({ userId, email, name }: TopbarUserChipProps) {
  const { displayName } = usePortalProfile(userId, name, email);

  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-xl bg-white/10 px-2 py-1 ring-1 ring-white/15 backdrop-blur-sm sm:gap-3 sm:px-2.5">
      <UserAvatar
        userId={userId}
        email={email}
        name={name}
        size="sm"
        className="rounded-full ring-1 ring-white/25"
      />
      <span className="max-w-[5.5rem] truncate text-xs font-semibold capitalize text-white sm:max-w-[8rem] sm:text-sm">
        {displayName}
      </span>
    </div>
  );
}
