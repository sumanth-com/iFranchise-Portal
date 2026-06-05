/** Form errors that describe account/session state — never show on individual fields. */
export function isAccountLevelFormError(error: string | null | undefined): boolean {
  if (!error) {
    return false;
  }

  const lower = error.toLowerCase();

  return (
    lower.includes("profile") ||
    lower.includes("disabled") ||
    lower.includes("contact support") ||
    lower.includes("authentication service") ||
    lower.includes("authentication failed") ||
    lower.includes("admin access") ||
    lower.includes("brand owner") ||
    lower.includes("sign in as") ||
    lower.includes("profile record not found") ||
    lower.includes("unable to connect") ||
    lower.includes("network connection") ||
    lower.includes("authentication service") ||
    lower.includes("not configured")
  );
}

/** Only validation errors tied to a specific field should highlight inputs. */
export function getFieldFormError(
  error: string | null | undefined,
  field: "email" | "password" | "fullName",
): string | undefined {
  if (!error || isAccountLevelFormError(error)) {
    return undefined;
  }

  const lower = error.toLowerCase();

  // Multi-field validation — show in the form alert only, not on inputs.
  if (
    error === "Email and password are required." ||
    error === "Full name, email, and password are required."
  ) {
    return undefined;
  }

  if (field === "fullName" && lower.includes("full name")) {
    return error;
  }

  if (field === "email" && lower.includes("email")) {
    return error;
  }

  if (field === "password" && lower.includes("password")) {
    return error;
  }

  return undefined;
}
