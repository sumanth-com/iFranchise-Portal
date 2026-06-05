import { MAX_ASSET_SIZE_BYTES } from "@/lib/assets/constants";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export function getFileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot === -1) {
    return "";
  }
  return fileName.slice(dot).toLowerCase();
}

export function validateImageFile(file: File): string | null {
  if (!(file instanceof File) || file.size === 0) {
    return "Please select an image file.";
  }

  if (file.size > MAX_ASSET_SIZE_BYTES) {
    return "Image must be 5MB or smaller.";
  }

  const extension = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return "Only JPG, PNG, and WEBP images are allowed.";
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Only JPG, PNG, and WEBP images are allowed.";
  }

  return null;
}

export function buildStoragePath(
  userId: string,
  brandId: string,
  assetType: "logo" | "gallery",
  fileName: string,
): string {
  const extension = getFileExtension(fileName) || ".jpg";
  const id = crypto.randomUUID();
  return `${userId}/${brandId}/${assetType}/${id}${extension}`;
}
