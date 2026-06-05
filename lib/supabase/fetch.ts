import { Agent, type Dispatcher } from "undici";

const CONNECT_TIMEOUT_MS = 30_000;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 1_500;

/** Longer connect timeout — default undici 10s fails on slow networks to Supabase. */
const supabaseDispatcher: Dispatcher = new Agent({
  connect: { timeout: CONNECT_TIMEOUT_MS },
  bodyTimeout: REQUEST_TIMEOUT_MS,
  headersTimeout: REQUEST_TIMEOUT_MS,
});

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

type FetchInitWithDispatcher = RequestInit & { dispatcher?: Dispatcher };

/**
 * Fetch wrapper with extended connect timeout and one retry for slow networks.
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const fetchInit: FetchInitWithDispatcher = {
        ...init,
        signal: controller.signal,
        dispatcher: supabaseDispatcher,
      };

      const response = await fetch(input, fetchInit);
      return response;
    } catch (error) {
      lastError = error;

      const shouldRetry =
        attempt < MAX_ATTEMPTS && isRetriableFetchError(error);

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
