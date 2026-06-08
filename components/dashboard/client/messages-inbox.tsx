"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Inbox,
  Mail,
  MessageSquare,
  Reply,
  Search,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import { PortalEmptyState } from "@/components/dashboard/client/portal-empty-state";
import { PortalPageHeader } from "@/components/dashboard/client/portal-page-header";
import { formatFriendlyTimestamp } from "@/lib/format-date";
import {
  countUnreadMessages,
  getReadMessageIds,
  markMessageRead,
} from "@/lib/messages/read-state";
import {
  MESSAGE_SECTION_LABELS,
  type MessageSection,
  type MessageThread,
} from "@/lib/messages/types";
import { cn } from "@/lib/utils";

type MessagesInboxProps = {
  userId: string;
  threads: MessageThread[];
};

const SECTIONS: {
  id: MessageSection | "all";
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "admin", label: "Admin" },
  { id: "review", label: "Review" },
  { id: "support", label: "Support" },
];

const SECTION_ICONS: Record<MessageSection, typeof Shield> = {
  admin: Shield,
  review: Users,
  support: MessageSquare,
};

export function MessagesInbox({ userId, threads }: MessagesInboxProps) {
  const [hydrated, setHydrated] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [section, setSection] = useState<MessageSection | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setReadIds(getReadMessageIds(userId));
    setHydrated(true);
    if (threads[0] && window.innerWidth >= 1024) {
      setSelectedId(threads[0].id);
    }
  }, [userId, threads]);

  const realThreads = useMemo(
    () => threads.filter((t) => t.id !== "support-welcome"),
    [threads],
  );

  const unreadCount = useMemo(() => {
    if (!hydrated) return 0;
    return countUnreadMessages(userId, threads.map((t) => t.id));
  }, [hydrated, userId, threads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads.filter((t) => {
      if (section !== "all" && t.section !== section) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.preview.toLowerCase().includes(q) ||
        t.brandName.toLowerCase().includes(q) ||
        t.sender.toLowerCase().includes(q)
      );
    });
  }, [threads, section, query]);

  const selected = useMemo(
    () => filtered.find((t) => t.id === selectedId) ?? null,
    [filtered, selectedId],
  );

  const openThread = useCallback(
    (thread: MessageThread) => {
      setSelectedId(thread.id);
      if (!readIds.has(thread.id)) {
        markMessageRead(userId, thread.id);
        setReadIds((prev) => new Set([...prev, thread.id]));
      }
    },
    [readIds, userId],
  );

  const isEmptyInbox = realThreads.length === 0;
  const isSearchEmpty = !isEmptyInbox && filtered.length === 0;

  return (
    <div className="portal-page space-y-6">
      <PortalPageHeader
        eyebrow="Inbox"
        title="Messages"
        description="Admin feedback, review updates, and support correspondence."
        action={
          hydrated && unreadCount > 0 ? (
            <span className="inline-flex items-center rounded-full bg-[#6D28D9]/10 px-3 py-1.5 text-xs font-semibold text-[#6D28D9]">
              {unreadCount} unread
            </span>
          ) : null
        }
      />

      {isEmptyInbox ? (
        <GlassCard>
          <PortalEmptyState
            icon={Inbox}
            title="No messages yet"
            description="When our team reviews your listings or requests changes, updates will appear here."
            action={
              <Link
                href="/dashboard/brands"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#6D28D9] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#5B21B6]"
              >
                View My Brands
              </Link>
            }
          />
        </GlassCard>
      ) : (
        <GlassCard padding="none" className="overflow-hidden">
          <div className="grid min-h-[28rem] lg:min-h-[32rem] lg:grid-cols-[minmax(0,20rem)_1fr] xl:grid-cols-[minmax(0,22rem)_1fr]">
            <div
              className={cn(
                "flex flex-col border-b border-slate-100 lg:border-b-0 lg:border-r",
                selected && "hidden lg:flex",
              )}
            >
              <div className="border-b border-slate-100 p-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search messages…"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#6D28D9]/40 focus:bg-white focus:ring-2 focus:ring-[#6D28D9]/15"
                  />
                </div>
                <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
                  {SECTIONS.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSection(id)}
                      className={cn(
                        "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                        section === id
                          ? "bg-gradient-to-r from-[#6D28D9] to-[#5B21B6] text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200/80",
                      )}
                    >
                      {id === "all"
                        ? label
                        : MESSAGE_SECTION_LABELS[id as MessageSection].replace(
                            " Messages",
                            "",
                          )}
                    </button>
                  ))}
                </div>
              </div>

              <ul className="flex-1 overflow-y-auto p-2">
                {isSearchEmpty ? (
                  <li className="px-4 py-10 text-center text-sm text-slate-500">
                    No messages match your search.
                  </li>
                ) : (
                  filtered.map((thread) => {
                    const isUnread = hydrated && !readIds.has(thread.id);
                    const isActive = selected?.id === thread.id;
                    const SectionIcon = SECTION_ICONS[thread.section];
                    return (
                      <li key={thread.id} className="mb-1">
                        <button
                          type="button"
                          onClick={() => openThread(thread)}
                          className={cn(
                            "w-full rounded-xl px-3 py-3.5 text-left transition-all duration-200",
                            isActive
                              ? "bg-[#6D28D9]/[0.08] ring-1 ring-[#6D28D9]/15"
                              : "hover:bg-slate-50 hover:shadow-sm",
                            isUnread &&
                              "bg-[#F5F3FF] ring-1 ring-[#6D28D9]/20",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={cn(
                                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                isUnread
                                  ? "bg-[#6D28D9] text-white"
                                  : "bg-slate-100 text-slate-500",
                              )}
                            >
                              <SectionIcon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={cn(
                                    "line-clamp-1 text-sm",
                                    isUnread
                                      ? "font-semibold text-slate-900"
                                      : "font-medium text-slate-700",
                                  )}
                                >
                                  {thread.title}
                                </p>
                                {isUnread ? (
                                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#6D28D9]" />
                                ) : null}
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                                {thread.preview}
                              </p>
                              <p className="mt-2 text-[11px] font-medium text-slate-400">
                                {formatFriendlyTimestamp(thread.date)}
                              </p>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex min-h-[22rem] flex-col"
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 lg:px-6">
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 lg:hidden"
                      aria-label="Back to inbox"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6D28D9]">
                        {MESSAGE_SECTION_LABELS[selected.section]}
                      </p>
                      <h2 className="truncate text-base font-semibold text-slate-900">
                        {selected.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-5 lg:px-6">
                    <div className="mb-5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                      <span>
                        <span className="font-medium text-slate-700">From</span>{" "}
                        {selected.sender}
                      </span>
                      <span>
                        <span className="font-medium text-slate-700">Brand</span>{" "}
                        {selected.brandName}
                      </span>
                      <span>
                        <span className="font-medium text-slate-700">Sent</span>{" "}
                        {formatFriendlyTimestamp(selected.date)}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap rounded-2xl border border-slate-100 bg-slate-50/70 px-5 py-4 text-sm leading-relaxed text-slate-700">
                      {selected.body}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 border-t border-slate-100 px-4 py-4 lg:px-6">
                    {selected.replyEnabled ? (
                      <Link
                        href={selected.href}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#5B21B6] hover:shadow-md"
                      >
                        <Reply className="h-4 w-4" />
                        Reply via listing
                      </Link>
                    ) : null}
                    <Link
                      href={selected.href}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:shadow-sm"
                    >
                      View listing
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <div className="hidden flex-col items-center justify-center px-6 py-16 text-center lg:flex">
                  <Mail className="h-10 w-10 text-slate-300" />
                  <p className="mt-4 font-semibold text-slate-900">
                    Select a message
                  </p>
                  <p className="mt-1 max-w-xs text-sm text-slate-500">
                    Choose a conversation from your inbox to read the full
                    message.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
