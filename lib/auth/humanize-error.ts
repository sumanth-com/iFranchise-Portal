import {
  AUTH_ERROR_CODES,
  getAuthErrorMessage,
} from "@/lib/auth/auth-errors";
import { isServiceUnavailableError } from "@/lib/auth/resolve-auth";

/** Never surface raw infrastructure errors like "fetch failed" to users. */
export function humanizeAuthError(error: unknown): string {
  if (isServiceUnavailableError(error)) {
    return getAuthErrorMessage(AUTH_ERROR_CODES.unavailable)!;
  }

  const message =
    error instanceof Error
      ? error.message
      : error && typeof error === "object" && "message" in error
        ? String((error as { message?: string }).message ?? "")
        : String(error ?? "");

  const lower = message.toLowerCase();

  if (
    lower.includes("fetch failed") ||
    lower.includes("timed out") ||
    lower.includes("connect timeout") ||
    lower.includes("network") ||
    lower.includes("econnrefused") ||
    lower.includes("enotfound") ||
    lower.includes("econnreset")
  ) {
    return "We are having trouble connecting. Please try again in a moment.";
  }

  if (lower.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }

  if (lower.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }

  if (lower.includes("user already registered")) {
    return "An account with this email already exists. Try signing in.";
  }

  if (
    lower.includes("missing next_public_supabase") ||
    lower.includes("missing supabase")
  ) {
    return "Authentication is not configured. Contact support.";
  }

  if (
    lower.includes("profile") ||
    lower.includes("authentication failed") ||
    lower.includes("session")
  ) {
    return "Please sign in to continue.";
  }

  if (message.trim()) {
    return message;
  }

  return "Please sign in to continue.";
}

export function profileLoadErrorMessage(_reason: string | null): string {
  return "Please sign in to continue.";
}

export function unavailableAuthState() {
  return {
    error: getAuthErrorMessage(AUTH_ERROR_CODES.unavailable)!,
    message: null,
  };
}
