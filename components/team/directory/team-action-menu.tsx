"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  Pencil,
  Shield,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import type { TeamDirectoryMember } from "@/types/team-directory";

export type TeamAction =
  | "view"
  | "edit"
  | "role"
  | "activate"
  | "deactivate"
  | "remove";

type TeamActionMenuProps = {
  member: TeamDirectoryMember | null;
  position: { top: number; left: number } | null;
  isSuperAdmin: boolean;
  onAction: (action: TeamAction, member: TeamDirectoryMember) => void;
  onClose: () => void;
};

export function TeamActionMenu({
  member,
  position,
  isSuperAdmin,
  onAction,
  onClose,
}: TeamActionMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const items: {
    id: TeamAction;
    label: string;
    icon: typeof Eye;
    danger?: boolean;
    hidden?: boolean;
  }[] = [
    { id: "view", label: "View Profile", icon: Eye },
    { id: "edit", label: "Edit Details", icon: Pencil },
    { id: "role", label: "Change Role", icon: Shield },
    {
      id: member?.status === "active" ? "deactivate" : "activate",
      label: member?.status === "active" ? "Deactivate Account" : "Activate Account",
      icon: member?.status === "active" ? UserX : UserCheck,
    },
    {
      id: "remove",
      label: "Remove Team Member",
      icon: Trash2,
      danger: true,
      hidden: !isSuperAdmin,
    },
  ];

  return (
    <AnimatePresence>
      {member && position ? (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          style={{ top: position.top, left: position.left }}
          className="fixed z-50 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-slate-900/5"
        >
          {items
            .filter((i) => !i.hidden)
            .map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onAction(item.id, member);
                    onClose();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors",
                    item.danger
                      ? "text-rose-600 hover:bg-rose-50"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-70" />
                  {item.label}
                </button>
              );
            })}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
