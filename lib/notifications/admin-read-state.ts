"use client";

const READ_KEY = "ifranchise-admin-notifications-read";

export const ADMIN_NOTIFICATIONS_READ_EVENT = "admin-notifications-read-changed";

function loadReadIds(userId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(`${READ_KEY}-${userId}`);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveReadIds(userId: string, ids: Set<string>) {
  localStorage.setItem(`${READ_KEY}-${userId}`, JSON.stringify([...ids]));
}

function notifyReadChange() {
  window.dispatchEvent(new CustomEvent(ADMIN_NOTIFICATIONS_READ_EVENT));
}

export function getAdminReadNotificationIds(userId: string): Set<string> {
  return loadReadIds(userId);
}

export function markAdminNotificationRead(userId: string, id: string) {
  const ids = loadReadIds(userId);
  if (ids.has(id)) return;
  ids.add(id);
  saveReadIds(userId, ids);
  notifyReadChange();
}

export function countAdminUnread(
  userId: string,
  notificationIds: string[],
): number {
  const read = loadReadIds(userId);
  return notificationIds.filter((id) => !read.has(id)).length;
}
