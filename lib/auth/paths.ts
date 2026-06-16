export const AUTH_PATHS = {
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
} as const;

export const PROTECTED_PATHS = {
  client: "/dashboard",
  admin: "/admin",
} as const;

export const SUPER_ADMIN_ONLY_PATHS = {
  adminManagement: "/admin/admin-management",
} as const;

export function getRedirectPathForRole(role: "client" | "admin" | "super_admin"): string {
  return role === "client" ? PROTECTED_PATHS.client : PROTECTED_PATHS.admin;
}

export function isSuperAdminOnlyPath(pathname: string): boolean {
  return (
    pathname === SUPER_ADMIN_ONLY_PATHS.adminManagement ||
    pathname.startsWith(`${SUPER_ADMIN_ONLY_PATHS.adminManagement}/`)
  );
}

import { isRecoveryPath } from "@/lib/auth/recovery";

export function isAuthPath(pathname: string): boolean {
  return (
    pathname === AUTH_PATHS.login ||
    pathname === AUTH_PATHS.signup ||
    pathname === AUTH_PATHS.forgotPassword
  );
}

export { isRecoveryPath };

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
