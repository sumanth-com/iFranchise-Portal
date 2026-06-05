import { MAX_ASSET_SIZE_BYTES } from "@/lib/assets/constants";
import type { AssetType } from "@/types/assets";

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const ALLOWED_DOCUMENT_MIME_TYPES = new Set(["application/pdf"]);
const ALLOWED_DOCUMENT_EXTENSIONS = new Set([".pdf"]);

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
  if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    return "Only JPG, PNG, and WEBP images are allowed.";
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    return "Only JPG, PNG, and WEBP images are allowed.";
  }

  return null;
}

export function validateDocumentFile(file: File): string | null {
  if (!(file instanceof File) || file.size === 0) {
    return "Please select a PDF file.";
  }

  if (file.size > MAX_ASSET_SIZE_BYTES) {
    return "Document must be 5MB or smaller.";
  }

  const extension = getFileExtension(file.name);
  if (!ALLOWED_DOCUMENT_EXTENSIONS.has(extension)) {
    return "Only PDF documents are allowed.";
  }

  if (!ALLOWED_DOCUMENT_MIME_TYPES.has(file.type) && file.type !== "") {
    return "Only PDF documents are allowed.";
  }

  return null;
}

export function buildStoragePath(
  userId: string,
  brandId: string,
  assetType: AssetType,
  fileName: string,
): string {
  const extension = getFileExtension(fileName) || ".jpg";
  const id = crypto.randomUUID();
  return `${userId}/${brandId}/${assetType}/${id}${extension}`;
}
