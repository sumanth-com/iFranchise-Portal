"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth/actions";
import { initialAuthActionState } from "@/types/auth";

type LoginFormProps = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(login, initialAuthActionState);

  return (
    <AuthCard
      title="Sign in"
      description="Access your client or admin portal account."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-[#2563EB] hover:text-[#1D4ED8]">
            Sign up
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-5">
        {redirectTo ? (
          <input type="hidden" name="redirectTo" value={redirectTo} />
        ) : null}

        <AuthAlert error={state.error} message={state.message} />

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-[0_12px_30px_rgba(37,99,235,0.25)]"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
