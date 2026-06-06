import { logUploadError } from "@/lib/assets/upload-log";

export function mapAssetError(
  message: string | undefined | null,
  context?: string,
): string {
  if (context && message) {
    logUploadError("MAP_ERROR", new Error(message), { context, raw: message });
  } else if (context && !message) {
    logUploadError("MAP_ERROR", new Error("Empty error message"), { context });
  }

  if (!message) {
    return "Upload failed. Please try again.";
  }

  const lower = message.toLowerCase();

  if (
    lower.includes("bucket") &&
    (lower.includes("not found") || lower.includes("does not exist"))
  ) {
    return "Storage bucket not found. Run storage provisioning or contact support.";
  }

  if (lower.includes("service_role_key") || lower.includes("storage is not configured")) {
    return "File uploads are not configured on the server. Contact support.";
  }

  if (lower.includes("unexpected end of form") || lower.includes("body exceeded")) {
    return "Brochure upload failed. Please try again.";
  }

  if (
    lower.includes("fetch failed") ||
    lower.includes("timed out") ||
    lower.includes("connect timeout") ||
    lower.includes("network error")
  ) {
    return "Brochure upload failed. Please try again.";
  }

  if (lower.includes("brand_assets") && lower.includes("row-level security")) {
    return "Database permission error saving asset metadata. Contact support.";
  }

  if (
    lower.includes("row-level security") ||
    lower.includes("rls") ||
    lower.includes("policy") ||
    lower.includes("permission denied")
  ) {
    return "Permission denied. You may not have access to upload this file.";
  }

  if (
    lower.includes("5mb") ||
    lower.includes("20mb") ||
    lower.includes("1 mb") ||
    lower.includes("body exceeded") ||
    lower.includes("smaller") ||
    lower.includes("too large") ||
    lower.includes("exceeds") ||
    lower.includes("file_size_limit")
  ) {
    return "File exceeds maximum size.";
  }

  if (
    lower.includes("jpg") ||
    lower.includes("png") ||
    lower.includes("webp") ||
    lower.includes("pdf") ||
    lower.includes("allowed") ||
    lower.includes("unsupported") ||
    lower.includes("mime")
  ) {
    return "Unsupported file type.";
  }

  if (lower.includes("maximum") && lower.includes("gallery")) {
    return "Maximum 6 gallery images allowed.";
  }

  if (lower.includes("does not exist") && lower.includes("relation")) {
    return "Database table missing. Run database migrations.";
  }

  if (lower.includes("invalid input value for enum")) {
    if (lower.includes("document")) {
      return "Brochure upload is not configured in the database. Contact support or run migration 011.";
    }
    return "Database schema outdated. Run database migrations.";
  }

  return "Upload failed. Please try again.";
}

export const ASSET_SUCCESS = {
  logoUploaded: "✓ Logo uploaded successfully",
  logoReplaced: "✓ Logo replaced successfully",
  logoRemoved: "✓ Logo removed",
  galleryUploaded: "✓ Gallery image uploaded",
  galleryRemoved: "✓ Gallery image removed",
  brochureUploaded: "✓ Brochure uploaded",
  brochureReplaced: "✓ Brochure replaced",
  brochureRemoved: "✓ Brochure removed",
} as const;

export function failUpload(
  userMessage: string,
  debug: string,
  context: string,
): { error: string; message: null; debug: string } {
  logUploadError(context, new Error(debug), { userMessage });
  return { error: userMessage, message: null, debug };
}
