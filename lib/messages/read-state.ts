"use client";

const READ_KEY = "ifranchise-messages-read";

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

export function getReadMessageIds(userId: string): Set<string> {
  return loadReadIds(userId);
}

export function markMessageRead(userId: string, id: string) {
  const ids = loadReadIds(userId);
  ids.add(id);
  saveReadIds(userId, ids);
}

export function countUnreadMessages(
  userId: string,
  messageIds: string[],
): number {
  const read = loadReadIds(userId);
  return messageIds.filter((id) => !read.has(id)).length;
}
