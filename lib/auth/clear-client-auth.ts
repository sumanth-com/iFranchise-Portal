/** localStorage key prefixes tied to authenticated user state. */
const AUTH_STORAGE_PREFIXES = [
  "ifranchise-admin-notifications-read",
  "ifranchise-notifications-read",
  "ifranchise-settings",
  "ifranchise-profile-extras",
] as const;

/**
 * Clears client-side caches that must not survive logout.
 * Safe to call without a user id — scans all matching keys.
 */
export function clearClientAuthStorage(userId?: string | null): void {
  if (typeof window === "undefined") return;

  try {
    const keysToRemove = new Set<string>();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (AUTH_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        keysToRemove.add(key);
      }

      if (userId && key.endsWith(`-${userId}`)) {
        keysToRemove.add(key);
      }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
}
