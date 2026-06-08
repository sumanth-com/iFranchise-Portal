"use client";

import { TopbarGreetingCarousel } from "@/components/dashboard/client/topbar-greeting-carousel";
import { TopbarUserChip } from "@/components/dashboard/client/topbar-user-chip";
import { usePortalProfile } from "@/lib/profile/use-portal-profile";

type ClientTopbarProps = {
  userId: string;
  email: string;
  name?: string | null;
};

export function ClientTopbar({ userId, email, name }: ClientTopbarProps) {
  const { displayName } = usePortalProfile(userId, name, email);

  return (
    <header className="client-topbar relative z-30 flex h-[var(--topbar-height)] shrink-0 items-center gap-3 overflow-hidden border-b border-[#5B21B6]/40 bg-gradient-to-r from-[#6D28D9] via-[#5B21B6] to-[#4F46E5] px-4 shadow-[0_4px_20px_rgba(109,40,217,0.22)] sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.22) 0%, transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.12) 0%, transparent 40%)",
        }}
      />
      <div className="relative min-w-0 flex-1">
        <TopbarGreetingCarousel displayName={displayName} email={email} />
      </div>
      <div className="relative shrink-0">
        <TopbarUserChip userId={userId} email={email} name={name} />
      </div>
    </header>
  );
}
