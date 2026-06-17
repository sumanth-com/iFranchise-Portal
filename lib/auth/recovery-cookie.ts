import { RECOVERY_COOKIE } from "@/lib/auth/recovery";

/** Mark an in-progress password recovery flow (readable by middleware + login page). */
export function markRecoveryFlow(): void {
  document.cookie = `${RECOVERY_COOKIE}=1; path=/; max-age=3600; SameSite=Lax`;
}

export function clearRecoveryFlow(): void {
  document.cookie = `${RECOVERY_COOKIE}=; path=/; max-age=0`;
}

export function hasRecoveryFlowCookie(): boolean {
  return document.cookie.split(";").some((part) => {
    const [name, value] = part.trim().split("=");
    return name === RECOVERY_COOKIE && value === "1";
  });
}
