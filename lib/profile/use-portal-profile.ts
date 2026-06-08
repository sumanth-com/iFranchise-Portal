"use client";

import { useCallback, useEffect, useState } from "react";

import { loadProfileExtras } from "@/lib/profile/client-preferences";
import {
  PROFILE_UPDATED_EVENT,
  type ProfileUpdatedDetail,
} from "@/lib/profile/profile-events";

export function usePortalProfile(
  userId: string,
  serverFullName?: string | null,
  serverEmail?: string,
) {
  const [fullName, setFullName] = useState(serverFullName ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const syncExtras = useCallback(() => {
    const extras = loadProfileExtras(userId);
    setAvatarUrl(extras.avatarDataUrl);
  }, [userId]);

  useEffect(() => {
    setFullName(serverFullName ?? "");
  }, [serverFullName]);

  useEffect(() => {
    syncExtras();
    setReady(true);

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ProfileUpdatedDetail>).detail;
      if (detail?.fullName !== undefined) {
        setFullName(detail.fullName);
      }
      if (detail?.avatarDataUrl !== undefined) {
        setAvatarUrl(detail.avatarDataUrl);
      } else {
        syncExtras();
      }
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, handler);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handler);
  }, [syncExtras]);

  const trimmed = fullName.trim();
  const displayName =
    trimmed || serverEmail?.split("@")[0] || "Brand Owner";

  return {
    fullName,
    displayName,
    avatarUrl,
    ready,
  };
}
