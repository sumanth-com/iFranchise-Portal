export const AUTH_PATHS = {
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
} as const;

export const PROTECTED_PATHS = {
  client: "/dashboard",
  admin: "/admin",
} as const;

export function getRedirectPathForRole(role: "client" | "admin"): string {
  return role === "admin" ? PROTECTED_PATHS.admin : PROTECTED_PATHS.client;
}

export function isAuthPath(pathname: string): boolean {
  return (
    pathname === AUTH_PATHS.login ||
    pathname === AUTH_PATHS.signup ||
    pathname === AUTH_PATHS.forgotPassword
  );
}

export function isProtectedPath(pathname: string): boolean {
  return (
    pathname === PROTECTED_PATHS.client ||
    pathname.startsWith(`${PROTECTED_PATHS.client}/`) ||
    pathname === PROTECTED_PATHS.admin ||
    pathname.startsWith(`${PROTECTED_PATHS.admin}/`)
  );
}

export function isSafeRedirectPath(path: string | null | undefined): path is string {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}
