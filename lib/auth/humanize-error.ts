import {
  AUTH_ERROR_CODES,
  getAuthErrorMessage,
} from "@/lib/auth/auth-errors";
import { isServiceUnavailableError } from "@/lib/auth/resolve-auth";

/** Never surface raw infrastructure errors like "fetch failed" to users. */
export function humanizeAuthError(error: unknown): string {
  if (isServiceUnavailableError(error)) {
    return "Unable to connect to authentication service. Please try again.";
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
    return "Network connection issue. Please check your connection and try again.";
  }

  if (
    lower.includes("profile") &&
    (lower.includes("not found") || lower.includes("could not be loaded"))
  ) {
    return "Profile record not found.";
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

  if (message.trim()) {
    return message;
  }

  return "Authentication failed. Please try again.";
}

export function profileLoadErrorMessage(reason: string | null): string {
  if (!reason) {
    return "Profile record not found.";
  }

  if (isServiceUnavailableError({ message: reason })) {
    return "Unable to connect to authentication service. Please try again.";
  }

  const lower = reason.toLowerCase();
  if (lower.includes("not found") || lower.includes("no profile")) {
    return "Profile record not found.";
  }

  return humanizeAuthError({ message: reason });
}

export function unavailableAuthState() {
  return {
    error: getAuthErrorMessage(AUTH_ERROR_CODES.unavailable)!,
    message: null,
  };
}
