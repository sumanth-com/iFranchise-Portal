"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useActionState } from "react";
import { useEffect, useState, type ReactNode } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { LogoutButton } from "@/components/auth/logout-button";
import { RepairAccountButton } from "@/components/auth/repair-account-button";
import { PremiumInput } from "@/components/auth/premium-input";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import {
  AUTH_ERROR_CODES,
  isBlockingAuthError,
} from "@/lib/auth/auth-errors";
import {
  getFieldFormError,
  isAccountLevelFormError,
} from "@/lib/auth/form-errors";
import { Button } from "@/components/ui/button";
import { forgotPassword, login, signup } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { initialAuthActionState } from "@/types/auth";

type AuthTab = "login" | "signup" | "forgot";

type AuthExperienceProps = {
  initialTab: AuthTab;
  redirectTo?: string | null;
  pageError?: string | null;
  authErrorCode?: string | null;
};

export function AuthExperience({
  initialTab,
  redirectTo,
  pageError,
  authErrorCode,
}: AuthExperienceProps) {
  const [tab, setTab] = useState<AuthTab>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const [loginState, loginAction, loginPending] = useActionState(
    login,
    initialAuthActionState,
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signup,
    initialAuthActionState,
  );
  const [forgotState, forgotAction, forgotPending] = useActionState(
    forgotPassword,
    initialAuthActionState,
  );

  const title =
    tab === "login"
      ? "Welcome Back"
      : tab === "signup"
        ? "Create your account"
        : "Reset your password";

  const subtitle =
    tab === "login"
      ? "Sign in to continue to your account."
      : tab === "signup"
        ? "Register as a client. Your profile is created automatically."
        : "We’ll email you a link to choose a new password.";

  const pendingForTab =
    tab === "login"
      ? loginPending
      : tab === "signup"
        ? signupPending
        : forgotPending;

  const sessionBlocked =
    isBlockingAuthError(authErrorCode) && authErrorCode !== "unavailable";

  const accountIssueMessage =
    pageError ??
    (isAccountLevelFormError(loginState.error) ? loginState.error : null);

  const showAccountIssue = sessionBlocked || Boolean(accountIssueMessage);

  const loginFormError =
    loginState.error && !isAccountLevelFormError(loginState.error)
      ? loginState.error
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="relative w-full"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {showAccountIssue ? "Account needs attention" : title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {showAccountIssue
            ? "You are signed in, but we could not finish loading your account."
            : subtitle}
        </p>
      </div>

      {showAccountIssue ? (
        <div className="mt-5 space-y-4">
          {accountIssueMessage ? (
            <AuthAlert error={accountIssueMessage} message={null} />
          ) : null}
          <p className="text-sm text-slate-500">
            {authErrorCode === AUTH_ERROR_CODES.profile
              ? "We can try to finish setting up your account automatically."
              : "Sign out and try again, or contact support if this continues."}
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {authErrorCode === AUTH_ERROR_CODES.profile ? (
              <RepairAccountButton redirectTo={redirectTo} />
            ) : null}
            <LogoutButton />
          </div>
        </div>
      ) : (
        <>
          <div className="mt-5 flex gap-3 rounded-[16px] bg-slate-50 p-1 ring-1 ring-slate-200/60">
            <TabButton active={tab === "login"} onClick={() => setTab("login")}>
              Sign In
            </TabButton>
            <TabButton
              active={tab === "signup"}
              onClick={() => setTab("signup")}
            >
              Create Account
            </TabButton>
          </div>

          {/* Forms */}
          <div className="mt-5">
            {tab === "login" ? (
              <form action={loginAction} className="space-y-3.5">
                {redirectTo ? (
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                ) : null}

                <AuthAlert
                  error={loginFormError}
                  message={loginState.message}
                />

                <PremiumInput
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="e.g. you@example.com"
                  error={getFieldFormError(loginState.error, "email")}
                />

                <PremiumInput
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  error={getFieldFormError(loginState.error, "password")}
                />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-[#6D28D9] focus:ring-[#6D28D9]"
                  defaultChecked={false}
                  name="remember"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => setTab("forgot")}
                className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={pendingForTab}
              className="h-[46px] rounded-[16px] bg-[#6D28D9] shadow-[0_18px_50px_rgba(109,40,217,0.25)] hover:bg-[#5B21B6]"
            >
              {loginPending ? "Signing in..." : "Sign In →"}
            </Button>

            <Divider />

            <SocialAuthButtons />

            <p className="pt-2 text-xs leading-relaxed text-slate-500">
              By continuing, you agree to our{" "}
              <Link
                href="#"
                className="font-medium text-[#2563EB] hover:text-[#1D4ED8]"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="font-medium text-[#2563EB] hover:text-[#1D4ED8]"
              >
                Privacy Policy
              </Link>
              .
            </p>
              </form>
            ) : null}

            {tab === "signup" ? (
              <form action={signupAction} className="space-y-4">
                <AuthAlert
                  error={
                    signupState.error &&
                    !isAccountLevelFormError(signupState.error)
                      ? signupState.error
                      : null
                  }
                  message={signupState.message}
                />

                <PremiumInput
                  label="Full name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Jane Smith"
                  error={getFieldFormError(signupState.error, "fullName")}
                />

                <PremiumInput
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="e.g. you@company.com"
                  error={getFieldFormError(signupState.error, "email")}
                />

                <PremiumInput
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  error={getFieldFormError(signupState.error, "password")}
                />

            <Button
              type="submit"
              disabled={pendingForTab}
              className="h-[46px] rounded-[16px] bg-[#6D28D9] shadow-[0_18px_50px_rgba(109,40,217,0.25)] hover:bg-[#5B21B6]"
            >
              {signupPending ? "Creating account..." : "Create account"}
            </Button>
              </form>
            ) : null}

            {tab === "forgot" ? (
              <form action={forgotAction} className="space-y-4">
                <AuthAlert
                  error={forgotState.error}
                  message={forgotState.message}
                />

                <PremiumInput
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="e.g. you@company.com"
                  error={getFieldFormError(forgotState.error, "email")}
                />

            <Button
              type="submit"
              disabled={pendingForTab}
              className="h-[46px] rounded-[16px] bg-[#6D28D9] shadow-[0_18px_50px_rgba(109,40,217,0.25)] hover:bg-[#5B21B6]"
            >
              {forgotPending ? "Sending link..." : "Send reset link"}
            </Button>

            <button
              type="button"
              onClick={() => setTab("login")}
              className="w-full text-center text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]"
            >
              Back to sign in
            </button>
              </form>
            ) : null}
          </div>
        </>
      )}
    </motion.div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex-1 rounded-[14px] px-4 py-2 text-sm font-semibold transition-colors",
        active
          ? "bg-white text-slate-900 shadow-[0_12px_35px_rgba(2,6,23,0.10)] ring-1 ring-slate-200"
          : "bg-transparent text-slate-500 hover:text-slate-800",
      )}
    >
      {children}
    </motion.button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="h-px flex-1 bg-slate-200" />
      <div className="text-xs font-semibold text-slate-400">OR</div>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

