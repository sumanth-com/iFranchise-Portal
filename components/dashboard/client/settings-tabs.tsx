"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { GlassCard } from "@/components/dashboard/client/glass-card";
import { PortalPageHeader } from "@/components/dashboard/client/portal-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-provider";
import { formatDateTime } from "@/lib/format-date";
import { updateProfileAction } from "@/lib/profile/actions";
import { initialProfileActionState } from "@/lib/profile/types";
import {
  clearProfileAvatar,
  cropImageToSquare,
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
import {
  Bell,
  Briefcase,
  Camera,
  LayoutGrid,
  List,
  Lock,
  Monitor,
  Moon,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";

type SettingsTabsProps = {
  userId: string;
  email: string;
  fullName: string | null;
  createdAt: string;
};

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: Briefcase },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const SUCCESS_TOAST = "Changes saved successfully.";

export function SettingsTabs({
  userId,
  email,
  fullName,
  createdAt,
}: SettingsTabsProps) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState<SectionId>("profile");
  const [prefs, setPrefs] = useState<SettingsPreferences>(() =>
    loadSettings(userId),
  );
  const [name, setName] = useState(fullName ?? "");
  const [phone, setPhone] = useState("");
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileAction,
    initialProfileActionState,
  );

  useEffect(() => {
    const extras = loadProfileExtras(userId);
    setPrefs(loadSettings(userId));
    setPhone(extras.phone);
    setAvatarUrl(extras.avatarDataUrl);
    setName(fullName ?? "");
    applyTheme(loadSettings(userId).theme);
    setReady(true);
  }, [userId, fullName]);

  useEffect(() => {
    if (profileState.message) toast(SUCCESS_TOAST, "success");
    if (profileState.error) toast(profileState.error, "error");
  }, [profileState.message, profileState.error, toast]);

  const displayAvatar = previewAvatar ?? avatarUrl;
  const initials = (name || email).slice(0, 2).toUpperCase();

  const savePrefs = (next: SettingsPreferences, message = SUCCESS_TOAST) => {
    setPrefs(next);
    saveSettings(userId, next);
    applyTheme(next.theme);
    toast(message, "success");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Please select an image file.", "error");
      return;
    }
    try {
      const cropped = await cropImageToSquare(file);
      setPreviewAvatar(cropped);
    } catch {
      toast("Could not process image.", "error");
    }
    e.target.value = "";
  };

  const persistProfileExtras = () => {
    const extras = loadProfileExtras(userId);
    const nextAvatar = previewAvatar ?? extras.avatarDataUrl;
    saveProfileExtras(userId, { ...extras, phone, avatarDataUrl: nextAvatar });
    setAvatarUrl(nextAvatar);
    setPreviewAvatar(null);
    window.dispatchEvent(new CustomEvent("profile-updated"));
  };

  const handleRemoveAvatar = () => {
    clearProfileAvatar(userId);
    setPreviewAvatar(null);
    setAvatarUrl(null);
    window.dispatchEvent(new CustomEvent("profile-updated"));
    toast("Profile photo removed.", "info");
  };

  const scrollTo = (id: SectionId) => {
    setActive(id);
    document.getElementById(`settings-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (!ready) {
    return (
      <div className="portal-page animate-pulse space-y-6">
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="h-64 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="portal-page space-y-6">
      <PortalPageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Manage your profile, account security, notifications, and portal preferences."
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <nav className="flex shrink-0 gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-1.5 lg:sticky lg:top-0 lg:w-52 lg:flex-col">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(id)}
              className={cn(
                "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active === id
                  ? "bg-gradient-to-r from-[#6D28D9] to-[#5B21B6] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1 space-y-5">
          <GlassCard id="settings-profile" padding="lg">
            <h2 className="text-base font-semibold text-slate-900">Profile</h2>
            <p className="mt-1 text-sm text-slate-500">
              Your public identity across the iFranchise portal.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-5">
              <div className="relative">
                {displayAvatar ? (
                  <Image
                    src={displayAvatar}
                    alt=""
                    width={80}
                    height={80}
                    unoptimized
                    className="h-20 w-20 rounded-2xl object-cover ring-2 ring-[#6D28D9]/15"
                  />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] text-lg font-bold text-white shadow-md">
                    {initials}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:text-[#6D28D9]"
                  aria-label="Change photo"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {displayAvatar ? (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove photo
                </button>
              ) : null}
            </div>

            <form
              action={profileAction}
              onSubmit={() => {
                persistProfileExtras();
              }}
              className="mt-6 grid gap-5 sm:grid-cols-2"
            >
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="settings-name">Name</Label>
                <Input
                  id="settings-name"
                  name="full_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={profilePending}>
                  {profilePending ? "Saving…" : "Save profile"}
                </Button>
              </div>
            </form>
          </GlassCard>

          <GlassCard id="settings-account" padding="lg">
            <h2 className="text-base font-semibold text-slate-900">Account</h2>
            <p className="mt-1 text-sm text-slate-500">
              Password and session security for your account.
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-slate-200 px-4 py-4">
                <p className="text-sm font-medium text-slate-900">Password</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Use the forgot password flow on the login page to reset your
                  password securely.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 px-4 py-4">
                <p className="text-sm font-medium text-slate-900">Security</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Member since {formatDateTime(createdAt) ?? createdAt}. You are
                  signed in on this device.
                </p>
                <div className="mt-4">
                  <LogoutButton />
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard id="settings-notifications" padding="lg">
            <h2 className="text-base font-semibold text-slate-900">
              Notifications
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose how you receive updates about your listings.
            </p>
            <div className="mt-6 space-y-3">
              <ToggleRow
                label="Email notifications"
                description="Receive important updates and review outcomes via email."
                checked={prefs.emailAlerts}
                onChange={(v) => savePrefs({ ...prefs, emailAlerts: v })}
              />
              <ToggleRow
                label="Platform notifications"
                description="Show in-app alerts for submissions, reviews, and marketplace activity."
                checked={prefs.platformNotifications}
                onChange={(v) =>
                  savePrefs({ ...prefs, platformNotifications: v })
                }
              />
            </div>
          </GlassCard>

          <GlassCard id="settings-preferences" padding="lg">
            <h2 className="text-base font-semibold text-slate-900">
              Preferences
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Dashboard layout and appearance defaults.
            </p>

            <div className="mt-6 space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900">Default view</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      { id: "grid", label: "Grid view", icon: LayoutGrid },
                      { id: "list", label: "List view", icon: List },
                    ] as const
                  ).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        savePrefs({ ...prefs, defaultBrandView: id })
                      }
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-medium transition-all duration-200",
                        prefs.defaultBrandView === id
                          ? "border-[#6D28D9] bg-[#6D28D9]/5 text-[#6D28D9] ring-1 ring-[#6D28D9]/20"
                          : "border-slate-200 text-slate-600 hover:border-slate-300",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <ToggleRow
                label="Show activity timeline"
                description="Display submission timeline on your dashboard home."
                checked={prefs.showTimeline}
                onChange={(v) => savePrefs({ ...prefs, showTimeline: v })}
              />
              <ToggleRow
                label="Compact dashboard"
                description="Use a denser layout for stats and portfolio widgets."
                checked={prefs.compactDashboard}
                onChange={(v) => savePrefs({ ...prefs, compactDashboard: v })}
              />

              <div className="space-y-3 border-t border-slate-100 pt-6">
                <p className="text-sm font-medium text-slate-900">Appearance</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(
                    [
                      { id: "light", label: "Light", icon: Sun },
                      { id: "dark", label: "Dark", icon: Moon },
                      { id: "system", label: "System", icon: Monitor },
                    ] as const
                  ).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        savePrefs({ ...prefs, theme: id as ThemeMode })
                      }
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm font-medium transition-all duration-200",
                        prefs.theme === id
                          ? "border-[#6D28D9] bg-[#6D28D9]/5 text-[#6D28D9] ring-1 ring-[#6D28D9]/20"
                          : "border-slate-200 text-slate-600 hover:border-slate-300",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
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
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 px-4 py-4 transition-colors duration-200 hover:bg-slate-50/80">
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
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-[#6D28D9]" : "bg-slate-200",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </label>
  );
}
