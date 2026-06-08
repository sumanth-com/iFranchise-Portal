import type { Brand } from "@/types/brand";

/** Hours brand owners may edit after initial submission. */
export const POST_SUBMIT_EDIT_WINDOW_HOURS = 12;

const POST_SUBMIT_EDITABLE_STATUSES = new Set<Brand["status"]>([
  "submitted",
  "changes_requested",
]);

export function getPostSubmitEditDeadline(submittedAt: string): Date {
  return new Date(
    new Date(submittedAt).getTime() + POST_SUBMIT_EDIT_WINDOW_HOURS * 60 * 60 * 1000,
  );
}

export function isWithinPostSubmitEditWindow(brand: Brand): boolean {
  if (!brand.submitted_at) {
    return false;
  }
  if (!POST_SUBMIT_EDITABLE_STATUSES.has(brand.status)) {
    return false;
  }
  return Date.now() < getPostSubmitEditDeadline(brand.submitted_at).getTime();
}

export function getEditWindowRemainingMs(brand: Brand): number | null {
  if (!isWithinPostSubmitEditWindow(brand) || !brand.submitted_at) {
    return null;
  }
  return Math.max(0, getPostSubmitEditDeadline(brand.submitted_at).getTime() - Date.now());
}
