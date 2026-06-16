"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import { clearClientAuthStorage } from "@/lib/auth/clear-client-auth";
import { createClientOptional } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type LogoutControlProps = {
  userId?: string | null;
  children: ReactNode;
  className?: string;
};

/**
 * Production logout: client sign-out, clear local caches, then server
 * cookie teardown via /api/auth/logout with a hard navigation (no bfcache).
 */
export function LogoutControl({
  userId,
  children,
  className,
}: LogoutControlProps) {
  const [pending, setPending] = useState(false);

  async function handleLogout(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;

    setPending(true);

    try {
      const supabase = createClientOptional();
      if (supabase) {
        await supabase.auth.signOut({ scope: "global" });
      }
    } catch {
      // Server route still clears cookies.
    }

    clearClientAuthStorage(userId);
    window.location.replace("/api/auth/logout");
  }

  return (
    <>
      {pending ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <AuthLoadingScreen message="Signing you out…" />
        </div>
      ) : null}
      <form onSubmit={handleLogout} className={cn(className)}>
        {children}
      </form>
    </>
  );
}
