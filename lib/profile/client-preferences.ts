"use client";

export type ClientProfileExtras = {
  phone: string;
  designation: string;
  companyName: string;
  location: string;
  avatarDataUrl: string | null;
};

const KEY = "ifranchise-profile-extras";

export function loadProfileExtras(userId: string): ClientProfileExtras {
  if (typeof window === "undefined") {
    return emptyExtras();
  }
  try {
    const raw = localStorage.getItem(`${KEY}-${userId}`);
    if (!raw) return emptyExtras();
    return { ...emptyExtras(), ...JSON.parse(raw) };
  } catch {
    return emptyExtras();
  }
}

export function saveProfileExtras(userId: string, extras: ClientProfileExtras) {
  localStorage.setItem(`${KEY}-${userId}`, JSON.stringify(extras));
}

export function clearProfileAvatar(userId: string) {
  const extras = loadProfileExtras(userId);
  saveProfileExtras(userId, { ...extras, avatarDataUrl: null });
}

function emptyExtras(): ClientProfileExtras {
  return {
    phone: "",
    designation: "",
    companyName: "",
    location: "",
    avatarDataUrl: null,
  };
}

/** Crop image file to square JPEG data URL (max 512px). */
export async function cropImageToSquare(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const size = Math.min(bitmap.width, bitmap.height, 512);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const sx = (bitmap.width - size) / 2;
  const sy = (bitmap.height - size) / 2;
  ctx.drawImage(bitmap, sx, sy, size, size, 0, 0, size, size);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.88);
}
