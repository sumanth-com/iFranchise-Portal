"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/auth/actions";
import { initialAuthActionState } from "@/types/auth";

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialAuthActionState);

  return (
    <AuthCard
      title="Create account"
      description="Register as a client. Your profile is created automatically."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#2563EB] hover:text-[#1D4ED8]">
            Sign in
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-5">
        <AuthAlert error={state.error} message={state.message} />

        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="Jane Smith"
          />
        </div>

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-[0_12px_30px_rgba(37,99,235,0.25)]"
        >
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
