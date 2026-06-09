"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { resolveFirstName } from "@/lib/utils";

type TopbarGreetingProps = {
  displayName: string;
  email: string;
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const CYCLE_MS = 3800;

const fadeDownVariants = {
  enter: {
    opacity: 0,
    y: -16,
  },
  center: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: 16,
  },
};

function getTimeGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 22) return "Good Evening";
  return "Welcome";
}

type GreetingItem = {
  id: string;
  content: ReactNode;
};

function buildGreetings(firstName: string): GreetingItem[] {
  const now = new Date();
  const dayName = DAY_NAMES[now.getDay()];
  const timeGreeting = getTimeGreeting(now.getHours());

  return [
    { id: "day", content: `Happy ${dayName}, ${firstName}` },
    { id: "time", content: `${timeGreeting}, ${firstName}` },
    {
      id: "welcome",
      content: (
        <>
          Welcome to{" "}
          <span className="topbar-brand-shimmer font-bold">iFranchise</span>
        </>
      ),
    },
  ];
}

const WELCOME_FALLBACK: GreetingItem = {
  id: "welcome",
  content: (
    <>
      Welcome to{" "}
      <span className="topbar-brand-shimmer font-bold">iFranchise</span>
    </>
  ),
};

export function TopbarGreetingCarousel({
  displayName,
  email,
}: TopbarGreetingProps) {
  const firstName = resolveFirstName(displayName, email);
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);

  const greetings = useMemo(
    () => (mounted ? buildGreetings(firstName) : [WELCOME_FALLBACK]),
    [firstName, mounted],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || greetings.length < 2) return;

    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % greetings.length);
    }, CYCLE_MS);

    return () => window.clearInterval(timer);
  }, [greetings.length, mounted]);

  const currentGreeting = greetings[index] ?? greetings[0]!;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20 backdrop-blur-sm"
        aria-hidden
      >
        <motion.span
          className="absolute inset-0 rounded-lg bg-white/10"
          animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.06, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <Sparkles className="relative h-4 w-4 text-white" strokeWidth={2} />
      </motion.span>

      <div className="relative min-h-[1.35rem] min-w-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.h1
            key={currentGreeting.id}
            variants={fadeDownVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 truncate text-[15px] font-semibold leading-tight tracking-tight text-white sm:text-base"
          >
            {currentGreeting.content}
          </motion.h1>
        </AnimatePresence>
      </div>
    </div>
  );
}
