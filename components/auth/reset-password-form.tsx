"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { RecoverySessionBootstrap } from "@/components/auth/recovery-session-bootstrap";
import { PremiumInput } from "@/components/auth/premium-input";
import { resetPassword } from "@/lib/auth/actions";
import { clearRecoveryFlow } from "@/lib/auth/recovery-cookie";
import { validateRecoveryPassword } from "@/lib/auth/recovery";
import { fadeUp } from "@/lib/motion";
import { initialAuthActionState } from "@/types/auth";

type ResetPasswordFormProps = {
  hasServerSession: boolean;
};

export function ResetPasswordForm({ hasServerSession }: ResetPasswordFormProps) {
  return (
    <RecoverySessionBootstrap hasServerSession={hasServerSession}>
      {({ sessionReady, sessionFailed }) => (
        <ResetPasswordFormContent
          sessionReady={sessionReady}
          sessionFailed={sessionFailed}
        />
      )}
    </RecoverySessionBootstrap>
  );
}

function ResetPasswordFormContent({
  sessionReady,
  sessionFailed,
}: {
  sessionReady: boolean;
  sessionFailed: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    resetPassword,
    initialAuthActionState,
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const success = state.message === "password_updated";

  useEffect(() => {
    if (success) {
      clearRecoveryFlow();
      const timer = window.setTimeout(() => {
        window.location.replace("/api/auth/redirect-login?notice=password_updated");
      }, 2000);
      return () => window.clearTimeout(timer);
    }
  }, [success]);

  if (!sessionReady && !success) {
    if (sessionFailed) {
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
    return null;
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
            Redirecting you to sign in…
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const validationError = validateRecoveryPassword(password, confirmPassword);
    if (validationError) {
      event.preventDefault();
      setClientError(validationError);
      return;
    }
    setClientError(null);
  }

  const canSubmit =
    password.length >= 8 &&
    confirmPassword.length >= 8 &&
    password === confirmPassword;

  return (
    <motion.div {...fadeUp} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Reset your password
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Choose a new password for your iFranchise account (minimum 8 characters).
        </p>
      </div>

      <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
        <AuthAlert error={clientError ?? state.error} message={null} />

        <PremiumInput
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <PremiumInput
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={pending || !canSubmit}
          className="flex h-[46px] w-full items-center justify-center rounded-[16px] bg-[#6D28D9] text-sm font-semibold text-white shadow-[0_18px_50px_rgba(109,40,217,0.25)] transition-colors hover:bg-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Updating password…" : "Update password"}
        </button>
      </form>
    </motion.div>
  );
}
