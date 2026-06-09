import { isWithinPostSubmitEditWindow } from "@/lib/brand/edit-window";
import type { Brand } from "@/types/brand";

export function canOwnerEditBrand(brand: Brand): boolean {
  switch (brand.status) {
    case "draft":
    case "rejected":
    case "changes_requested":
      return true;
    case "submitted":
      return isWithinPostSubmitEditWindow(brand);
    case "approved":
    default:
      return false;
  }
}

export function getOwnerEditBlockReason(brand: Brand): string | null {
  if (brand.status === "approved") {
    return "This listing is approved and locked. Request an update from your brand dashboard.";
  }
  if (brand.status === "submitted" && !isWithinPostSubmitEditWindow(brand)) {
    return "This listing is currently under review and can no longer be edited.";
  }
  return null;
}
