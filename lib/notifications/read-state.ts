"use client";

const READ_KEY = "ifranchise-notifications-read";

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

export function getReadNotificationIds(userId: string): Set<string> {
  return loadReadIds(userId);
}

export function markNotificationRead(userId: string, id: string) {
  const ids = loadReadIds(userId);
  ids.add(id);
  saveReadIds(userId, ids);
}

export function markAllNotificationsRead(userId: string, notificationIds: string[]) {
  const ids = loadReadIds(userId);
  notificationIds.forEach((id) => ids.add(id));
  saveReadIds(userId, ids);
}

export function deleteNotificationRead(userId: string, id: string) {
  const ids = loadReadIds(userId);
  ids.delete(id);
  saveReadIds(userId, ids);
}

export function countUnread(userId: string, notificationIds: string[]): number {
  const read = loadReadIds(userId);
  return notificationIds.filter((id) => !read.has(id)).length;
}

export function getDeletedNotificationIds(userId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(`${READ_KEY}-deleted-${userId}`);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function deleteNotification(userId: string, id: string) {
  const deleted = getDeletedNotificationIds(userId);
  deleted.add(id);
  localStorage.setItem(
    `${READ_KEY}-deleted-${userId}`,
    JSON.stringify([...deleted]),
  );
  markNotificationRead(userId, id);
}
