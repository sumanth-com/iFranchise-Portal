const REQUEST_TIMEOUT_MS = 30_000;
/** Middleware runs on every navigation — fail fast to avoid RSC "Failed to fetch". */
const MIDDLEWARE_TIMEOUT_MS = 8_000;
const MAX_ATTEMPTS = 2;
const MIDDLEWARE_MAX_ATTEMPTS = 1;
const RETRY_DELAY_MS = 1_500;

function isRetriableFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  const cause = error.cause as { code?: string; message?: string } | undefined;
  const causeCode = cause?.code ?? "";
  const causeMessage = (cause?.message ?? "").toLowerCase();

  return (
    error.name === "AbortError" ||
    message.includes("fetch failed") ||
    message.includes("timed out") ||
    message.includes("connect timeout") ||
    causeCode === "UND_ERR_CONNECT_TIMEOUT" ||
    causeCode === "UND_ERR_SOCKET" ||
    causeCode === "ECONNRESET" ||
    causeCode === "ENOTFOUND" ||
    causeMessage.includes("connect timeout")
  );
}

/**
 * Edge- and browser-safe fetch with timeout + one retry.
 * Used by middleware and client components (no Node-only modules).
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
  maxAttempts = MAX_ATTEMPTS,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      lastError = error;

      const shouldRetry =
        attempt < maxAttempts && isRetriableFetchError(error);

      if (shouldRetry) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        continue;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timed out after ${timeoutMs}ms`, {
          cause: error,
        });
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError;
}

/** Edge middleware — short timeout, no retry, never block navigation for long. */
export function fetchWithTimeoutMiddleware(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return fetchWithTimeout(
    input,
    init,
    MIDDLEWARE_TIMEOUT_MS,
    MIDDLEWARE_MAX_ATTEMPTS,
  );
}
