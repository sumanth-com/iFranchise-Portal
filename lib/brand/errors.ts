/** Map raw Supabase / Postgres errors to user-safe messages. */
export function mapBrandSaveError(message: string | undefined | null): string {
  if (!message) {
    return "Unable to save your brand. Please try again.";
  }

  const lower = message.toLowerCase();

  if (
    lower.includes("does not exist") ||
    lower.includes("could not find") ||
    lower.includes("schema cache") ||
    lower.includes("column")
  ) {
    return "Some configuration data is unavailable. Please try again later.";
  }

  if (lower.includes("permission") || lower.includes("policy")) {
    return "You do not have permission to save this brand.";
  }

  if (lower.includes("network") || lower.includes("fetch")) {
    return "Connection issue while saving. Please check your network and try again.";
  }

  return "Unable to save your brand. Please try again.";
}

export function mapBrandLoadError(message: string | undefined | null): string {
  if (!message) {
    return "Unable to load your brand. Please refresh and try again.";
  }
  return mapBrandSaveError(message);
}
