/** Local development only — credentials from env, never hardcoded. */
export function getDevAutoLoginCredentials():
  | { email: string; password: string }
  | null {
  const email = process.env.DEV_AUTO_LOGIN_EMAIL?.trim();
  const password = process.env.DEV_AUTO_LOGIN_PASSWORD?.trim();

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

export function isDevAutoLoginEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    getDevAutoLoginCredentials() !== null
  );
}
