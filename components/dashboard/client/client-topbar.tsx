"use client";

import { ClientUserMenu } from "@/components/dashboard/client/client-user-menu";

type ClientTopbarProps = {
  title: string;
  subtitle?: string;
  userId: string;
  email: string;
  name?: string | null;
};

export function ClientTopbar({
  title,
  subtitle,
  userId,
  email,
  name,
}: ClientTopbarProps) {
  return (
    <header className="client-topbar z-30 flex h-[var(--topbar-height)] shrink-0 items-center justify-between gap-6 border-b border-[#5B21B6]/40 bg-gradient-to-r from-[#6D28D9] via-[#5B21B6] to-[#4F46E5] px-4 shadow-[0_4px_20px_rgba(109,40,217,0.22)] sm:px-6 lg:px-8">
      <div className="min-w-0 flex-1 pr-2">
        <h1 className="truncate text-[15px] font-semibold leading-tight tracking-tight text-white sm:text-base">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-0.5 hidden truncate text-[13px] leading-snug text-white/80 sm:block">
            {subtitle}
          </p>
        ) : null}
      </div>

      <ClientUserMenu
        userId={userId}
        email={email}
        name={name}
        variant="onPurple"
      />
    </header>
  );
}
