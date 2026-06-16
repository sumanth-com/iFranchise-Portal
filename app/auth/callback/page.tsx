import { Suspense } from "react";

import { AuthCallbackHandler } from "@/components/auth/auth-callback-handler";
import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthLoadingScreen message="Securing your workspace…" />}>
      <AuthCallbackHandler />
    </Suspense>
  );
}
