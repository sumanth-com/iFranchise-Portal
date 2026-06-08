"use client";

export type ThemeMode = "light" | "dark" | "system";

export type BrandDefaultView = "grid" | "list";

export type SettingsPreferences = {
  emailAlerts: boolean;
  platformNotifications: boolean;
  reviewUpdates: boolean;
  approvalUpdates: boolean;
  marketplaceMessages: boolean;
  theme: ThemeMode;
  defaultBrandView: BrandDefaultView;
  showTimeline: boolean;
  compactDashboard: boolean;
};

const KEY = "ifranchise-settings";

export const SETTINGS_UPDATED_EVENT = "ifranchise-settings-updated";

export function defaultSettings(): SettingsPreferences {
  return {
    emailAlerts: true,
    platformNotifications: true,
    reviewUpdates: true,
    approvalUpdates: true,
    marketplaceMessages: true,
    theme: "light",
    defaultBrandView: "grid",
    showTimeline: true,
    compactDashboard: false,
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
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT));
  }
}

export function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  root.classList.toggle("dark", dark);
  root.dataset.theme = theme;
}
