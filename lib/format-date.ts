/** Fixed locale so server and client render identical date strings (avoids hydration mismatch). */
const LOCALE = "en-US";

export function formatDateTime(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return new Date(value).toLocaleString(LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDate(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return new Date(value).toLocaleDateString(LOCALE, {
    dateStyle: "medium",
  });
}
