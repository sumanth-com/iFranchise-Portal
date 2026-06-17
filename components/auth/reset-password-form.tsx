"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { RecoverySessionBootstrap } from "@/components/auth/recovery-session-bootstrap";
import { PremiumInput } from "@/components/auth/premium-input";
import { resetPassword } from "@/lib/auth/actions";
import { clearRecoveryFlow } from "@/lib/auth/recovery-cookie";
import {
  evaluateRecoveryPasswordStrength,
  getRecoveryErrorMessage,
  validateRecoveryPassword,
  type RecoveryErrorReason,
} from "@/lib/auth/recovery";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { initialAuthActionState } from "@/types/auth";

type ResetPasswordFormProps = {
  hasServerSession: boolean;
};

export function ResetPasswordForm({ hasServerSession }: ResetPasswordFormProps) {
  return (
    <RecoverySessionBootstrap hasServerSession={hasServerSession}>
      {({ sessionReady, errorReason }) => (
        <ResetPasswordFormContent
          sessionReady={sessionReady}
          errorReason={errorReason}
        />
      )}
    </RecoverySessionBootstrap>
  );
}

function RecoveryErrorState({ reason }: { reason: RecoveryErrorReason }) {
  return (
    <motion.div {...fadeUp} className="space-y-5 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100">
        <AlertCircle className="h-7 w-7" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Unable to reset password
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {getRecoveryErrorMessage(reason)}
        </p>
      </div>
      <Link
        href="/forgot-password"
        className="inline-flex h-[46px] w-full items-center justify-center rounded-[16px] bg-[#6D28D9] text-sm font-semibold text-white shadow-[0_18px_50px_rgba(109,40,217,0.25)] hover:bg-[#5B21B6] sm:w-auto sm:px-8"
      >
        Send New Reset Link
      </Link>
    </motion.div>
  );
}

function ResetPasswordFormContent({
  sessionReady,
  errorReason,
}: {
  sessionReady: boolean;
  errorReason: RecoveryErrorReason | null;
}) {
  const [state, formAction, pending] = useActionState(
    resetPassword,
    initialAuthActionState,
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const strength = evaluateRecoveryPasswordStrength(password);
  const success = state.message === "password_updated";

  useEffect(() => {
    if (success) {
      clearRecoveryFlow();
      const timer = window.setTimeout(() => {
        window.location.replace("/login?updated=1");
      }, 3000);
      return () => window.clearTimeout(timer);
    }
  }, [success]);

  if (!sessionReady && !success) {
    if (errorReason) {
      return <RecoveryErrorState reason={errorReason} />;
    }
    return null;
  }

  if (success) {
    return (
      <motion.div {...fadeUp} className="space-y-5 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
        >
          <CheckCircle2 className="h-8 w-8" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Your password has been updated successfully.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Redirecting you to sign in in a few seconds…
          </p>
        </div>
        <Link
          href="/login?updated=1"
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
    strength.passed && password === confirmPassword && confirmPassword.length > 0;

  return (
    <motion.div {...fadeUp} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Create a new password
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Choose a strong password for your iFranchise account.
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

        <PasswordStrengthIndicator strength={strength} />

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

function PasswordStrengthIndicator({
  strength,
}: {
  strength: ReturnType<typeof evaluateRecoveryPasswordStrength>;
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
          className={cn("h-full rounded-full transition-all duration-300", barColor)}
          style={{ width: `${(strength.score / 4) * 100}%` }}
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
