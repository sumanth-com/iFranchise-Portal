export type AuthEventName =
  | "auth.login.attempt"
  | "auth.login.success"
  | "auth.login.failure"
  | "auth.signup.attempt"
  | "auth.signup.success"
  | "auth.signup.failure"
  | "auth.password_reset.request"
  | "auth.password_reset.success"
  | "auth.password_reset.failure"
  | "auth.logout";

type AuthEventPayload = {
  email?: string;
  userId?: string;
  role?: string;
  code?: string | null;
  reason?: string;
  latencyMs?: number;
};

function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 1) return "***";
  return `${trimmed.slice(0, 1)}***${trimmed.slice(at)}`;
}

/** Structured auth audit logs — safe for production (no passwords). */
export function logAuthEvent(name: AuthEventName, payload: AuthEventPayload = {}): void {
  const entry = {
    ts: new Date().toISOString(),
    event: name,
    ...(payload.email ? { email: maskEmail(payload.email) } : {}),
    ...(payload.userId ? { userId: payload.userId } : {}),
    ...(payload.role ? { role: payload.role } : {}),
    ...(payload.code ? { code: payload.code } : {}),
    ...(payload.reason ? { reason: payload.reason } : {}),
    ...(payload.latencyMs != null ? { latencyMs: payload.latencyMs } : {}),
  };

  console.log(JSON.stringify(entry));
}
