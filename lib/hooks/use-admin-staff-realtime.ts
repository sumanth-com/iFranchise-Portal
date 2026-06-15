"use client";

import { useEffect, useRef } from "react";

import { useSafeRouterRefresh } from "@/lib/navigation/safe-router-refresh";
import { createClient } from "@/lib/supabase/client";

export function useAdminStaffRealtime(enabled = true) {
  const refresh = useSafeRouterRefresh();
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    if (!enabled) return;

    let supabase: ReturnType<typeof createClient> | null = null;

    try {
      supabase = createClient();
    } catch {
      return;
    }

    const channel = supabase
      .channel("admin-staff-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => refreshRef.current(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_invitations" },
        () => refreshRef.current(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_logs" },
        () => refreshRef.current(),
      )
      .subscribe();

    return () => {
      void supabase?.removeChannel(channel);
    };
  }, [enabled]);
}
