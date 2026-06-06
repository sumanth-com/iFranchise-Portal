import type { AssetType, BrandAsset } from "@/types/assets";

/** Brochure rows stored under /document/ in storage (even when enum lacks "document"). */
export function isBrochureAsset(asset: Pick<BrandAsset, "asset_type" | "mime_type" | "storage_path">): boolean {
  if (asset.asset_type === "document") return true;
  return (
    asset.mime_type === "application/pdf" &&
    asset.storage_path.includes("/document/")
  );
}

/** Gallery images only — excludes brochure rows stored as gallery before enum migration. */
export function isGalleryImage(asset: Pick<BrandAsset, "asset_type" | "mime_type" | "storage_path">): boolean {
  if (asset.asset_type !== "gallery") return false;
  return !isBrochureAsset(asset);
}

export function isDocumentEnumError(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return lower.includes("invalid input value for enum") && lower.includes("document");
}

/** DB row type when live DB lacks the document enum value. */
export function brochureStorageAssetType(): AssetType {
  return "gallery";
}
