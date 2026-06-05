"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { Logo } from "@/components/ui/logo";
import { easeOut } from "@/lib/motion";

export function SplashScreen() {
  const particles = useMemo(() => {
    const count = 18;
    return Array.from({ length: count }).map((_, i) => {
      const x = (i * 37) % 100;
      const y = (i * 53) % 100;
      const size = 2 + (i % 4);
      const delay = (i % 6) * 0.08;
      return { x, y, size, delay };
    });
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <div
        className="splash-glow pointer-events-none absolute h-64 w-64 rounded-full bg-primary-600/30 blur-3xl"
        aria-hidden
      />

      {/* Particle accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p, idx) => (
          <motion.span
            key={idx}
            className="absolute rounded-full bg-primary-600/30"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              boxShadow: "0 0 18px rgba(109,40,217,0.25)",
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 1, 0.6], y: [8, -12, 4] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: easeOut }}
        className="relative z-10"
      >
        <Logo size="lg" />
      </motion.div>

      <motion.div
        className="relative z-10 mt-12 h-1.5 w-56 overflow-hidden rounded-full bg-primary-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#6D28D9] via-[#8B5CF6] to-[#A78BFA]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.1, ease: easeOut, delay: 0.15 }}
        />
      </motion.div>

      <motion.p
        className="relative z-10 mt-8 text-sm font-medium text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        iFranchise Portal
      </motion.p>
    </motion.div>
  );
}
