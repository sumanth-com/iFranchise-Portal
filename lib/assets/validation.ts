import {
  MAX_BROCHURE_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/assets/constants";
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

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "File exceeds maximum size.";
  }

  const extension = getFileExtension(file.name);
  if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    return "Unsupported file type.";
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type) && file.type !== "") {
    return "Unsupported file type.";
  }

  return null;
}

export function validateDocumentFile(file: File): string | null {
  if (!(file instanceof File) || file.size === 0) {
    return "Please select a PDF file.";
  }

  if (file.size > MAX_BROCHURE_SIZE_BYTES) {
    return "File exceeds maximum size.";
  }

  const extension = getFileExtension(file.name);
  if (!ALLOWED_DOCUMENT_EXTENSIONS.has(extension)) {
    return "Unsupported file type.";
  }

  if (!ALLOWED_DOCUMENT_MIME_TYPES.has(file.type) && file.type !== "") {
    return "Unsupported file type.";
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
