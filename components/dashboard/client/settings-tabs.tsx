"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { GlassCard } from "@/components/dashboard/client/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-provider";
import { formatDateTime } from "@/lib/format-date";
import {
  loadProfileExtras,
  saveProfileExtras,
} from "@/lib/profile/client-preferences";
import {
  applyTheme,
  loadSettings,
  saveSettings,
  type SettingsPreferences,
  type ThemeMode,
} from "@/lib/settings/client-preferences";
import { cn } from "@/lib/utils";
import { Bell, Lock, Monitor, Moon, Palette, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";

type SettingsTabsProps = {
  userId: string;
  email: string;
  fullName: string | null;
  createdAt: string;
};

const TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Lock },
  { id: "appearance", label: "Appearance", icon: Palette },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SettingsTabs({
  userId,
  email,
  fullName,
  createdAt,
}: SettingsTabsProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<TabId>("account");
  const [prefs, setPrefs] = useState<SettingsPreferences>(() =>
    loadSettings(userId),
  );
  const [account, setAccount] = useState(() => {
    const extras = loadProfileExtras(userId);
    return {
      name: fullName ?? "",
      phone: extras.phone,
      company: extras.companyName,
      location: extras.location,
    };
  });

  useEffect(() => {
    setPrefs(loadSettings(userId));
    const extras = loadProfileExtras(userId);
    setAccount({
      name: fullName ?? "",
      phone: extras.phone,
      company: extras.companyName,
      location: extras.location,
    });
    applyTheme(loadSettings(userId).theme);
  }, [userId, fullName]);

  const savePrefs = (next: SettingsPreferences) => {
    setPrefs(next);
    saveSettings(userId, next);
    applyTheme(next.theme);
    toast("Preferences saved.", "success");
  };

  const saveAccount = () => {
    const extras = loadProfileExtras(userId);
    saveProfileExtras(userId, {
      ...extras,
      phone: account.phone,
      companyName: account.company,
      location: account.location,
    });
    toast("Account details saved locally.", "success");
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6D28D9]">
          Preferences
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your account, notifications, security, and appearance.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-1.5 lg:w-56 lg:flex-col">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                tab === id
                  ? "bg-[#6D28D9]/10 text-[#6D28D9] shadow-sm"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <GlassCard padding="lg" className="min-w-0 flex-1">
          {tab === "account" && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-slate-900">Account</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="settings-name">Name</Label>
                  <Input
                    id="settings-name"
                    value={account.name}
                    onChange={(e) =>
                      setAccount((p) => ({ ...p, name: e.target.value }))
                    }
                    disabled
                    className="bg-slate-50"
                  />
                  <p className="text-xs text-slate-400">
                    Edit name on{" "}
                    <a href="/dashboard/profile" className="text-[#6D28D9]">
                      My Profile
                    </a>
                    .
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-email">Email</Label>
                  <Input
                    id="settings-email"
                    value={email}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-phone">Phone</Label>
                  <Input
                    id="settings-phone"
                    value={account.phone}
                    onChange={(e) =>
                      setAccount((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-company">Company</Label>
                  <Input
                    id="settings-company"
                    value={account.company}
                    onChange={(e) =>
                      setAccount((p) => ({ ...p, company: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-location">Location</Label>
                  <Input
                    id="settings-location"
                    value={account.location}
                    onChange={(e) =>
                      setAccount((p) => ({ ...p, location: e.target.value }))
                    }
                  />
                </div>
              </div>
              <Button type="button" onClick={saveAccount}>
                Save account details
              </Button>
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-slate-900">
                Notifications
              </h2>
              <ToggleRow
                label="Email alerts"
                description="Receive important updates via email."
                checked={prefs.emailAlerts}
                onChange={(v) => savePrefs({ ...prefs, emailAlerts: v })}
              />
              <ToggleRow
                label="Review updates"
                description="When an admin reviews your brand submission."
                checked={prefs.reviewUpdates}
                onChange={(v) => savePrefs({ ...prefs, reviewUpdates: v })}
              />
              <ToggleRow
                label="Approval updates"
                description="When your brand is approved or rejected."
                checked={prefs.approvalUpdates}
                onChange={(v) => savePrefs({ ...prefs, approvalUpdates: v })}
              />
              <ToggleRow
                label="Marketplace messages"
                description="Inquiries and messages from the marketplace."
                checked={prefs.marketplaceMessages}
                onChange={(v) =>
                  savePrefs({ ...prefs, marketplaceMessages: v })
                }
              />
            </div>
          )}

          {tab === "security" && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-slate-900">
                Security
              </h2>
              <div className="rounded-xl border border-slate-200 px-4 py-4">
                <p className="text-sm font-medium text-slate-900">
                  Change password
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Use the forgot password flow on the login page to reset your
                  password.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 px-4 py-4">
                <p className="text-sm font-medium text-slate-900">Last login</p>
                <p className="mt-1 text-xs text-slate-500">
                  Member since {formatDateTime(createdAt) ?? createdAt}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 px-4 py-4">
                <p className="text-sm font-medium text-slate-900">
                  Active sessions
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  You are signed in on this device. Sign out to end your
                  session.
                </p>
                <div className="mt-4">
                  <LogoutButton />
                </div>
              </div>
            </div>
          )}

          {tab === "appearance" && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-slate-900">
                Appearance
              </h2>
              <p className="text-sm text-slate-500">
                Choose how the portal looks on your device.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    { id: "light", label: "Light mode", icon: Sun },
                    { id: "dark", label: "Dark mode", icon: Moon },
                    { id: "system", label: "System mode", icon: Monitor },
                  ] as const
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => savePrefs({ ...prefs, theme: id as ThemeMode })}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 text-sm font-medium transition-all hover:shadow-md",
                      prefs.theme === id
                        ? "border-[#6D28D9] bg-[#6D28D9]/5 text-[#6D28D9] ring-2 ring-[#6D28D9]/20"
                        : "border-slate-200 text-slate-600 hover:border-slate-300",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 px-4 py-4 transition-colors hover:bg-slate-50/80">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-[#6D28D9]" : "bg-slate-200",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </label>
  );
}
