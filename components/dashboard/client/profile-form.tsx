"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import Image from "next/image";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AvatarCropDialog } from "@/components/dashboard/client/avatar-crop-dialog";
import { GlassCard } from "@/components/dashboard/client/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-provider";
import { updateProfileAction } from "@/lib/profile/actions";
import { initialProfileActionState } from "@/lib/profile/types";
import {
  clearProfileAvatar,
  loadProfileExtras,
  saveProfileExtras,
  type ClientProfileExtras,
} from "@/lib/profile/client-preferences";
import { dispatchProfileUpdated } from "@/lib/profile/profile-events";

type ProfileFormProps = {
  userId: string;
  email: string;
  fullName: string | null;
};

export function ProfileForm({ userId, email, fullName }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [extras, setExtras] = useState<ClientProfileExtras>(() =>
    loadProfileExtras(userId),
  );
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [name, setName] = useState(fullName ?? "");
  const [mounted, setMounted] = useState(false);

  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialProfileActionState,
  );

  useEffect(() => {
    setMounted(true);
    setExtras(loadProfileExtras(userId));
  }, [userId]);

  useEffect(() => {
    if (state.error) toast(state.error, "error");
  }, [state.error, toast]);

  useEffect(() => {
    if (!state.message) return;
    const next = {
      ...extras,
      avatarDataUrl: previewAvatar ?? extras.avatarDataUrl,
    };
    persistExtras(next);
    setPreviewAvatar(null);
    router.refresh();
    toast(state.message, "success");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run only on successful save
  }, [state.message]);

  const displayAvatar = previewAvatar ?? extras.avatarDataUrl;
  const initials = (name || email).slice(0, 2).toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Please select an image file.", "error");
      return;
    }
    setCropSource(URL.createObjectURL(file));
    e.target.value = "";
  };

  const closeCrop = () => {
    if (cropSource?.startsWith("blob:")) URL.revokeObjectURL(cropSource);
    setCropSource(null);
  };

  const persistExtras = (next: ClientProfileExtras) => {
    saveProfileExtras(userId, next);
    setExtras(next);
    dispatchProfileUpdated({
      fullName: name.trim(),
      avatarDataUrl: next.avatarDataUrl,
    });
  };

  const handleRemoveAvatar = () => {
    clearProfileAvatar(userId);
    setPreviewAvatar(null);
    setExtras((prev) => ({ ...prev, avatarDataUrl: null }));
    dispatchProfileUpdated({ avatarDataUrl: null });
    toast("Profile photo removed.", "info");
  };

  const handleCancel = () => {
    setName(fullName ?? "");
    setPreviewAvatar(null);
    setExtras(loadProfileExtras(userId));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {cropSource ? (
        <AvatarCropDialog
          imageSrc={cropSource}
          onCancel={closeCrop}
          onConfirm={(dataUrl) => {
            const next = { ...extras, avatarDataUrl: dataUrl };
            persistExtras(next);
            setPreviewAvatar(null);
            closeCrop();
            toast("Profile photo updated.", "success");
          }}
        />
      ) : null}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6D28D9]">
          Account
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          My Profile
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your personal information and profile photo.
        </p>
      </div>

      <GlassCard padding="lg">
        <AuthAlert error={state.error} message={null} />

        <form action={formAction} className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              {mounted && displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt="Profile"
                  width={96}
                  height={96}
                  unoptimized
                  className="h-24 w-24 rounded-2xl object-cover ring-2 ring-[#6D28D9]/20"
                />
              ) : (
                <span className="dash-on-color flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] text-2xl font-bold !text-white shadow-lg">
                  {initials}
                </span>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-xl border border-white bg-[#6D28D9] text-white shadow-md transition-transform hover:scale-105"
                aria-label="Change photo"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
              />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                >
                  Change photo
                </Button>
                {(displayAvatar || previewAvatar) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={pending}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-slate-50 text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={extras.phone}
                onChange={(e) =>
                  setExtras((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={extras.designation}
                onChange={(e) =>
                  setExtras((p) => ({ ...p, designation: e.target.value }))
                }
                placeholder="e.g. Franchise Director"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input
                id="companyName"
                value={extras.companyName}
                onChange={(e) =>
                  setExtras((p) => ({ ...p, companyName: e.target.value }))
                }
                placeholder="Your company"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={extras.location}
                onChange={(e) =>
                  setExtras((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="City, Country"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
