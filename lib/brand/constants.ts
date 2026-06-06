/** Placeholder stored in DB when draft is saved before user enters a brand name. */
export const DRAFT_PLACEHOLDER_BUSINESS_NAME = "Untitled Brand";

export function isDraftPlaceholderName(name: string | null | undefined): boolean {
  return name?.trim() === DRAFT_PLACEHOLDER_BUSINESS_NAME;
}

/** Empty string in forms when DB holds the draft placeholder. */
export function displayBusinessName(name: string | null | undefined): string {
  if (!name || isDraftPlaceholderName(name)) return "";
  return name;
}
