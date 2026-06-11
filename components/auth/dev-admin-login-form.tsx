"use client";

import { useActionState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { PremiumInput } from "@/components/auth/premium-input";
import { login } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { initialAuthActionState } from "@/types/auth";

const DEV_ADMIN_EMAIL = "sumanth.reddy@ifranchise.in";

export function DevAdminLoginForm() {
  const [state, formAction, isPending] = useActionState(
    login,
    initialAuthActionState,
  );

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Dev admin sign-in</h1>
      <p className="mt-2 text-sm text-slate-500">
        Local development only. Uses password sign-in and redirects to{" "}
        <code className="rounded bg-slate-100 px-1 text-xs">/admin</code>.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="redirectTo" value="/admin" />

        <AuthAlert error={state.error} message={state.message} />

        <PremiumInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={DEV_ADMIN_EMAIL}
        />

        <PremiumInput
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Your account password"
        />

        <Button
          type="submit"
          disabled={isPending}
          className="h-[46px] w-full rounded-[16px] bg-[#6D28D9] hover:bg-[#5B21B6]"
        >
          {isPending ? "Signing in…" : "Sign in to admin"}
        </Button>
      </form>
    </div>
  );
}
