import { Suspense } from "react";

import { AuthCallbackHandler } from "@/components/auth/auth-callback-handler";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm text-slate-600">Completing sign-in…</p>
        </div>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}
