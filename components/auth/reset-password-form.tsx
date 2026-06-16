"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import { PremiumInput } from "@/components/auth/premium-input";
import { resetPassword } from "@/lib/auth/actions";
import { evaluatePasswordStrength } from "@/lib/auth/password-policy";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { initialAuthActionState } from "@/types/auth";

const RECOVERY_COOKIE = "if_auth_recovery";

function markRecoveryFlow() {
  document.cookie = `${RECOVERY_COOKIE}=1; path=/; max-age=3600; SameSite=Lax`;
}

function clearRecoveryFlow() {
  document.cookie = `${RECOVERY_COOKIE}=; path=/; max-age=0`;
}

type ResetPasswordFormProps = {
  hasServerSession: boolean;
};

export function ResetPasswordForm({ hasServerSession }: ResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState(
    resetPassword,
    initialAuthActionState,
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionReady, setSessionReady] = useState(hasServerSession);
  const [sessionChecking, setSessionChecking] = useState(!hasServerSession);

  const strength = evaluatePasswordStrength(password);
  const success = state.message === "password_updated";

  useEffect(() => {
    if (hasServerSession) {
      markRecoveryFlow();
      setSessionReady(true);
      setSessionChecking(false);
      return;
    }

    let cancelled = false;

    async function verifySession() {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });

        if (cancelled) return;

        if (response.ok) {
          markRecoveryFlow();
          setSessionReady(true);
        } else {
          setSessionReady(false);
        }
      } catch {
        if (!cancelled) setSessionReady(false);
      } finally {
        if (!cancelled) setSessionChecking(false);
      }
    }

    void verifySession();

    return () => {
      cancelled = true;
    };
  }, [hasServerSession]);

  useEffect(() => {
    if (success) {
      clearRecoveryFlow();
    }
  }, [success]);

  if (sessionChecking) {
    return <AuthLoadingScreen message="Preparing password reset…" />;
  }

  if (!sessionReady && !success) {
    return (
      <motion.div {...fadeUp} className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Reset link expired
        </h1>
        <p className="text-sm leading-relaxed text-slate-500">
          This password reset link is no longer valid. Request a new link and
          we&apos;ll send it to your inbox.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex h-11 items-center justify-center rounded-[16px] bg-[#6D28D9] px-5 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(109,40,217,0.25)] hover:bg-[#5B21B6]"
        >
          Request new link
        </Link>
      </motion.div>
    );
  }

  if (success) {
    return (
      <motion.div {...fadeUp} className="space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Password updated successfully
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Your password has been changed.
          </p>
        </div>
        <Link
          href="/api/auth/redirect-login?notice=password_updated"
          className="inline-flex h-[46px] w-full items-center justify-center rounded-[16px] bg-[#6D28D9] text-sm font-semibold text-white shadow-[0_18px_50px_rgba(109,40,217,0.25)] hover:bg-[#5B21B6] sm:w-auto sm:px-8"
        >
          Continue to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeUp} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Reset your password
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Choose a strong password for your iFranchise account.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <AuthAlert error={state.error} message={null} />

        <PremiumInput
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <PasswordStrengthIndicator strength={strength} />

        <PremiumInput
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={pending || !strength.passed}
          className="flex h-[46px] w-full items-center justify-center rounded-[16px] bg-[#6D28D9] text-sm font-semibold text-white shadow-[0_18px_50px_rgba(109,40,217,0.25)] transition-colors hover:bg-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Updating password…" : "Update password"}
        </button>
      </form>
    </motion.div>
  );
}

function PasswordStrengthIndicator({
  strength,
}: {
  strength: ReturnType<typeof evaluatePasswordStrength>;
}) {
  const barColor =
    strength.label === "Strong"
      ? "bg-emerald-500"
      : strength.label === "Good"
        ? "bg-violet-500"
        : strength.label === "Fair"
          ? "bg-amber-500"
          : "bg-slate-300";

  return (
    <div className="space-y-2 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">Password strength</span>
        <span className="font-semibold text-slate-800">{strength.label}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${(strength.score / 5) * 100}%` }}
        />
      </div>
      <ul className="grid gap-1 sm:grid-cols-2">
        {strength.requirements.map((req) => (
          <li
            key={req.id}
            className={cn(
              "text-xs",
              req.met ? "text-emerald-700" : "text-slate-400",
            )}
          >
            {req.met ? "✓" : "○"} {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
