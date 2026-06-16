import {
  AUTH_ERROR_CODES,
  getAuthErrorMessage,
} from "@/lib/auth/auth-errors";
import { isServiceUnavailableError } from "@/lib/auth/resolve-auth";

type AuthLikeError = {
  message?: string;
  status?: number;
  code?: string;
  name?: string;
};

const CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: "Invalid email or password.",
  invalid_grant: "Invalid email or password.",
  user_not_found: "Invalid email or password.",
  email_not_confirmed: "Please confirm your email address before signing in.",
  user_already_registered: "This email is already registered.",
  email_exists: "This email is already registered.",
  signup_disabled: "New sign-ups are not available right now. Please contact support.",
  over_email_send_rate_limit:
    "Too many requests. Please try again in a few minutes.",
  over_request_rate_limit:
    "Too many requests. Please try again in a few minutes.",
  email_rate_limit_exceeded:
    "Too many requests. Please try again in a few minutes.",
  rate_limit_exceeded: "Too many requests. Please try again in a few minutes.",
  validation_failed: "Please check your information and try again.",
  weak_password: "Password does not meet security requirements.",
  same_password: "Choose a different password than your current one.",
  session_expired: "This link has expired. Please request a new one.",
  flow_state_expired: "This link has expired. Please request a new one.",
  flow_state_not_found: "This link has expired. Please request a new one.",
  otp_expired: "This link has expired. Please request a new one.",
};

function extractAuthError(error: unknown): AuthLikeError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      ...(error as AuthLikeError),
    };
  }
  if (error && typeof error === "object") {
    return error as AuthLikeError;
  }
  return { message: String(error ?? "") };
}

function looksTechnical(message: string, code: string | null): boolean {
  const lower = message.toLowerCase();

  if (!message.trim()) return false;

  if (
    lower.includes("authapierror") ||
    lower.includes("pgrst") ||
    lower.includes("postgrest") ||
    lower.includes("validation_failed") ||
    lower.includes("unexpected_failure") ||
    lower.includes("jsonwebtoken") ||
    lower.includes("fetch failed") ||
    lower.includes("econn") ||
    lower.includes("enotfound") ||
    lower.includes("und_err")
  ) {
    return true;
  }

  if (code && /^[a-z0-9_]+$/.test(code) && code.includes("_")) {
    return true;
  }

  if (/^[A-Z][a-zA-Z]+Error:/.test(message)) {
    return true;
  }

  return false;
}

/** Never surface raw infrastructure or Supabase errors to users. */
export function humanizeAuthError(error: unknown): string {
  if (isServiceUnavailableError(error)) {
    return getAuthErrorMessage(AUTH_ERROR_CODES.unavailable)!;
  }

  const { message: rawMessage, code, status } = extractAuthError(error);
  const message = rawMessage ?? "";
  const normalizedCode = (code ?? "").toLowerCase();
  const lower = message.toLowerCase();

  if (normalizedCode && CODE_MESSAGES[normalizedCode]) {
    return CODE_MESSAGES[normalizedCode];
  }

  if (
    lower.includes("rate limit") ||
    lower.includes("too many") ||
    lower.includes("email rate") ||
    status === 429
  ) {
    return "Too many requests. Please try again in a few minutes.";
  }

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

  if (
    lower.includes("unable to send email") ||
    lower.includes("error sending") ||
    lower.includes("smtp")
  ) {
    return "Unable to send email right now. Please try again later.";
  }

  if (lower.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }

  if (lower.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }

  if (
    lower.includes("user already registered") ||
    lower.includes("already been registered") ||
    lower.includes("email address is already") ||
    lower.includes("already exists")
  ) {
    return "This email is already registered.";
  }

  if (
    lower.includes("missing next_public_supabase") ||
    lower.includes("missing supabase")
  ) {
    return "Authentication is not configured. Contact support.";
  }

  if (
    lower.includes("password") &&
    (lower.includes("weak") || lower.includes("at least"))
  ) {
    return "Password does not meet security requirements.";
  }

  if (
    lower.includes("profile") ||
    lower.includes("authentication failed") ||
    lower.includes("session") ||
    lower.includes("jwt")
  ) {
    return "Please sign in to continue.";
  }

  if (looksTechnical(message, normalizedCode || null)) {
    return "Something went wrong. Please try again.";
  }

  if (message.trim()) {
    return message;
  }

  return "Something went wrong. Please try again.";
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
