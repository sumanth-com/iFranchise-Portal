"use client";

import { useEffect, useState } from "react";

import {
  defaultSettings,
  loadSettings,
  SETTINGS_UPDATED_EVENT,
  type SettingsPreferences,
} from "@/lib/settings/client-preferences";

export function useClientSettings(userId: string) {
  const [prefs, setPrefs] = useState<SettingsPreferences>(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setPrefs(loadSettings(userId));
    sync();
    setReady(true);
    window.addEventListener(SETTINGS_UPDATED_EVENT, sync);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, sync);
  }, [userId]);

  return { prefs, ready };
}
