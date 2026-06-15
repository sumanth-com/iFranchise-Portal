"use client";

import type { ReactNode } from "react";
import { useState } from "react";

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
    <form onSubmit={handleLogout} className={cn(className)}>
      {children}
    </form>
  );
}
