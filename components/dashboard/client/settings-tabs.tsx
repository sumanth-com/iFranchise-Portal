"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { AvatarCropDialog } from "@/components/dashboard/client/avatar-crop-dialog";
import { GlassCard } from "@/components/dashboard/client/glass-card";
import { PortalDocumentation } from "@/components/dashboard/client/portal-documentation";
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
  loadProfileExtras,
  saveProfileExtras,
} from "@/lib/profile/client-preferences";
import { dispatchProfileUpdated } from "@/lib/profile/profile-events";
import {
  applyTheme,
  loadSettings,
  saveSettings,
  type SettingsPreferences,
  type ThemeMode,
} from "@/lib/settings/client-preferences";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Camera,
  HelpCircle,
  LayoutGrid,
  List,
  Lock,
  Mail,
  MessageCircle,
  Monitor,
  Moon,
  Palette,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  { id: "preferences", label: "Preferences", icon: Palette },
  { id: "support", label: "Help & Support", icon: HelpCircle },
] as const;

const SUPPORT_OPTIONS = [
  {
    icon: MessageCircle,
    title: "Live chat",
    description: "Reach our team during business hours.",
    href: "mailto:support@ifranchise.com?subject=Support%20Request",
    cta: "Start chat",
  },
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Full guide to iFranchise and the Brand Owner Portal.",
    cta: "Browse docs",
    action: "documentation" as const,
  },
  {
    icon: Mail,
    title: "Email support",
    description: "Account, billing, or listing questions.",
    href: "mailto:support@ifranchise.com",
    cta: "Send email",
  },
] as const;

const SUPPORT_QUICK_TIPS = [
  "Complete every listing section before you submit — reviewers and investors both judge incomplete profiles first.",
  "Use Marketplace Preview and read your brand like a buyer would: clear story, strong visuals, no gaps.",
  "Keep investment ranges, fees, and unit economics accurate — credibility is what serious franchisees bet on.",
  "Submit once your profile is ready; rushing a draft is the fastest way to stall in review.",
  "Check Notifications daily and reply quickly to feedback — responsive owners get approved and live sooner.",
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const SUCCESS_TOAST = "Changes saved successfully.";

const ACTIVE_PILL =
  "dash-on-color bg-gradient-to-r from-[#6D28D9] to-[#5B21B6] !text-white shadow-sm";

export function SettingsTabs({
  userId,
  email,
  fullName,
  createdAt,
}: SettingsTabsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState<SectionId>("profile");
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [prefs, setPrefs] = useState<SettingsPreferences>(() =>
    loadSettings(userId),
  );
  const [name, setName] = useState(fullName ?? "");
  const [phone, setPhone] = useState("");
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
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
    if (profileState.error) toast(profileState.error, "error");
  }, [profileState.error, toast]);

  const displayAvatar = previewAvatar ?? avatarUrl;
  const initials = (name || email).slice(0, 2).toUpperCase();

  const updatePrefs = (
    patch: Partial<SettingsPreferences>,
    options?: { notify?: boolean },
  ) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    saveSettings(userId, next);
    if (patch.theme !== undefined) applyTheme(next.theme);
    if (options?.notify) toast(SUCCESS_TOAST, "success");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Please select an image file.", "error");
      return;
    }
    const url = URL.createObjectURL(file);
    setCropSource(url);
    e.target.value = "";
  };

  const closeCrop = () => {
    if (cropSource?.startsWith("blob:")) URL.revokeObjectURL(cropSource);
    setCropSource(null);
  };

  const handleCropConfirm = (dataUrl: string) => {
    const extras = loadProfileExtras(userId);
    saveProfileExtras(userId, { ...extras, phone, avatarDataUrl: dataUrl });
    setAvatarUrl(dataUrl);
    setPreviewAvatar(null);
    dispatchProfileUpdated({ avatarDataUrl: dataUrl });
    closeCrop();
    toast("Profile photo updated.", "success");
  };

  const persistProfileExtras = () => {
    const extras = loadProfileExtras(userId);
    const nextAvatar = previewAvatar ?? extras.avatarDataUrl;
    saveProfileExtras(userId, { ...extras, phone, avatarDataUrl: nextAvatar });
    setAvatarUrl(nextAvatar);
    setPreviewAvatar(null);
    dispatchProfileUpdated({
      fullName: name.trim(),
      avatarDataUrl: nextAvatar,
    });
  };

  const handleRemoveAvatar = () => {
    clearProfileAvatar(userId);
    setPreviewAvatar(null);
    setAvatarUrl(null);
    dispatchProfileUpdated({ avatarDataUrl: null });
    toast("Profile photo removed.", "info");
  };

  const openPhotoPicker = () => fileRef.current?.click();

  useEffect(() => {
    if (!profileState.message) return;
    persistProfileExtras();
    router.refresh();
    toast(SUCCESS_TOAST, "success");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run only on successful save
  }, [profileState.message]);

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
      {cropSource ? (
        <AvatarCropDialog
          imageSrc={cropSource}
          onCancel={closeCrop}
          onConfirm={handleCropConfirm}
        />
      ) : null}

      <PortalPageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Manage your profile, account security, and portal preferences."
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <nav className="flex shrink-0 gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-1.5 lg:sticky lg:top-0 lg:w-52 lg:flex-col">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActive(id);
                if (id !== "support") setShowDocumentation(false);
              }}
              className={cn(
                "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                active === id ? ACTIVE_PILL : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {active === "profile" ? (
            <GlassCard padding="lg">
              <h2 className="text-base font-semibold text-slate-900">Profile</h2>
              <p className="mt-1 text-sm text-slate-500">
                Your public identity across the iFranchise portal.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-5">
                <div className="relative">
                  <button
                    type="button"
                    onClick={openPhotoPicker}
                    className="group relative block overflow-hidden rounded-sm ring-2 ring-[#6D28D9]/15 transition-shadow hover:ring-[#6D28D9]/35"
                    aria-label="Change profile photo"
                  >
                    {displayAvatar ? (
                      <Image
                        src={displayAvatar}
                        alt=""
                        width={80}
                        height={80}
                        unoptimized
                        className="h-20 w-20 object-cover"
                      />
                    ) : (
                      <span className="dash-on-color flex h-20 w-20 items-center justify-center bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] text-lg font-bold !text-white shadow-md">
                        {initials}
                      </span>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
                      <Camera className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={openPhotoPicker}
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:text-[#6D28D9]"
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

              <form action={profileAction} className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="settings-name">Name</Label>
                  <Input
                    id="settings-name"
                    name="fullName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
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
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your contact number"
                    autoComplete="tel"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button
                    type="submit"
                    disabled={profilePending}
                    className="dash-cta-purple !text-white"
                  >
                    {profilePending ? "Saving…" : "Save profile"}
                  </Button>
                </div>
              </form>
            </GlassCard>
          ) : null}

          {active === "account" ? (
            <GlassCard padding="lg">
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
          ) : null}

          {active === "preferences" ? (
            <GlassCard padding="lg" className="max-h-[min(72vh,640px)] overflow-y-auto">
              <h2 className="text-base font-semibold text-slate-900">
                Preferences
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Layout, alerts, and appearance — saved automatically on this device.
              </p>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Brand list view</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: "grid", label: "Grid", icon: LayoutGrid },
                        { id: "list", label: "List", icon: List },
                      ] as const
                    ).map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updatePrefs({ defaultBrandView: id })}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-all duration-200",
                          prefs.defaultBrandView === id
                            ? ACTIVE_PILL
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Appearance</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "light", label: "Light", icon: Sun },
                        { id: "dark", label: "Dark", icon: Moon },
                        { id: "system", label: "Auto", icon: Monitor },
                      ] as const
                    ).map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updatePrefs({ theme: id as ThemeMode })}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition-all duration-200",
                          prefs.theme === id
                            ? ACTIVE_PILL
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-2 lg:col-span-2">
                  <p className="text-sm font-semibold text-slate-900">Dashboard</p>
                  <ToggleRow
                    label="Activity timeline"
                    description="Show submission timeline on your dashboard home."
                    checked={prefs.showTimeline}
                    onChange={(v) => updatePrefs({ showTimeline: v })}
                  />
                  <ToggleRow
                    label="Compact layout"
                    description="Denser stats and portfolio cards on the dashboard."
                    checked={prefs.compactDashboard}
                    onChange={(v) => updatePrefs({ compactDashboard: v })}
                  />
                </section>

                <section className="space-y-2 lg:col-span-2">
                  <p className="text-sm font-semibold text-slate-900">Alerts</p>
                  <ToggleRow
                    label="In-app notifications"
                    description="Show real listing updates in your Notifications inbox."
                    checked={prefs.platformNotifications}
                    onChange={(v) => updatePrefs({ platformNotifications: v })}
                  />
                  <ToggleRow
                    label="Email updates"
                    description="Receive review outcomes and listing news by email when available."
                    checked={prefs.emailAlerts}
                    onChange={(v) => updatePrefs({ emailAlerts: v })}
                  />
                  <ToggleRow
                    label="Review progress"
                    description="Notify when your brand enters or completes review."
                    checked={prefs.reviewUpdates}
                    onChange={(v) => updatePrefs({ reviewUpdates: v })}
                  />
                  <ToggleRow
                    label="Approval & publish"
                    description="Notify when a listing is approved or goes live."
                    checked={prefs.approvalUpdates}
                    onChange={(v) => updatePrefs({ approvalUpdates: v })}
                  />
                </section>
              </div>
            </GlassCard>
          ) : null}

          {active === "support" && showDocumentation ? (
            <PortalDocumentation
              variant="embedded"
              onBack={() => setShowDocumentation(false)}
            />
          ) : null}

          {active === "support" && !showDocumentation ? (
            <GlassCard padding="lg">
              <h2 className="text-base font-semibold text-slate-900">
                Help & Support
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Get help with your listings, account, and the iFranchise portal.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SUPPORT_OPTIONS.map((option) => {
                  const { icon: Icon, title, description, cta } = option;
                  const href = "href" in option ? option.href : undefined;
                  const isDocs = "action" in option && option.action === "documentation";

                  return (
                    <div
                      key={title}
                      className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-[#6D28D9]/25 hover:bg-[#F5F3FF]/30"
                    >
                      <span className="dash-on-color flex h-10 w-10 items-center justify-center rounded-xl bg-[#6D28D9]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-3 text-sm font-semibold text-slate-900">
                        {title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {description}
                      </p>
                      {isDocs ? (
                        <button
                          type="button"
                          onClick={() => setShowDocumentation(true)}
                          className="mt-3 inline-flex text-xs font-semibold text-[#6D28D9] hover:underline"
                        >
                          {cta} →
                        </button>
                      ) : (
                        <Link
                          href={href!}
                          className="mt-3 inline-flex text-xs font-semibold text-[#6D28D9] hover:underline"
                        >
                          {cta} →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/60 p-5">
                <p className="text-sm font-semibold text-slate-900">Quick tips</p>
                <p className="mt-1 text-xs text-slate-500">
                  What successful brand owners do before going live.
                </p>
                <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                  {SUPPORT_QUICK_TIPS.map((tip, index) => (
                    <li key={tip} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F5F3FF] text-xs font-bold text-[#6D28D9]">
                        {index + 1}
                      </span>
                      <span className="pt-0.5">{tip}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </GlassCard>
          ) : null}
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
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition-colors hover:border-slate-300">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9]",
          checked ? "bg-[#6D28D9]" : "bg-slate-200",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}
