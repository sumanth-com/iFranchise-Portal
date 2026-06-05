"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

import { SplashScreen } from "@/components/layout/splash-screen";

const SPLASH_KEY = "ifranchise-splash-seen";
const SPLASH_DURATION_MS = 1500;

type Phase = "splash" | "ready";

export function SplashProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("ready");

  useEffect(() => {
    let seen = false;

    try {
      seen = sessionStorage.getItem(SPLASH_KEY) === "1";
    } catch {
      // Storage blocked — skip splash, never block the app.
      return;
    }

    if (seen) {
      return;
    }

    setPhase("splash");

    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SPLASH_KEY, "1");
      } catch {
        // Ignore storage errors
      }
      setPhase("ready");
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Always render children — splash overlays briefly, never blocks with a blank page. */}
      {children}
      <AnimatePresence mode="wait">
        {phase === "splash" ? <SplashScreen key="splash" /> : null}
      </AnimatePresence>
    </>
  );
}
