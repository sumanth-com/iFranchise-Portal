type AuthLikeError = {
  message?: string;
  status?: number;
  code?: string;
  name?: string;
};

/** Expired or invalid sessions should log the user out — not show "service unavailable". */
export function isInvalidSessionError(error: AuthLikeError): boolean {
  const code = (error.code ?? "").toLowerCase();
  const message = (error.message ?? "").toLowerCase();

  if (
    code === "refresh_token_not_found" ||
    code === "session_not_found" ||
    code === "bad_jwt" ||
    code === "invalid_jwt"
  ) {
    return true;
  }

  if (error.status === 401 || error.status === 403) {
    return true;
  }

  if (
    message.includes("invalid refresh token") ||
    message.includes("refresh token not found") ||
    message.includes("jwt expired") ||
    message.includes("session missing")
  ) {
    return true;
  }

  return false;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String((error as AuthLikeError).message ?? "");
  }
  return "";
}

function getErrorName(error: unknown): string {
  if (error instanceof Error) {
    return error.name;
  }
  if (error && typeof error === "object" && "name" in error) {
    return String((error as AuthLikeError).name ?? "");
  }
  return "";
}

/** Network, timeout, or infrastructure failures — show unavailable state. */
export function isServiceUnavailableError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  const name = getErrorName(error);

  if (
    name === "AbortError" ||
    message.includes("timed out") ||
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("econnrefused") ||
    message.includes("enotfound")
  ) {
    return true;
  }

  return false;
}

export type ResolveUserResult =
  | { user: { id: string } | null; unavailable: false }
  | { user: null; unavailable: true };

/**
 * Resolve the authenticated user from a Supabase getUser() response.
 * Invalid sessions resolve to logged-out; only true outages set unavailable.
 */
export function resolveUserFromGetUser(
  authUser: { id: string } | null,
  error: AuthLikeError | null,
): ResolveUserResult {
  if (!error) {
    return { user: authUser, unavailable: false };
  }

  if (isInvalidSessionError(error)) {
    return { user: null, unavailable: false };
  }

  if (isServiceUnavailableError(error)) {
    return { user: null, unavailable: true };
  }

  // Unknown auth API errors — treat as logged out to avoid redirect loops.
  return { user: null, unavailable: false };
}
