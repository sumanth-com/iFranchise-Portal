"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { createClientOptional } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C1.79 15.25 4.23 6.39 9.03 6.1c1.22.07 2.08.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.51 4.29zM12.03 6.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}

const providers = [
  { name: "Google", provider: "google", icon: GoogleIcon },
  { name: "Apple", provider: "apple", icon: AppleIcon },
  // Supabase uses "azure" for Microsoft OAuth.
  { name: "Microsoft", provider: "azure", icon: MicrosoftIcon },
] as const;

export function SocialAuthButtons() {
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {oauthError ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-100" role="alert">
          {oauthError}
        </p>
      ) : null}
      <div className="grid grid-cols-3 gap-3">
        {providers.map(({ name, provider, icon: Icon }) => (
          <motion.button
            key={name}
            type="button"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={pendingProvider !== null}
            onClick={async () => {
              setOauthError(null);
              try {
                setPendingProvider(provider);
                const supabase = createClientOptional();
                if (!supabase) {
                  setOauthError(
                    "Authentication is not configured. Check your environment variables.",
                  );
                  return;
                }

                const origin = window.location.origin;
                const { error } = await supabase.auth.signInWithOAuth({
                  provider,
                  options: {
                    redirectTo: `${origin}/auth/callback`,
                  },
                });

                if (error) {
                  setOauthError(error.message);
                }
              } catch {
                setOauthError("OAuth sign-in failed. Please try again.");
              } finally {
                setPendingProvider(null);
              }
            }}
            className="flex h-12 items-center justify-center rounded-[16px] border border-slate-200/80 bg-white/70 text-slate-700 shadow-[0_2px_12px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-colors hover:border-slate-300 hover:bg-white disabled:opacity-60"
            aria-label={`Continue with ${name}`}
          >
            <Icon />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
