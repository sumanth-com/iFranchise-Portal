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

export function splitDateTime(value: string | null): { date: string; time: string } {
  if (!value) return { date: "—", time: "—" };
  const d = new Date(value);
  return {
    date:
      formatDate(value) ??
      d.toLocaleDateString(LOCALE, {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    time: d.toLocaleTimeString(LOCALE, {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

/** Inbox-style label: Today · 10:30 AM, Yesterday, 2 days ago */
export function formatFriendlyTimestamp(value: string | null): string {
  if (!value) return "—";

  const d = new Date(value);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor(
    (startOfToday.getTime() - startOfDate.getTime()) / 86_400_000,
  );
  const time = d.toLocaleTimeString(LOCALE, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (diffDays === 0) return `Today · ${time}`;
  if (diffDays === 1) return `Yesterday · ${time}`;
  if (diffDays < 7) return `${diffDays} days ago`;

  const date = d.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${date} · ${time}`;
}

/** Activity center: 5 Jun 2026 · 10:30 AM */
export function formatNotificationTimestamp(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  const date = d.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString(LOCALE, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}

export function formatRelativeTime(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const diffMs = Date.now() - new Date(value).getTime();
  if (diffMs < 0) {
    return "just now";
  }

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return formatDate(value);
}
