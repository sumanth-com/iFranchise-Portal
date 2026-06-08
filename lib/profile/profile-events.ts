"use client";

export const PROFILE_UPDATED_EVENT = "profile-updated";

export type ProfileUpdatedDetail = {
  fullName?: string;
  avatarDataUrl?: string | null;
};

export function dispatchProfileUpdated(detail?: ProfileUpdatedDetail) {
  window.dispatchEvent(
    new CustomEvent<ProfileUpdatedDetail>(PROFILE_UPDATED_EVENT, { detail }),
  );
}
