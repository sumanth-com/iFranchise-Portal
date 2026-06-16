import { cache } from "react";

import { fetchProfileByUserId } from "@/lib/auth/fetch-profile";
import { ensureProfileForUser } from "@/lib/auth/ensure-profile";
import { authDebug } from "@/lib/auth/profile";
import { tryRefreshSession } from "@/lib/auth/refresh-session";
import {
  isInvalidSessionError,
  isServiceUnavailableError,
  resolveUserFromGetUser,
} from "@/lib/auth/resolve-auth";
import { createClientOptional } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/auth";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AuthSessionStatus =
  | "authenticated"
  | "anonymous"
  | "expired"
  | "unavailable";

export type AuthState = {
  status: AuthSessionStatus;
  user: { id: string; email?: string | null } | null;
  profile: Profile | null;
  role: UserRole | null;
};

type ResolveAuthStateOptions = {
  /** Attempt profile auto-repair when session exists but profile row is missing. */
  repairProfile?: boolean;
  supabase?: SupabaseClient | null;
};

/**
 * Single source of truth for session, user, profile, and role.
 * Cached per-request on the server via React cache().
 */
export const resolveAuthState = cache(
  async (options: ResolveAuthStateOptions = {}): Promise<AuthState> => {
    const empty: AuthState = {
      status: "anonymous",
      user: null,
      profile: null,
      role: null,
    };

    try {
      const supabase = options.supabase ?? (await createClientOptional());
      if (!supabase) {
        return { ...empty, status: "unavailable" };
      }

      let sessionExpired = false;

      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser();

      if (error && isInvalidSessionError(error)) {
        sessionExpired = true;
      }

      let resolved = resolveUserFromGetUser(authUser, error);

      if (resolved.unavailable) {
        return { ...empty, status: "unavailable" };
      }

      let user = resolved.user;

      if (!user && sessionExpired) {
        const refreshed = await tryRefreshSession(supabase);
        if (refreshed) {
          const {
            data: { user: refreshedUser },
            error: refreshUserError,
          } = await supabase.auth.getUser();
          resolved = resolveUserFromGetUser(refreshedUser, refreshUserError);
          if (resolved.unavailable) {
            return { ...empty, status: "unavailable" };
          }
          user = resolved.user;
          sessionExpired = false;
        }
      }

      if (!user) {
        return {
          ...empty,
          status: sessionExpired ? "expired" : "anonymous",
        };
      }

      let profile: Profile | null = null;

      try {
        const { profile: fetched } = await fetchProfileByUserId(
          supabase,
          user.id,
        );
        profile = fetched;
      } catch (profileError) {
        if (isServiceUnavailableError(profileError)) {
          return { ...empty, status: "unavailable" };
        }
      }

      if (!profile && options.repairProfile) {
        profile = await ensureProfileForUser(user, supabase);
        if (profile) {
          authDebug("auth-state:profile-repaired", {
            userId: user.id,
            profileId: profile.id,
          });
        }
      }

      return {
        status: "authenticated",
        user,
        profile,
        role: profile?.role ?? null,
      };
    } catch (error) {
      if (isServiceUnavailableError(error)) {
        return { ...empty, status: "unavailable" };
      }
      authDebug("auth-state:exception", {
        error: error instanceof Error ? error.message : String(error),
      });
      return empty;
    }
  },
);
