"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const REFRESH_DEBOUNCE_MS = 300;

type RefreshFn = () => void;

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let pendingRefresh: RefreshFn | null = null;

function runPendingRefresh() {
  refreshTimer = null;
  const fn = pendingRefresh;
  pendingRefresh = null;
  if (!fn) return;

  try {
    fn();
  } catch {
    // Next.js router may not be initialized yet (e.g. during HMR).
  }
}

/**
 * Debounced router.refresh that avoids "Router action dispatched before
 * initialization" when called from realtime listeners or effects during HMR.
 */
export function scheduleRouterRefresh(
  refresh: RefreshFn,
  delayMs = REFRESH_DEBOUNCE_MS,
): void {
  pendingRefresh = refresh;
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(runPendingRefresh, delayMs);
}

export function useSafeRouterRefresh() {
  const router = useRouter();
  const mountedRef = useRef(true);
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => {
    if (!mountedRef.current) return;
    scheduleRouterRefresh(() => {
      if (mountedRef.current) {
        try {
          routerRef.current.refresh();
        } catch {
          // Ignore if router is not ready.
        }
      }
    });
  }, []);
}
