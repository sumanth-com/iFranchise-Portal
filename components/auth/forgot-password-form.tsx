"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/auth/actions";
import { initialAuthActionState } from "@/types/auth";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    forgotPassword,
    initialAuthActionState,
  );

  return (
    <AuthCard
      title="Reset password"
      description="We will email you a link to choose a new password."
      footer={
        <Link href="/login" className="font-medium text-[#2563EB] hover:text-[#1D4ED8]">
          Back to sign in
        </Link>
      }
    >
      <form action={formAction} className="space-y-5">
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

        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-[0_12px_30px_rgba(37,99,235,0.25)]"
        >
          {isPending ? "Sending link..." : "Send reset link"}
        </Button>
      </form>
    </AuthCard>
  );
}
