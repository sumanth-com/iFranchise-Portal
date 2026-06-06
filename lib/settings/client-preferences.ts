"use client";

export type ThemeMode = "light" | "dark" | "system";

export type SettingsPreferences = {
  emailAlerts: boolean;
  reviewUpdates: boolean;
  approvalUpdates: boolean;
  marketplaceMessages: boolean;
  theme: ThemeMode;
};

const KEY = "ifranchise-settings";

export function defaultSettings(): SettingsPreferences {
  return {
    emailAlerts: true,
    reviewUpdates: true,
    approvalUpdates: true,
    marketplaceMessages: true,
    theme: "light",
  };
}

export function loadSettings(userId: string): SettingsPreferences {
  if (typeof window === "undefined") return defaultSettings();
  try {
    const raw = localStorage.getItem(`${KEY}-${userId}`);
    if (!raw) return defaultSettings();
    return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(userId: string, prefs: SettingsPreferences) {
  localStorage.setItem(`${KEY}-${userId}`, JSON.stringify(prefs));
}

export function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  root.classList.toggle("dark", dark);
  root.dataset.theme = theme;
}
