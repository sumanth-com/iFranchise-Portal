type UploadLogPayload = Record<string, unknown>;

export function logUpload(stage: string, payload: UploadLogPayload = {}) {
  const prefix = `[UPLOAD ${stage}]`;
  console.error(prefix, JSON.stringify(payload, null, 2));
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message: unknown }).message;
    return typeof msg === "string" ? msg : JSON.stringify(msg);
  }
  return String(error);
}

export function logUploadError(stage: string, error: unknown, context: UploadLogPayload = {}) {
  const message = extractErrorMessage(error);

  console.error(`[UPLOAD ${stage} ERROR]`, {
    ...context,
    message,
    error:
      error && typeof error === "object"
        ? { ...(error as Record<string, unknown>), message }
        : { message },
  });
}
