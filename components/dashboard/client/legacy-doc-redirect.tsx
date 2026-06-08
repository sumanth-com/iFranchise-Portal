"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Sends old `/dashboard/support#documentation` links to the documentation page. */
export function LegacyDocRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (window.location.hash === "#documentation") {
      router.replace("/dashboard/documentation");
    }
  }, [router]);

  return null;
}
